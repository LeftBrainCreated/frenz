import { Network, Alchemy } from 'alchemy-sdk';
import dotenv from 'dotenv';

dotenv.config();
const apiKey = process.env.SEPOLIA_API_KEY;

const settings = {
    apiKey: apiKey,
    network: Network.ETH_SEPOLIA,
};

const alchemy = new Alchemy(settings);


export const getNftsForCollection = async (contractAddress: string): Promise<any> => {
    try {
        const result = await alchemy.nft.getNftsForContract(contractAddress);
        return result['nfts'];
    } catch (ex) {
        throw ex;
    }
}


export const getSingleNFT = async (contractAddress: string, assetId: number): Promise<any> => {
    try {
        const result = await alchemy.nft.getNftMetadata(contractAddress, assetId);
        return result;
    } catch (ex) {
        throw ex;
    }
}


export const getOwnersForNft = async (contractAddress: string, assetId: number): Promise<any> => {
    try {
        const result = await alchemy.nft.getOwnersForNft(contractAddress, assetId);
        return result;
    } catch (ex) {
        throw ex;
    }
}


export const getNftsForWallet = async (walletAddress: string): Promise<any> => {
    try {
        const result = await alchemy.nft.getNftsForOwner(walletAddress);
        return result;
    } catch (ex) {
        throw ex;
    }
}
