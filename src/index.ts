import mongoose from "mongoose";
import { httpServer } from "./server";

const port = process.env.PORT || 4040;

if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL must be defined");
}

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("Connected to MongoDB");
    httpServer.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
});