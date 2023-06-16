import { Request, Response } from "express";
import Transaction from "../models/Transaction";

export const getTransactions = async (req: Request & {user?: any}, res: Response) => {
    try {
        const transactions = await Transaction.find({_id: req.user._id})

        res.status(200).json({transactions})

    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({message: 'Something went wrong'})
    }
}