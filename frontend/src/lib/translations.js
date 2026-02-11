/**
 * Translate a category name from the DB (English) to the current language.
 * Falls back to the raw value if no translation exists.
 */
export function translateCategory(t, categoryName) {
  const key = `categories.${categoryName}`
  const translated = t(key)
  return translated === key ? categoryName : translated
}

/**
 * Translate a condition slug from the DB to a human-readable label.
 */
export function translateCondition(t, condition) {
  const key = `conditions.${condition}`
  const translated = t(key)
  return translated === key ? condition : translated
}

/**
 * Translate an order status from the DB.
 */
export function translateStatus(t, status) {
  const key = `statuses.${status}`
  const translated = t(key)
  return translated === key ? status : translated
}
