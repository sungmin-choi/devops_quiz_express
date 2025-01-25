const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
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

module.exports = router;
