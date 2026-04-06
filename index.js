require("dotenv").config();
const express = require("express");
const pool = require("./db");

const app = express();
app.use(express.json());

/* ------------------ BASIC ROUTE ------------------ */
app.get("/", (req, res) => {
  res.send("Inventory API running");
});

/* ------------------ PRODUCTS API ------------------ */

// Add product
app.post("/products", async (req, res) => {
  const { name, category, price } = req.body;

  try {
    const result = await pool.query(
      "INSERT INTO products (name, category, price) VALUES ($1,$2,$3) RETURNING *",
      [name, category, price]
    );

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error adding product");
  }
});

// Get all products
app.get("/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching products");
  }
});

/* ------------------ ORDERS API ------------------ */

app.post("/orders", async (req, res) => {
  const { supplier_id, items } = req.body;

  try {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // Create order
      const orderResult = await client.query(
        "INSERT INTO orders (supplier_id) VALUES ($1) RETURNING id",
        [supplier_id]
      );

      const orderId = orderResult.rows[0].id;

      // Insert order items
      for (let item of items) {
        await client.query(
          "INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1,$2,$3)",
          [orderId, item.product_id, item.quantity]
        );
      }

      await client.query("COMMIT");

      res.json({
        message: "Order placed successfully",
        orderId: orderId
      });

    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error placing order");
  }
});

/* ------------------ START SERVER ------------------ */

app.listen(5000, async () => {
  console.log("Server running on port 5000");

  try {
    await pool.query("SELECT NOW()");
    console.log("DB Connected ✅");
  } catch (err) {
    console.error("DB Error ❌", err.message);
  }
});

