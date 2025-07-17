import { Request, Response, NextFunction } from "express";
import jwt, {JwtPayload} from 'jsonwebtoken'

const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"]?.split("Bearer ")[1]
  const decoded = jwt.verify(authHeader as string, process.env.JWT_SECRET as string)
  if(!decoded || (typeof decoded === "string")) {
    res.status(403).json({message: "Invalid token or not logged In."})
    return;
  }
  req.userId = (decoded as JwtPayload).id
  next()
}

export default verifyJWT