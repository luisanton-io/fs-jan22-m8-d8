import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import roomRouter from "./rooms";
import Room from "./rooms/model";
import shared from "./shared";
import { app } from "./app";
import User from "./users/model";

const httpServer = createServer(app);
const io = new Server(httpServer);

io.on("connection", (socket) => {
    console.log(socket.id);

    console.log(socket.rooms);

    console.log(socket.handshake.auth.token)

    // decode our token to get the user id...
    // const user = await User.findById()

    socket.emit("welcome", { message: "Hello World!" });

    socket.on("my-event", (stuff) => {
        console.log(stuff);
    });

    socket.on("setUsername", (payload) => {
        const { username, room } = payload;
        console.log(username);

        socket.join(room);

        console.log(socket.rooms);

        shared.onlineUsers.push({ username, room, socketId: socket.id });

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
        shared.onlineUsers = shared.onlineUsers.filter((user) => user.socketId !== socket.id);
        socket.broadcast.emit("newConnection");
    });
});

export { httpServer }