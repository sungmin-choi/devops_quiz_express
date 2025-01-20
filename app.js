require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const app = express();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

app.get("/categories", async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT
    c.id,
    c.title,
    c.subtitle,
    c.image_url,
    COUNT(q.id) AS total_question_count,
    SUM(CASE WHEN q.difficulty_id = 1 THEN 1 ELSE 0 END) AS easy_question_count,
    SUM(CASE WHEN q.difficulty_id = 2 THEN 1 ELSE 0 END) AS medium_question_count
FROM 
    categories c
LEFT JOIN 
    questions q ON c.id = q.category_id
WHERE
    c.is_display = 1
GROUP BY 
    c.id, c.title, c.subtitle
ORDER BY 
    c.id;`);
    res.json(rows);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// MySQL 쿼리 예시
app.get("/questions", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM questions");
    res.json(rows);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
