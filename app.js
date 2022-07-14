const express = require("express");
const app = express();
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const http = require("http");
const server = http.createServer(app);
const io = require("socket.io")(server, { cors: { origin: "*" } });
require("dotenv").config();
io.on("connection", (socket) => {
  socket.on("joinroom", (roomid) => {
    socket.join(roomid);
    socket.to(roomid).emit("online");
  });

  socket.on("message", (msg, roomid) => {
    socket.to(roomid).emit("sendmsg", msg);
  });
});

app.use(bodyparser.json({ limit: "50mb" }));

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

let port = process.env.PORT;
if (port == null || port == "") {
  port = 8080;
}

const dburl = process.env.DB_URL;

mongoose
  .connect(dburl)
  .then((result) => {
    server.listen(port);
  })
  .catch((err) => {
    console.log(err);
  });
