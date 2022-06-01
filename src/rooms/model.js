import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
  },
  sender: {
    type: String,
    required: true,
  },
  // id: string
  timestamp: {
    type: Number,
    required: true,
  }, // the number of elapsed ms after 1/1/1970
});

const RoomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  messages: {
    type: [MessageSchema],
    default: [],
  },
});

const Room = mongoose.model("rooms", RoomSchema);

export default Room;
