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

router.get("/allposts", isAuth, postControllers.getAllPosts);

router.get("/likepost/:postId", isAuth, postControllers.likePost);

router.get("/singlepost/:postId", isAuth, postControllers.getPost);
module.exports = router;
