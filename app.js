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

app.get("/questions", async (req, res) => {
  try {
    const { categoryId, difficultyId, count, mode } = req.query;

    const [rows] = await pool.query(`
        SELECT 
            q.*,
            qo.id AS option_id,
            qo.*
        FROM 
            questions q 
        LEFT JOIN 
            question_options qo ON q.id = qo.question_id
        WHERE 
            q.category_id = ${categoryId} 
        ${difficultyId === "3" ? `` : `AND q.difficulty_id = ${difficultyId}`} 
        ORDER BY q.id
       `);

    const questions = {};

    rows.forEach((row) => {
      if (!questions[row.question_id]) {
        questions[row.question_id] = {
          questionId: row.question_id,
          questionText: row.question_text,
          categoryId: row.category_id,
          questionTypeId: row.question_type_id,
          difficultyId: row.difficulty_id,
          subText: row.sub_text,
          imageUrl: row.image_url,
          referenceLink: row.reference_link,
          explanationText: row.explanation_text,
          answer: row.answer,
        };
        if (row.question_type_id === 1 || row.question_type_id === 2) {
          questions[row.question_id].options = [];
        } else {
          questions[row.question_id].options = null;
        }
      }
      if (row.option_id) {
        questions[row.question_id].options.push(row.option_text);
      }
    });

    var result = Object.values(questions).map((question) => {
      if (question.options) {
        question.options = question.options.sort(() => Math.random() - 0.5);
      }
      return question;
    });

    if (mode === "random") {
      result.sort(() => Math.random() - 0.5);
    }

    if (parseInt(count)) {
      result = result.slice(0, parseInt(count));
    }

    res.json(result);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: err.message });
  }
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
