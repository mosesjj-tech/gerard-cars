const Database = require("better-sqlite3");
const path = require("path");

// =====================================================
// DATABASE LOCATION
// =====================================================

const dbPath = path.join(__dirname, "cars.db");

const db = new Database(dbPath);

// Enable foreign keys
db.pragma("foreign_keys = ON");

// =====================================================
// CARS TABLE
// =====================================================

db.exec(`
  CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    brand TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER,
    price REAL NOT NULL,
    description TEXT,
    image TEXT,
    available INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// =====================================================
// VEHICLE GALLERY TABLE
// =====================================================
//
// Each car can have multiple gallery images.
//
// Example:
//
// Toyota Camry
//   ├── Main image
//   ├── Interior
//   ├── Front seats
//   ├── Back seats
//   ├── Side view
//   └── Rear view
//
// The car_id connects every gallery image
// to the correct vehicle.
// =====================================================

db.exec(`
  CREATE TABLE IF NOT EXISTS car_gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    car_id INTEGER NOT NULL,

    image TEXT NOT NULL,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (car_id)
      REFERENCES cars(id)
      ON DELETE CASCADE
  )
`);

// =====================================================
// DATABASE READY MESSAGE
// =====================================================

console.log("🚗 Gerard Cars database is ready!");

console.log("🖼️ Vehicle gallery database is ready!");

// =====================================================
// EXPORT DATABASE
// =====================================================

module.exports = db;
