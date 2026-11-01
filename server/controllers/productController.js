import db from "../config/database.js";
import { allowedColors, materialAddOns } from "../config/pricing.js";

// Get product catalog info
export const getProductInfo = (req, res) => {
  try {
    const row = db.prepare("SELECT * FROM products LIMIT 1").get();
    res.json({ success: true, product: row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Save custom 3D configuration order
export const saveConfiguration = (req, res) => {
  const { productId = 1, color, material } = req.body || {};

  if (!Number.isInteger(Number(productId)) || !allowedColors.includes(color) || !Object.hasOwn(materialAddOns, material)) {
    return res.status(400).json({ error: "Invalid product, color, or material" });
  }

  try {
    const product = db.prepare("SELECT base_price FROM products WHERE id = ?").get(Number(productId));
    if (!product) return res.status(400).json({ error: "Invalid product" });
    const totalPrice = Number(product.base_price) + materialAddOns[material];
    const result = db
      .prepare(
        `INSERT INTO configurations (product_id, color, material, total_price)
         VALUES (?, ?, ?, ?)`,
      )
      .run(Number(productId), color, material, totalPrice);

    res.status(201).json({
      success: true,
      configurationId: Number(result.lastInsertRowid),
      totalPrice,
      message: "Configuration saved successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getConfigurations = (_req, res) => {
  try {
    const configurations = db.prepare(
      `SELECT c.id, c.product_id AS productId, c.color, c.material,
              c.total_price AS totalPrice, c.created_at AS createdAt,
              p.name AS productName
       FROM configurations c LEFT JOIN products p ON p.id = c.product_id
       ORDER BY c.created_at DESC, c.id DESC LIMIT 20`,
    ).all();
    res.json({ success: true, configurations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteConfiguration = (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id < 1) return res.status(400).json({ error: "Invalid configuration id" });
  try {
    const result = db.prepare("DELETE FROM configurations WHERE id = ?").run(id);
    if (!result.changes) return res.status(404).json({ error: "Configuration not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
