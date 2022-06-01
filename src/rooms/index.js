import express from "express";
import Room from "./model.js";
const roomRouter = express.Router();

roomRouter
  .get("/", async (req, res) => {
    const rooms = await Room.find();
    res.send(rooms);
  })
  .get("/:name", async (req, res) => {
    const room = await Room.findOne({ name: req.params.name });

    if (!room) {
      return res.status(404).send();
    }

    res.send(room.messages);
  })
  .post("/", async (req, res) => {
    try {
      const room = new Room(req.body);
      await room.save();

      res.status(201).send(room);
    } catch {
      res.status(400).send();
    }
  });

export default roomRouter;
