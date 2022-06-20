const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const postControllers = require("../controllers/posts");

const router = express.Router();

router.post(
  "/add-post",
  [
    body("title").trim().isLength({ min: 0 }),
    body("content").trim().isLength({ min: 0 }),
  ],
  isAuth,
  postControllers.createPost
);

module.exports = router;
