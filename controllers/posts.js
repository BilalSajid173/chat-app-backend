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

exports.getPost = (req, res, next) => {
  const postId = req.params.postId;
  let loadedPost;
  let loadedPosts;

  Post.findById({ _id: postId })
    .populate("author")
    .then((post) => {
      if (!post) {
        const error = new Error("Failed");
        error.statusCode = 401;
        throw error;
      }
      loadedPost = post;
      return Post.find().populate("author");
    })
    .then((posts) => {
      if (!posts) {
        const error = new Error("Failed");
        error.statusCode = 401;
        throw error;
      }
      loadedPosts = posts;
      return User.findById({ _id: req.userId });
    })
    .then((user) => {
      const likedPosts = user.likedPosts;
      res.status(200).json({
        message: "Fetched Posts Successfully!",
        post: loadedPost,
        posts: loadedPosts.slice(-4),
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

exports.addComment = (req, res, next) => {
  const postId = req.params.postId;
  const comment = req.body.comment;
  let loadedUser;
  User.findById({ _id: req.userId })
    .then((user) => {
      loadedUser = user;
      return Post.findById({ _id: postId });
    })
    .then((post) => {
      post.comments.push({
        name: loadedUser.name,
        comment: comment,
      });
      return post.save();
    })
    .then((result) => {
      res.status(201).json({
        _id: result.comments.slice(-1)[0].id,
        message: "Success",
        name: loadedUser.name,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.userAccount = (req, res, next) => {
  User.findById({ _id: req.userId })
    .populate("posts")
    .then((user) => {
      if (!user) {
        const error = new Error("Failed");
        error.statusCode = 401;
        throw error;
      }
      res.status(200).json({
        message: "done",
        user: user,
        likedPosts: user.likedPosts,
        posts: user.posts,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.ViewProfile = (req, res, next) => {
  const userId = req.params.userId;
  let loadedUser;
  let isFriend;
  User.findById({ _id: userId })
    .populate("posts")
    .then((user) => {
      if (!user) {
        const error = new Error("Failed");
        error.statusCode = 401;
        throw error;
      }
      loadedUser = user;
      return User.findById({ _id: req.userId });
    })
    .then((user) => {
      if (user.friends.includes(userId)) {
        isFriend = true;
      } else {
        isFriend = false;
      }
      res.status(200).json({
        message: "done",
        user: loadedUser,
        likedPosts: user.likedPosts,
        posts: loadedUser.posts,
        loggedInUser: req.userId,
        isFriend: isFriend,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getEditProfile = (req, res, next) => {
  User.findById({ _id: req.userId })
    .then((user) => {
      if (!user) {
        const error = new Error("Failed");
        error.statusCode = 401;
        throw error;
      }
      res.status(200).json({
        user: user,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.postEditProfile = (req, res, next) => {
  const email = req.body.email;
  const name = req.body.name;
  const address = req.body.address;
  const bio = req.body.bio;
  const number = req.body.number;
  const linkedIn = req.body.linkedIn;
  const github = req.body.github;

  User.findOneAndUpdate(
    { _id: req.userId },
    { email, name, address, bio, number, linkedIn, github },
    { new: true }
  )
    .then((user) => {
      console.log(user);
      if (!user) {
        const error = new Error("Failed");
        error.statusCode = 401;
        throw error;
      }
      res.status(201).json({
        message: "Success",
        user,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addFriend = (req, res, next) => {
  const remove = req.params.remove;
  const userId = req.params.userId;
  User.findById({ _id: req.userId })
    .then((user) => {
      if (remove === "true") {
        const newFriends = user.friends.filter(
          (id) => id.toString() !== userId
        );
        user.friends = [...newFriends];
      } else {
        user.friends.push(userId);
      }
      return user.save();
    })
    .then((result) => {
      res.status(200).json({
        message: "success",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};
