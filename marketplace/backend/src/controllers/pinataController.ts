import { Request, Response } from 'express';
import * as pinata from '../services/pinata.service';

export const uploadToIPFS = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  try {
    const result = await pinata.pinFile(req.file);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send('Error uploading file to IPFS');
  }
};
