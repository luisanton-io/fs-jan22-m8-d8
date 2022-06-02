import cors from "cors";
import express from "express";
import roomRouter from "./rooms";
import shared from "./shared";
import userRouter from "./users";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/test", function (req, res) {
  res.send({ message: "Hello, World!" });
});

app.get("/online-users", function (req, res) {
  res.send({ onlineUsers: shared.onlineUsers });
});

app.use("/rooms", roomRouter);
app.use("/users", userRouter)

export { app };
