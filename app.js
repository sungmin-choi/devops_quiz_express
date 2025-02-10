require("dotenv").config();
const express = require("express");
const mysql = require("mysql2/promise");
const routes = require("./routes");

const app = express();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

// pool을 전역으로 사용할 수 있도록 설정
global.pool = pool;

app.use("/", routes);

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});

app.get("/", (req, res) => {
  res.send("Server is running!");
});

// // MySQL 쿼리 예시
// app.get("/questions", async (req, res) => {
//   try {
//     const [rows] = await pool.query("SELECT * FROM questions");
//     res.json(rows);
//   } catch (err) {
//     console.error("Database Error:", err);
//     res.status(500).json({ error: err.message });
//   }
// });
