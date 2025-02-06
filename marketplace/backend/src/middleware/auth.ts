import jwt, { Secret, JwtPayload } from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

import dotenv from 'dotenv';
dotenv.config();

const RSA_PKEY: Secret = process.env['RSA_PKEY'] !== undefined ? process.env['RSA_PKEY'] : '';

export interface AuthRequest extends Request {
    token: string | JwtPayload;
   }


export const jwtToken = function (walletAddress: string): any {
    return jwt.sign({ id: walletAddress }, RSA_PKEY, {
      algorithm: 'HS256',
      expiresIn: "2 days",
      subject: walletAddress
    })
  }
  
  export const auth = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.header('Authorization')?.replace('Bearer ', '');
   
      if (!token) {
        throw new Error();
      }
   
      const decoded = jwt.verify(token, RSA_PKEY);
      (req as AuthRequest).token = decoded;
   
      next();
    } catch (err) {
      res.status(401).send('Please authenticate');
    }
   };