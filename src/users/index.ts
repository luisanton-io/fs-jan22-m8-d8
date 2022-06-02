import User from "./model";
import express, { RequestHandler } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt";

const userRouter = express.Router();

const jwtGuard: RequestHandler = async (req, res, next) => {
    const token = req.header("Authorization")?.split(" ")[1];

    if (!token) {
        return res.status(401).send();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string }
        req.user = decoded._id;
        next();
    } catch {
        return res.status(401).send();
    }
}

userRouter
    .get('/', jwtGuard, async (req, res) => {
        console.log(req.user)
        const users = await User.find();
        res.send(users);
    })
    .post("/", async (req, res) => {
        try {
            const user = new User(req.body);

            user.password = await bcrypt.hash(req.body.password, 10);
            await user.save();

            res.status(201).send(user);
        } catch {
            res.status(400).send();
        }
    })
    .post("/session", async (req, res) => {
        try {
            const user = await User.findOne({ username: req.body.username });

            if (!user) {
                return res.status(404).send();
            }

            if (!await bcrypt.compare(req.body.password, user.password)) {
                return res.status(401).send();
            }

            const payload = {
                _id: user._id.toString(),
                mickeyMouse: true
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1 week" });

            res.send({ token });
        } catch {
            res.status(400).send();
        }
    })

export default userRouter