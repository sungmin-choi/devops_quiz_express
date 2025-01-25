const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { categoryId, difficultyId, count, mode } = req.query;

    const [rows] = await pool.query(`
        SELECT
            q.*,
            q.id AS q_id,
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
      if (!questions[row.q_id]) {
        questions[row.q_id] = {
          questionId: row.q_id,
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
          questions[row.q_id].options = [];
        } else {
          questions[row.q_id].options = null;
        }
      }
      if (row.option_id) {
        questions[row.q_id].options.push(row.option_text);
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

router.get("/ids", async (req, res) => {
  try {
    const { ids, difficultyId, mode } = req.query;
    const [rows] = await pool.query(`SELECT
            q.*,
            q.id AS q_id,
            qo.id AS option_id,
            qo.*
        FROM
            questions q
        LEFT JOIN
            question_options qo ON q.id = qo.question_id
        WHERE
            q.id IN (${ids})
             ${
               difficultyId === "3"
                 ? ``
                 : `AND q.difficulty_id = ${difficultyId}`
             }`);
    const questions = {};

    rows.forEach((row) => {
      if (!questions[row.q_id]) {
        questions[row.q_id] = {
          questionId: row.q_id,
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
          questions[row.q_id].options = [];
        } else {
          questions[row.q_id].options = null;
        }
      }
      if (row.option_id) {
        questions[row.q_id].options.push(row.option_text);
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

    res.json(result);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
