import dotenv from "dotenv"
dotenv.config()
import supertest from "supertest"
import { app } from "../app"
import mongoose from "mongoose"
import jwt from "jsonwebtoken"

const client = supertest(app)

describe("Testing the main application", () => {

    beforeAll(async () => {
        await mongoose.connect(process.env.MONGO_URL_TEST!)
    })

    it("should test that true is true", () => {
        expect(true).toBe(true);
    })

    it("should check that the GET /test endpoint returns Hello World", async () => {
        const response = await client.get("/test")
        expect(response.status).toBe(200)
        expect(response.body).toEqual({ message: "Hello, World!" })
    })

    const validUser = {
        username: "Alice",
        password: "Password1234"
    }

    let validUserId: string

    it("should check that when POST /users it returns a valid _id", async () => {
        const response = await client.post("/users").send(validUser)
        expect(response.status).toBe(201)
        expect(response.body).toHaveProperty("_id")

        validUserId = response.body._id
    })

    let token: string

    it("should check that we can login using POST /users/session", async () => {
        const response = await client.post("/users/session").send(validUser)
        expect(response.status).toBe(200)
        expect(response.body).toHaveProperty("token")

        // console.log(response.body)

        token = response.body.token

        console.table({ token })
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { _id: string }

        expect(decoded._id).toBe(validUserId)
    })

    it("should check that we cannot retrieve the list of users without a valid token", async () => {
        const response = await client.get("/users")
        expect(response.status).toBe(401)
    })

    it("should check that we can retrieve a list of users without the password", async () => {
        const response = await client.get("/users").set("Authorization", `Bearer ${token}`)

        console.log(response.body)
        expect(response.status).toBe(200)
        expect(response.body[0].username).toBe("Alice")
        expect(response.body[0].password).not.toBeDefined()

    })

    afterAll(async () => {
        await mongoose.connection.dropDatabase()
        await mongoose.connection.close()
    })

})