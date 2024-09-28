import { Request, Response } from 'express';
import * as auth from '../middleware/auth';
import * as mongo from '../services/mongo.service';

export const getCreator = async (req: Request, res: Response) => {
    try {
        mongo.connectToDatabase()
        .then(() => {
            mongo.getCreator(req.params.walletAddress).then((wl) => {
                res.send(wl);
            });
        });
    } catch (error) {
      res.status(500).send('Error creating collection');
    }
  };

  export const isCreator = async (req: Request, res: Response) => {
    try {
      const walletAddress = req.params.walletAddress;
  
      // Ensure the DB is connected once at app start and reused
      await mongo.connectToDatabase();
  
      // Fetch the creator
      const creator = await mongo.getCreator(walletAddress);
  
      if (creator != null) {
        const jwt = auth.jwtToken(walletAddress);
        res.set('Set-Cookie', 'SESSIONID=' + jwt + '; Secure; HttpOnly;');
        return res.status(200).send(true);  // Return here to avoid further execution
      }
  
      // Send false if no creator found
      return res.status(200).send(false);
      
    } catch (error) {
      console.error('Error in isCreator:', error);
      res.status(500).send('Error checking creator');
    }
  };