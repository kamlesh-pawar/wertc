'use strict';

var os = require('os');
const { createServer } = require("http");
var socketIO = require('socket.io');
var express = require('express');
 
const app = express();
app.use(express.json({ extended: false }));
app.use(express.static('public'))
const port = process.env.PORT || 5000;
const server = createServer(app);
server.listen(port, () => console.info(`Server running on port: ${port}`));


var io = socketIO.listen(server);
 
var activeSockets = [];
io.on("connection", (socket) => {
      socket.on("disconnect", () => {
        activeSockets = activeSockets.filter(
          (existingSocket) => existingSocket !== socket.id
        );
        socket.broadcast.emit("remove-user", {
          socketId: socket.id,
        });
      });

      socket.on("call-user", (data) => {
        socket.to(data.to).emit("call-made", {
          offer: data.offer,
          socket: socket.id,
        });
      });

      socket.on("make-answer", (data) => {
        socket.to(data.to).emit("answer-made", {
          socket: socket.id,
          answer: data.answer,
        });
      });

      const existingSocket = activeSockets.find(
        (existingSocket) => existingSocket === socket.id
      );

      if (!existingSocket) {
        activeSockets.push(socket.id);

        socket.emit("update-user-list", {
          users: activeSockets.filter(
            (existingSocket) => existingSocket !== socket.id
          ),
        });

        socket.broadcast.emit("update-user-list", {
          users: [socket.id],
        });
      }
    });