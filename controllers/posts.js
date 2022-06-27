const Post = require("../models/post");
const User = require("../models/user");
const { validationResult } = require("express-validator");

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Post Creation Failed");
    error.statusCode = 422;
    throw error;
  }
  const title = req.body.title;
  const content = req.body.content;
  let author;

  const post = new Post({
    title: title,
    content: content,
    author: req.userId,
  });

  post
    .save()
    .then((result) => {
      return User.findById(req.userId);
    })
    .then((user) => {
      author = user;
      user.posts.push(post);
      return user.save();
    })
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully",
        post: post,
        author: { _id: author._id, name: author.name },
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getAllPosts = (req, res, next) => {
  let loadedposts;
  Post.find()
    .populate("author")
    .then((posts) => {
      loadedposts = posts;
      return User.findById({ _id: req.userId });
    })
    .then((user) => {
      const likedPosts = user.likedPosts;
      res.status(200).json({
        message: "Fetched Posts Successfully!",
        posts: loadedposts,
        user: user,
        likedPosts: likedPosts,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.likePost = (req, res, next) => {
  const postId = req.params.postId;
  User.findById({ _id: req.userId })
    .then((user) => {
      if (user.likedPosts.includes(postId)) {
        const newLikedPosts = user.likedPosts.filter(
          (id) => id.toString() !== postId
        );
        user.likedPosts = [...newLikedPosts];
      } else {
        user.likedPosts.push(postId);
      }
      return user.save();
    })
    .then((result) => {
      res.status(201).json({ message: "Successful" });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
