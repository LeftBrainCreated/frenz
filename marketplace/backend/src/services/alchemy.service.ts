import { Network, Alchemy } from 'alchemy-sdk';
import dotenv from 'dotenv';

dotenv.config();
const apiKey = process.env.GOERLI_API_KEY;

const settings = {
    apiKey: apiKey,
    network: Network.ETH_GOERLI,
};

const alchemy = new Alchemy(settings);


export const getNftsForCollection = async (contractAddress: string): Promise<any> => {
    return new Promise((res, rej) => {
        alchemy.nft
            .getNftsForContract(contractAddress)
            .then((result) => {
                res(result['nfts'])
            })
            .catch((ex: any) => {
                rej(ex);
            })
    });
}

export const getSingleNFT = async (contractAddress: string, assetId: number): Promise<any> => {
    return new Promise((res, rej) => {
        alchemy.nft.getNftMetadata(contractAddress, assetId)
            .then((result) => {
                res(result);
            })
            .catch((ex: any) => {
                rej(ex);
            });
    })
}

export const getOwnersForNft = async (contractAddress: string, assetId: number): Promise<any> => {
    return new Promise(async (res, rej) => {
        await alchemy.nft.getOwnersForNft(contractAddress, assetId)
            .then((result) => {
                res(result);
            })
            .catch((ex: any) => {
                rej(ex);
            });
    })
}