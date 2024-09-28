import { Request, Response } from 'express';
import * as mongo from '../services/mongo.service';
import * as alchemy from '../services/alchemy.service';


export const getCollection = async (req: Request, res: Response) => {
    try {
        await alchemy.getNftsForCollection(req.params.contractAddress).then((collection) => {
            res.send(collection);
        });
    } catch (error) {
        res.status(500).send('Error getting collection');
    }
}

export const getSingleNft = async (req: Request, res: Response) => {
    try {
        await alchemy.getSingleNFT(req.params.contractAddress, parseInt(req.params.id)).then((nft) => {
            res.send(nft);
        });
    } catch (error) {
        res.status(500).send('Error getting NFT');
    }
}

export const getNftOwner = async (req: Request, res: Response) => {
    try {
        alchemy.getOwnersForNft(req.params.contractAddress, parseInt(req.params.id)).then((ownerAddress) => {
            res.send(ownerAddress);
        });
    } catch (error) {
        res.status(500).send('Error getting NFT Owner');
    }
}

export const getMarketplaceCollections = async (req: Request, res: Response) => {
    try {
        mongo.connectToDatabase()
            .then(() => {
                mongo.getMarketplaceCollections().then((wl) => {
                    res.send(wl);
                });
            });
    } catch (ex) {
        res.status(500).send('An error occurred');
    }
}

export const getCollectionsOwnedByWallet = async (req: Request, res: Response) => {
    try {
        mongo.connectToDatabase()
        .then(async () => {
            const collections = await mongo.getCollectionsOwnedByWallet(req.params.deployerWallet);
            res.send(collections);
        });
    } catch (ex) {
        res.status(500).send('An error occurred');
    }
}

export const createCollection = async (req: Request, res: Response) => {
  try {
    const result = await mongo.createNewMarketplaceCollection(req.body);
    res.status(200).send(result);
  } catch (error) {
    res.status(500).send('Error creating collection');
  }
};