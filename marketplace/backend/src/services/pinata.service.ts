import fs from 'fs';
import pinataSDK from '@pinata/sdk';
import dotenv from 'dotenv';

dotenv.config();

const pinata = new pinataSDK({
    pinataJWTKey: process.env.PINATA_JWT_TOKEN || ''
});

export const pinFile = async (file: any): Promise<any> => {
  try {
    const stream = fs.createReadStream(file.path);
    const response = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { name: file.originalname },
      pinataOptions: { cidVersion: 0 }
    });

    return response;
  } catch (error: any) {
    throw new Error(`Failed to pin file to IPFS: ${error.message}`);
  }
};
