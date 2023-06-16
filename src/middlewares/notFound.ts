import { NextFunction, Request, Response } from "express"

const notFound = (req: Request, res: Response, next: NextFunction) => {
    res.status(400).json({ message: 'Route not found' })
}

export default notFound