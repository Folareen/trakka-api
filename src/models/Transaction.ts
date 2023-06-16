import { Schema, model } from 'mongoose'

const TransactionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }, amount: {
        type: Number,
        required: true
    }, type: {
        type: String,
        required: true
    }, category: {
        type: String,
        required: true,
    }, description: {
        type: String,
        default: ''
    },
    date: {
        type: Date,
        required: true,
        default: Date.now()
    }
}, { timestamps: true })

const Transaction = model('Transaction', TransactionSchema)

export default Transaction