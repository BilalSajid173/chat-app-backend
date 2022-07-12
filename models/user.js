const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  address: {
    type: String,
  },
  linkedIn: {
    type: String,
  },
  github: {
    type: String,
  },
  bio: {
    type: String,
  },
  number: {
    type: Number,
  },
  friends: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  likedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  savedPosts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
  imageId: {
    type: String,
  },
  chats: [
    {
      roomId: {
        type: String,
      },
      with: {
        userId: {
          type: String,
        },
        name: {
          type: String,
        },
      },
      messages: [
        {
          content: {
            type: String,
          },
          to: {
            type: Boolean,
          },
        },
      ],
    },
  ],
});

module.exports = mongoose.model("User", UserSchema);
