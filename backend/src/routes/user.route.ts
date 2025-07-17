import { Request, Response, NextFunction, Router } from "express";
import { User } from "../models/user.model";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'

const route = Router()


route.route('/signup').post( async (req: Request, res: Response, next: NextFunction)=> {
  const {email, password} = req.body;

  if(!email || !password) {
    res.status(400).json({
      message: "All fields are required."
    })
  }
  const existingUser = await User.findOne({email})
  if(existingUser){
    res.status(401).json({message: "User already exists."})
    return;    
  }

  const salt = await bcrypt.genSalt(10)
  const hashPassword = await bcrypt.hash(password as string, salt)

  const user = await User.create({
    email,
    password: hashPassword
  })

  if(!user || user === null) {
    res.status(500).json({message: "Something went wrong while signingup. Please try again."})
    return;
  }
  res.status(200).json({
    message: "User signed up successfully."
  })
})


route.route('/signin').post( async (req: Request, res: Response, next: NextFunction) => {
  const {email, password} = req.body;
  if(!email || !password || email === null) {
    res.status(400).json({message: "All fields are requied."})
    return;
  }
  const user = await User.findOne({email})
  
  if(!user) {
    res.status(404).json({message: "User does not exist."})
    return;
  }

  const verifyPassword = await bcrypt.compare(password, user.password)
  if(!verifyPassword) {
    res.status(401).json({message: "Enter correct Password."})
    return;
  }
  const token = jwt.sign({
    id: user._id,
    email,
  }, process.env.JWT_SECRET!, {expiresIn: '1h'})

  if(!token) {
    res.status(500).json({message: "Error while Authentication. Please try again."})
    return;
  }

  res.status(200).json({token, message: "User successfully logged In." })
})
export default route