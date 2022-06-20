const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");

const app = express();

app.use(bodyparser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorisation");
  next();
});

app.use("/auth", authRoutes);
app.use("/post", postRoutes);

app.use((error, req, res, next) => {
  const message = error.message;
  const data = error.data;
  res.status(error.statusCode).json({ message: message, data: data });
});

mongoose
  .connect("mongodb://localhost:27017/chat-app-db")
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
