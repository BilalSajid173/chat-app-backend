const Post = require("../models/post");
const User = require("../models/user");
const { validationResult } = require("express-validator");
const { cloudinary } = require("../utils/cloudinary");

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("Post Creation Failed");
    error.statusCode = 422;
    throw error;
  }
  const content = req.body.content;
  const image = req.body.image;
  let publicId;
  try {
    const response = await cloudinary.uploader.upload(image, {
      upload_preset: "social-app-setup",
    });
    publicId = response.public_id;
  } catch (error) {
    console.log(error);
  }
  let author;

  const post = new Post({
    content: content,
    author: req.userId,
    publicId: publicId,
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

exports.setUserImage = async (req, res, next) => {
  const image = req.body.image;
  let publicId;
  try {
    const response = await cloudinary.uploader.upload(image, {
      upload_preset: "social-app-setup",
    });
    publicId = response.public_id;
  } catch (error) {
    console.log(error);
  }
  User.findById(req.userId)
    .then((user) => {
      user.imageId = publicId;
      return user.save();
    })
    .then((resp) => {
      res.status(200).json({
        message: "success",
        publicId,
      });
    });
};

exports.getAllPosts = (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 5;
  let totalItems;
  let loadedposts;
  let likedPosts;
  let savedPosts;
  Post.find()
    .countDocuments()
    .then((count) => {
      totalItems = count;
      return Post.find()
        .skip((currentPage - 1) * perPage)
        .limit(perPage)
        .populate("author")
        .sort({ createdAt: -1 });
    })
    .then((posts) => {
      loadedposts = posts;
      return User.findById({ _id: req.userId }).populate("friends");
    })
    .then((user) => {
      likedPosts = user.likedPosts;
      savedPosts = user.savedPosts;
      loadedUser = user;
      return User.find().countDocuments();
    })
    .then((count) => {
      var random = Math.floor(Math.random() * (count - 1));
      return User.find().skip(random).limit(5);
    })
    .then((users) => {
      const randompeople = users.filter((user) => user.id !== req.userId);
      res.status(200).json({
        message: "Fetched Posts Successfully!",
        randompeople: randompeople,
        posts: loadedposts,
        user: loadedUser,
        likedPosts: likedPosts,
        totalItems: totalItems,
        savedPosts: savedPosts,
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

exports.savePost = (req, res, next) => {
  const postId = req.params.postId;
  User.findById({ _id: req.userId })
    .then((user) => {
      if (user.savedPosts.includes(postId)) {
        const newSavedPosts = user.savedPosts.filter(
          (id) => id.toString() !== postId
        );
        user.savedPosts = [...newSavedPosts];
      } else {
        user.savedPosts.push(postId);
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
      const savedPosts = user.savedPosts;
      res.status(200).json({
        message: "Fetched Posts Successfully!",
        post: loadedPost,
        posts: loadedPosts.slice(-4),
        user: user,
        likedPosts: likedPosts,
        savedPosts: savedPosts,
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

exports.getComments = (req, res, next) => {
  const postId = req.params.postId;
  Post.findById(postId)
    .then((post) => {
      res.status(200).json({
        comments: post.comments,
        message: "Success",
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
        savedPosts: user.savedPosts,
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
      let roomId;
      const filteredArr = user.chats.filter((chat) => {
        return chat.with.userId === userId;
      });
      if (filteredArr.length > 0) {
        roomId = filteredArr[0].roomId;
      } else {
        roomId = "_" + Math.random().toString(36).substr(2, 11);
      }
      console.log(roomId);
      res.status(200).json({
        roomId: roomId,
        message: "done",
        user: loadedUser,
        likedPosts: user.likedPosts,
        savedPosts: user.savedPosts,
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

exports.getFriends = (req, res, next) => {
  User.findById(req.userId)
    .populate({
      path: "friends",
      populate: {
        path: "posts",
        model: "Post",
        populate: {
          path: "author",
          model: "User",
        },
      },
    })
    .then((user) => {
      res.status(200).json({
        user: user,
        message: "Success",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getMessages = (req, res, next) => {
  const roomId = req.params.roomId;
  const userId = req.params.userId;
  let messages = [];
  let username;
  User.findById(req.userId)
    .then((user) => {
      const filteredArr = user.chats.filter((chat) => {
        return chat.roomId === roomId;
      });
      if (filteredArr.length > 0) {
        // console.log("here");
        messages = filteredArr[0].messages;
        username = filteredArr[0].with.name;
        // console.log(messages, username);
        res.status(200).json({
          message: "Success",
          messages: messages,
          username: username,
        });
      } else {
        User.findById(userId).then((user) => {
          // console.log(user.name);
          username = user.name;
          res.status(200).json({
            message: "Success",
            messages: messages,
            username: username,
          });
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.addMessage = (req, res, next) => {
  const roomId = req.body.roomId;
  const userId = req.body.userId;
  const msg = req.body.content;
  // console.log(roomId, userId, msg);
  User.findById(req.userId)
    .then((user) => {
      const filteredArr = user.chats.filter((chat) => {
        return chat.roomId === roomId;
      });
      if (filteredArr.length > 0) {
        user.chats.forEach((chat) => {
          if (chat.roomId === roomId) {
            chat.messages.push({
              content: msg,
              to: true,
            });
          }
        });
        user.save();
        User.findById(userId).then((user) => {
          user.chats.forEach((chat) => {
            if (chat.roomId === roomId) {
              chat.messages.push({
                content: msg,
                to: false,
              });
            }
          });
          return user.save();
        });
      } else {
        User.findById(userId).then((otheruser) => {
          user.chats.push({
            roomId: roomId,
            with: { userId: userId, name: otheruser.name },
            messages: [{ content: msg, to: true }],
          });
          user.save();
          otheruser.chats.push({
            roomId: roomId,
            with: { userId: req.userId, name: user.name },
            messages: [{ content: msg, to: false }],
          });
          return otheruser.save();
        });
      }
    })
    .then((result) => {
      res.status(200).json({
        message: "Success",
        result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getAllChats = (req, res, next) => {
  const userData = [];
  let counter = 0;
  User.findById(req.userId)
    .then((user) => {
      if (user.chats.length > 0) {
        user.chats.forEach((chat) => {
          const roomId = chat.roomId;
          const withUser = chat.with;
          User.findById(chat.with.userId)
            .then((user) => {
              const obj = {
                imageId: user.imageId,
                address: user.address,
              };
              return obj;
            })
            .then((obj) => {
              userData.push({
                address: obj.address,
                imageId: obj.imageId,
                roomId: roomId,
                withUser: withUser,
              });
              counter++;
              if (counter === user.chats.length) {
                res.status(200).json({
                  userData,
                });
              }
            });
        });
      } else {
        res.status(200).json({
          userData,
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      next(err);
    });
};

exports.getSavedPosts = (req, res, next) => {
  User.findById(req.userId)
    .populate({
      path: "savedPosts",
      populate: {
        path: "author",
        model: "User",
      },
    })
    .then((user) => {
      const likedPosts = user.likedPosts;
      res.status(200).json({
        message: "Success",
        likedPosts: likedPosts,
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
