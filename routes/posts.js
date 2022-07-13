const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");
const postControllers = require("../controllers/posts");

router.post(
  "/addpost",
  [body("content").trim().isLength({ min: 5 })],
  isAuth,
  postControllers.createPost
);

router.post("/addimage", isAuth, postControllers.setUserImage);

router.get("/allposts", isAuth, postControllers.getAllPosts);

router.get("/likepost/:postId", isAuth, postControllers.likePost);

router.get("/savepost/:postId", isAuth, postControllers.savePost);

router.get("/singlepost/:postId", isAuth, postControllers.getPost);

router.post("/addComment/:postId", isAuth, postControllers.addComment);

router.get("/getComments/:postId", isAuth, postControllers.getComments);

router.get("/account", isAuth, postControllers.userAccount);

router.get("/user/:userId", isAuth, postControllers.ViewProfile);

router.get("/edit-profile", isAuth, postControllers.getEditProfile);

router.post("/edit-profile", isAuth, postControllers.postEditProfile);

router.get("/add-friend/:remove/:userId", isAuth, postControllers.addFriend);

router.get("/friendlist", isAuth, postControllers.getFriends);

router.get("/chat/:roomId/:userId", isAuth, postControllers.getMessages);

router.post("/addmessage", isAuth, postControllers.addMessage);

router.get("/allchats", isAuth, postControllers.getAllChats);

router.get("/savedposts", isAuth, postControllers.getSavedPosts);

module.exports = router;
