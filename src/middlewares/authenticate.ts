import { NextFunction, Request, Response } from "express"
import jwt from 'jsonwebtoken'
import User from "../models/User"

const authenticate = async (req: Request & {user: any}, res : Response, next : NextFunction) => {
    try {
        if (!req.headers?.authorization) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const token = req.headers?.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const decodedUser: any = jwt.decode(token as string)

        if (!decodedUser) {
            return res.status(401).json({ message: 'Unauthorized' })
        }

        const user = await User.findOne({ _id: decodedUser._id  })

        req.user = user

        next()
    } catch (error: any) {
        console.log(error.message)
        res.status(500).json({ message: 'Unable to authenticate user' })
    }

}

export default authenticate