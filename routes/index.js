const express = require("express");
const router = express.Router();

const questionRoutes = require("./questions");
const categoryRoutes = require("./categories");

router.use("/questions", questionRoutes);
router.use("/categories", categoryRoutes);

module.exports = router;
