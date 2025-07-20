import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError, JsonWebTokenError } from 'jsonwebtoken';

interface AuthRequest extends Request {
    userId?: string;
}

const verifyJWT = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required. Please sign in." });
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
      return res.status(401).json({ message: "Invalid token format." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    if (!decoded || (typeof decoded === "string")) {
      return res.status(403).json({ message: "Invalid token." });
    }

    req.userId = (decoded as JwtPayload).id;
    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ message: "Your session has expired. Please sign in again." });
    } else if (error instanceof JsonWebTokenError) {
      return res.status(403).json({ message: "Invalid token." });
    } else {
      console.error("JWT Verification Error:", error);
      return res.status(500).json({ message: "Authentication error." });
    }
  }
};

export default verifyJWT;