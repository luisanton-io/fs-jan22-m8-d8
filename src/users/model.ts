import mongoose from "mongoose"

interface User {
    username: string;
    password: string;
}

const UserSchema = new mongoose.Schema<User>({
    username: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
})

UserSchema.methods.toJSON = function () {
    const obj = this.toObject()
    delete obj.password
    delete obj.__v
    return obj
}

const User = mongoose.model("users", UserSchema)

export default User