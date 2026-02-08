const Anthropic = require('@anthropic-ai/sdk');
const db = require('../db/queries');

const client = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null;

const MODEL = 'claude-opus-4-6';

// ─── Tool Definitions for Chat ──────────────────────────────────

const chatTools = [
  {
    name: 'search_products',
    description: 'Search for products in the marketplace by keyword, category, price range, condition, or brand. Use this when a user asks about products or wants to find items.',
    input_schema: {
      type: 'object',
      properties: {
        search:    { type: 'string', description: 'Search keywords (e.g. "wireless headphones")' },
        category:  { type: 'string', description: 'Product category (e.g. "Electronics", "Home & Kitchen")' },
        minPrice:  { type: 'number', description: 'Minimum price filter' },
        maxPrice:  { type: 'number', description: 'Maximum price filter' },
        condition: { type: 'string', description: 'Product condition: new, like-new, open-box, refurbished, used' },
        brand:     { type: 'string', description: 'Brand name' },
        sort:      { type: 'string', enum: ['price_asc', 'price_desc', 'rating', 'name'], description: 'Sort order' },
        limit:     { type: 'number', description: 'Max results to return (default 6)' },
      },
    },
  },
  {
    name: 'get_product',
    description: 'Get full details of a specific product by its ID. Use when a user asks about a specific product.',
    input_schema: {
      type: 'object',
      properties: {
        productId: { type: 'string', description: 'The product ID (e.g. "p1")' },
      },
      required: ['productId'],
    },
  },
  {
    name: 'get_categories',
    description: 'Get all available product categories. Use when a user asks what categories are available or wants to browse.',
    input_schema: {
      type: 'object',
      properties: {},
    },
  },
];

// ─── Tool Handlers ──────────────────────────────────────────────

async function handleTool(toolName, input) {
  switch (toolName) {
    case 'search_products': {
      const filters = {
        search: input.search,
        category: input.category,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        condition: input.condition,
        brand: input.brand,
        sort: input.sort,
        limit: input.limit || 6,
        page: 1,
      };
      const result = await db.products.findWithFilters(filters);
      return JSON.stringify({
        products: result.products.map(p => ({
          id: p.id, name: p.name, price: p.price, category: p.category,
          brand: p.brand, condition: p.condition, rating: p.rating,
          description: p.description?.substring(0, 150),
          images: p.images?.slice(0, 1),
        })),
        total: result.pagination.total,
      });
    }
    case 'get_product': {
      const product = await db.products.findById(input.productId);
      if (!product) return JSON.stringify({ error: 'Product not found' });
      return JSON.stringify(product);
    }
    case 'get_categories': {
      const categories = await db.categories.findAll();
      return JSON.stringify(categories);
    }
    default:
      return JSON.stringify({ error: 'Unknown tool' });
  }
}

// ─── Chat ───────────────────────────────────────────────────────

async function chat(messages) {
  if (!client) throw new Error('AI service unavailable');

  const systemPrompt = `You are a helpful shopping assistant for Good Open Box, an online marketplace specializing in open-box, refurbished, and discounted products.

Your job is to help customers find products, answer questions about items, and provide recommendations. Be friendly, concise, and helpful.

When users ask about products, use the available tools to search the database. Present results in a clear, helpful way with prices and key details. If products are found, always mention their condition and any savings compared to retail price.

Do not make up products - only reference items found through tool searches. If no products match, say so honestly and suggest alternative searches.`;

  const apiMessages = messages.map(m => ({
    role: m.role,
    content: m.content,
  }));

  let response;
  let productsFound = [];
  const MAX_TOOL_ROUNDS = 3;

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    response = await client.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: systemPrompt,
      messages: apiMessages,
      tools: chatTools,
    });

    // If no tool use, we're done
    if (response.stop_reason !== 'tool_use') break;

    // Process tool calls
    const assistantContent = response.content;
    apiMessages.push({ role: 'assistant', content: assistantContent });

    const toolResults = [];
    for (const block of assistantContent) {
      if (block.type === 'tool_use') {
        const result = await handleTool(block.name, block.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: block.id,
          content: result,
        });

        // Track products found for the response
        if (block.name === 'search_products') {
          try {
            const parsed = JSON.parse(result);
            if (parsed.products) productsFound.push(...parsed.products);
          } catch {}
        }
      }
    }

    apiMessages.push({ role: 'user', content: toolResults });
  }

  // Extract text reply
  const reply = response.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n');

  return { reply, products: productsFound, updatedMessages: apiMessages };
}

// ─── Smart Search ───────────────────────────────────────────────

