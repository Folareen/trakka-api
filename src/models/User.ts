import { Schema, model } from "mongoose"

const UserSchema = new Schema({
    fullname: {
        type: String,
        required:true,
        trim: true
    },
    username:{
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    emailAddress: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    avatar: {
        type: String,
        required: false,
    },
    accountBalance: {
        type: Number,
        default: 0
    },
    incomeAmount: {
        type: Number,
        default: 0
    },
    expensesAmount:{
        type: Number,
        default: 0
    }
})

const User = model('User', UserSchema)

export default User