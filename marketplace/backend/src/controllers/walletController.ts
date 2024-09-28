import * as alchemy from '../services/alchemy.service';
import { Request, Response } from 'express';

export const getNftsForWallet = async (req: Request, res: Response) => {
    try {
        alchemy.getNftsForWallet(req.params.walletAddress).then((collection) => {
            res.send(collection['ownedNfts']);
        })
    } catch (error) {
        res.status(500).send('Error getting NFTs');
    }
}

