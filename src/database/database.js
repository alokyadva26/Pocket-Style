/**
 * =============================================================================
 * PocketStylist — SQLite Database Layer
 * =============================================================================
 * 
 * Manages the local SQLite database for offline-first storage.
 * Handles schema creation, CRUD operations for clothing items,
 * and query filters for the outfit generator engine.
 * 
 * Database Schema:
 *   clothing_items:
 *     - id (TEXT PRIMARY KEY) — UUID
 *     - name (TEXT) — User-given name for the item
 *     - category (TEXT) — tops | bottoms | footwear | accessories
 *     - occasions (TEXT) — JSON array of occasion tags
 *     - imagePath (TEXT) — Local file path to the image
 *     - color (TEXT) — Optional dominant color note
 *     - createdAt (TEXT) — ISO timestamp
 */

import * as SQLite from 'expo-sqlite';

// Database singleton reference
let db = null;

/**
 * Opens (or creates) the SQLite database and returns the connection.
 * Uses the synchronous expo-sqlite API (SDK 54+).
 */
export async function getDatabase() {
  if (db) return db;

  db = await SQLite.openDatabaseAsync('pocketstylist.db');

  // Create the clothing_items table if it doesn't exist
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS clothing_items (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('topwear', 'bottomwear', 'footwear', 'accessory')),
      occasions TEXT NOT NULL DEFAULT '[]',
      imagePath TEXT NOT NULL,
      color TEXT DEFAULT '',
      createdAt TEXT NOT NULL
    );
  `);

  return db;
}

/**
 * Inserts a new clothing item into the database.
 * @param {Object} item — The clothing item to insert.
 * @returns {Object} The inserted item.
 */
export async function insertClothingItem(item) {
  const database = await getDatabase();
  const { id, name, category, occasions, imagePath, color, createdAt } = item;

  await database.runAsync(
    `INSERT INTO clothing_items (id, name, category, occasions, imagePath, color, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, name, category, JSON.stringify(occasions), imagePath, color || '', createdAt]
  );

  return item;
}

/**
 * Retrieves all clothing items from the database.
 * Parses the JSON occasions field back into an array.
 * @returns {Array<Object>} All clothing items.
 */
export async function getAllClothingItems() {
  const database = await getDatabase();
  const results = await database.getAllAsync('SELECT * FROM clothing_items ORDER BY createdAt DESC');

  return results.map(parseItem);
}

/**
 * Retrieves clothing items filtered by category.
 * @param {string} category — The category to filter by.
 * @returns {Array<Object>} Filtered clothing items.
 */
export async function getItemsByCategory(category) {
  const database = await getDatabase();
  const results = await database.getAllAsync(
    'SELECT * FROM clothing_items WHERE category = ? ORDER BY createdAt DESC',
    [category]
  );

  return results.map(parseItem);
}

/**
 * Retrieves clothing items filtered by category AND occasion.
 * Uses JSON array search to match occasion tags.
 * @param {string} category — The category to filter by.
 * @param {string} occasion — The occasion tag to match.
 * @returns {Array<Object>} Matching clothing items.
 */
export async function getItemsByCategoryAndOccasion(category, occasion) {
  const database = await getDatabase();

  // SQLite doesn't have native JSON array search, so we use LIKE
  // with the JSON string format to match occasion tags
  const results = await database.getAllAsync(
    `SELECT * FROM clothing_items 
     WHERE category = ? AND occasions LIKE ?
     ORDER BY createdAt DESC`,
    [category, `%"${occasion}"%`]
  );

  return results.map(parseItem);
}

/**
 * Deletes a clothing item by its ID.
 * @param {string} id — The UUID of the item to delete.
 */
export async function deleteClothingItem(id) {
  const database = await getDatabase();
  await database.runAsync('DELETE FROM clothing_items WHERE id = ?', [id]);
}

/**
 * Updates an existing clothing item.
 * @param {Object} item — The clothing item with updated fields.
 */
export async function updateClothingItem(item) {
  const database = await getDatabase();
  const { id, name, category, occasions, color } = item;

  await database.runAsync(
    `UPDATE clothing_items 
     SET name = ?, category = ?, occasions = ?, color = ?
     WHERE id = ?`,
    [name, category, JSON.stringify(occasions), color || '', id]
  );
}

/**
 * Gets the count of items per category (for dashboard stats).
 * @returns {Object} Counts keyed by category.
 */
export async function getCategoryCounts() {
  const database = await getDatabase();
  const results = await database.getAllAsync(
    'SELECT category, COUNT(*) as count FROM clothing_items GROUP BY category'
  );

  const counts = { tops: 0, bottoms: 0, footwear: 0, accessories: 0 };
  results.forEach((row) => {
    let cat = row.category;
    if (cat === 'topwear') cat = 'tops';
    if (cat === 'bottomwear') cat = 'bottoms';
    if (cat === 'accessory') cat = 'accessories';
    counts[cat] = row.count;
  });

  return counts;
}

/**
 * Helper: Parses a raw database row into a clean item object.
 * Converts the JSON occasions string back into an array.
 */
function parseItem(row) {
  return {
    ...row,
    occasions: JSON.parse(row.occasions || '[]'),
  };
}
