import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import roomRouter from "./rooms/index.js";
import mongoose from "mongoose";
import Room from "./rooms/model.js";

const app = express();

let onlineUsers = [];

app.use(cors());
app.use(express.json());

app.get("/test", function (req, res) {
  res.send("Hello World!");
});

app.get("/online-users", function (req, res) {
  res.send({ onlineUsers });
});

app.use("/rooms", roomRouter);

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
  console.log(socket.id);

  console.log(socket.rooms);

  socket.emit("welcome", { message: "Hello World!" });

  socket.on("my-event", (stuff) => {
    console.log(stuff);
  });

  socket.on("setUsername", (payload) => {
    const { username, room } = payload;
    console.log(username);

    socket.join(room);

    console.log(socket.rooms);

    onlineUsers.push({ username, room, socketId: socket.id });

    socket.emit("loggedin");
    socket.broadcast.emit("newConnection");
  });

  socket.on("sendmessage", async (payload) => {
    const { message, room } = payload;

    console.log(message);

    // Before broadcasting the messsage to the appropriate recipients,
    // we are going to save it in the database.

    await Room.findOneAndUpdate(
      { name: room },
      {
        $push: {
          messages: message,
        },
      }
    );

    // Here we broadcast the message to EVERYONE (except the sender)
    // socket.broadcast.emit("message", message);

    // Here we broadcast the message only to the people in the room
    socket.to(room).emit("message", message);
  });

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter((user) => user.socketId !== socket.id);
    socket.broadcast.emit("newConnection");
  });
});

const port = process.env.PORT || 4040;

mongoose.connect(process.env.MONGO_URL).then(() => {
  console.log("Connected to MongoDB");
  httpServer.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
});
