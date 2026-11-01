import path from "path";
import Database from "better-sqlite3";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, "../database/dev.sqlite");

let db;
try {
  db = new Database(dbPath);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  console.log("Connected to the SQLite database.");
} catch (err) {
  console.error("Error opening SQLite database:", err.message);
  process.exit(1);
}

function initTables() {
  // Products Table
  db.exec(`CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    base_price REAL NOT NULL,
    description TEXT
  )`);

  // Configurations Table (Stores custom 3D choices)
  db.exec(`CREATE TABLE IF NOT EXISTS configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER,
    color TEXT NOT NULL,
    material TEXT NOT NULL,
    total_price REAL NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id)
  )`);

  // Seed default product if empty
  const { count } = db.prepare("SELECT COUNT(*) AS count FROM products").get();
  if (count === 0) {
    db.prepare(
      "INSERT INTO products (name, base_price, description) VALUES (?, ?, ?)",
    ).run(
      "Nexus 3D Pro Sneaker",
      150.0,
      "Customizable 3D model with PBR material shaders",
    );
  }
}

initTables();

export default db;
