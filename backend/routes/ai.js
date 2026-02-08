const express = require('express');
const createRateLimit = require('../middleware/rateLimit');
const ai = require('../services/ai');

module.exports = function (authenticate) {
  const router = express.Router();

  // Graceful degradation: if no API key, all endpoints return 503
  if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
    router.use((req, res) => {
      res.status(503).json({ success: false, message: 'AI features are not configured. Set ANTHROPIC_API_KEY to enable.' });
    });
    return router;
  }

  // ─── POST /api/ai/chat ──────────────────────────────────────
  router.post('/chat', createRateLimit({ max: 30 }), async (req, res) => {
    try {
      const { messages } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ success: false, message: 'messages array is required' });
      }

      // Sanitize messages: only allow role + content
      const cleanMessages = messages
        .filter(m => m.role && m.content)
        .map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.content) }));

      if (cleanMessages.length === 0) {
        return res.status(400).json({ success: false, message: 'At least one valid message is required' });
      }

      const result = await ai.chat(cleanMessages);
      res.json({
        success: true,
        reply: result.reply,
        products: result.products,
        updatedMessages: result.updatedMessages,
      });
    } catch (err) {
      console.error('AI chat error:', err.message);
      res.status(500).json({ success: false, message: 'AI service error. Please try again.' });
    }
  });

  // ─── POST /api/ai/search ───────────────────────────────────
  router.post('/search', createRateLimit({ max: 15 }), async (req, res) => {
    try {
      const { query } = req.body;
      if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, message: 'query string is required' });
      }

      const result = await ai.smartSearch(query.substring(0, 500));
      res.json({
        success: true,
        filters: result.filters,
        products: result.products,
        pagination: result.pagination,
        summary: result.summary,
      });
    } catch (err) {
      console.error('AI search error:', err.message);
      res.status(500).json({ success: false, message: 'AI search error. Please try again.' });
    }
  });

  // ─── GET /api/ai/recommendations/:productId ────────────────
  router.get('/recommendations/:productId', createRateLimit({ max: 20 }), async (req, res) => {
    try {
      const result = await ai.getRecommendations(req.params.productId);
      res.json({
        success: true,
        products: result.products,
        explanation: result.explanation,
      });
    } catch (err) {
      console.error('AI recommendations error:', err.message);
      if (err.message === 'Product not found') {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      res.status(500).json({ success: false, message: 'AI recommendations error. Please try again.' });
    }
  });

  // ─── POST /api/ai/cart-recommendations ─────────────────────
  router.post('/cart-recommendations', createRateLimit({ max: 20 }), async (req, res) => {
    try {
      const { items } = req.body;
      if (!items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, message: 'items array is required' });
      }

      const result = await ai.getCartRecommendations(items);
      res.json({
        success: true,
        products: result.products,
        explanation: result.explanation,
      });
    } catch (err) {
      console.error('AI cart recommendations error:', err.message);
      res.status(500).json({ success: false, message: 'AI recommendations error. Please try again.' });
    }
  });

  // ─── POST /api/ai/generate-description ─────────────────────
  router.post('/generate-description', authenticate, createRateLimit({ max: 10 }), async (req, res) => {
    try {
      if (req.user.role !== 'vendor' && req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Only vendors and admins can generate descriptions' });
      }

      const { name, brand, category, condition, price, tags } = req.body;
      if (!name) {
        return res.status(400).json({ success: false, message: 'Product name is required' });
      }

      const description = await ai.generateDescription({ name, brand, category, condition, price, tags });
      res.json({ success: true, description });
    } catch (err) {
      console.error('AI description error:', err.message);
      res.status(500).json({ success: false, message: 'AI description error. Please try again.' });
    }
  });

  return router;
};
