const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const postControllers = require("../controllers/posts");

router.post(
  "/addpost",
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  isAuth,
  postControllers.createPost
);

module.exports = router;