async function smartSearch(query) {
  if (!client) throw new Error('AI service unavailable');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: `You are a search query parser for an e-commerce marketplace. Extract structured filters from the user's natural language search query.

Available categories: Electronics, Home & Kitchen, Sports & Outdoors, Fashion, Toys & Games, Beauty & Personal Care, Automotive, Office & School, Baby & Kids, Patio & Garden
Available conditions: new, like-new, open-box, refurbished, used

Respond with ONLY a JSON object (no markdown, no explanation) with these optional fields:
- search: keyword string for text matching
- category: one of the available categories if mentioned/implied
- minPrice: minimum price if mentioned
- maxPrice: maximum price if mentioned
- condition: one of the available conditions if mentioned
- brand: brand name if mentioned
- sort: one of "price_asc", "price_desc", "rating" if the user implies a sort preference`,
    messages: [{ role: 'user', content: query }],
  });

  const text = response.content[0].text.trim();
  let filters;
  try {
    filters = JSON.parse(text);
  } catch {
    // Fallback: just use the query as a search term
    filters = { search: query };
  }

  const result = await db.products.findWithFilters({ ...filters, page: 1, limit: 20 });

  // Generate a summary
  const summaryResponse = await client.messages.create({
    model: MODEL,
    max_tokens: 200,
    system: 'You are a helpful shopping assistant. Write a brief, friendly 1-2 sentence summary of search results. Be concise.',
    messages: [{
      role: 'user',
      content: `User searched for: "${query}". Found ${result.pagination.total} products. Top results: ${result.products.slice(0, 3).map(p => `${p.name} ($${p.price})`).join(', ')}${result.products.length === 0 ? 'No products found.' : ''}`,
    }],
  });

  return {
    filters,
    products: result.products,
    pagination: result.pagination,
    summary: summaryResponse.content[0].text,
  };
}

// ─── Recommendations ────────────────────────────────────────────

async function getRecommendations(productId) {
  if (!client) throw new Error('AI service unavailable');

  const [product, catalog] = await Promise.all([
    db.products.findById(productId),
    db.products.findAllCompact(),
  ]);

  if (!product) throw new Error('Product not found');

  // Filter out the current product from catalog
  const candidates = catalog.filter(p => p.id !== productId);

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: `You are a product recommendation engine. Given a target product and a catalog of available products, select the 4-6 most relevant products a customer might also be interested in.

Consider: same category, similar price range, complementary items, same brand, similar tags.

Respond with ONLY a JSON object (no markdown): { "ids": ["p1", "p2", ...], "explanation": "brief explanation of why these were chosen" }`,
    messages: [{
      role: 'user',
      content: `Target product: ${JSON.stringify({ id: product.id, name: product.name, category: product.category, brand: product.brand, price: product.price, tags: product.tags, condition: product.condition })}

Available products:\n${JSON.stringify(candidates)}`,
    }],
  });

  const text = response.content[0].text.trim();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { products: [], explanation: 'Could not generate recommendations.' };
  }

  const recommended = await db.products.findByIds(parsed.ids || []);
  return { products: recommended, explanation: parsed.explanation || '' };
}

// ─── Cart Recommendations ───────────────────────────────────────

async function getCartRecommendations(items) {
  if (!client) throw new Error('AI service unavailable');

  const catalog = await db.products.findAllCompact();
  const cartIds = items.map(i => i.productId);
  const candidates = catalog.filter(p => !cartIds.includes(p.id));

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 512,
    system: `You are a product recommendation engine for a shopping cart. Given the items in a customer's cart and available products, suggest 4-6 complementary products they might want to add.

Consider: complementary items, accessories, items frequently bought together, similar category items.

Respond with ONLY a JSON object (no markdown): { "ids": ["p1", "p2", ...], "explanation": "brief explanation" }`,
    messages: [{
      role: 'user',
      content: `Cart items: ${JSON.stringify(items)}

Available products:\n${JSON.stringify(candidates)}`,
    }],
  });

  const text = response.content[0].text.trim();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { products: [], explanation: 'Could not generate recommendations.' };
  }

  const recommended = await db.products.findByIds(parsed.ids || []);
  return { products: recommended, explanation: parsed.explanation || '' };
}

// ─── Description Generator ─────────────────────────────────────

async function generateDescription({ name, brand, category, condition, price, tags }) {
  if (!client) throw new Error('AI service unavailable');

  const response = await client.messages.create({
    model: MODEL,
    max_tokens: 300,
    system: `You are a product copywriter for Good Open Box, an online marketplace for open-box and discounted products. Write compelling, accurate product descriptions that highlight value and condition.

Keep descriptions to 2-3 short paragraphs. Be professional but friendly. Mention the condition and value proposition. Do not use excessive superlatives or make claims you can't verify.`,
    messages: [{
      role: 'user',
      content: `Write a product description for:
- Name: ${name}
- Brand: ${brand || 'N/A'}
- Category: ${category || 'General'}
- Condition: ${condition || 'open-box'}
- Price: $${price || 'N/A'}
- Tags: ${tags?.join(', ') || 'none'}`,
    }],
  });

  return response.content[0].text;
}

module.exports = { chat, smartSearch, getRecommendations, getCartRecommendations, generateDescription };
