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
        var walletAddress = req.body.walletAddress;
        var jwt = '';

        mongo.connectToDatabase()
        .then(() => {
            mongo.getCreator(req.params.walletAddress).then((wl) => {
                if (wl != null) {
                    jwt = auth.jwtToken(walletAddress);
                    res.set('Set-Cookie', 'SESSIONID=' + jwt + '; Secure; HttpOnly;');
    
                }
            });
        });
    } catch (error) {
      res.status(500).send('Error creating collection');
    }
  }