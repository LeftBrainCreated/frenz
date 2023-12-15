import express, { Express, Request, Response } from 'express';
// import * from '/s'
import dotenv from 'dotenv';
import cors from 'cors';

import * as alchemy from './services/alchemy.service';
import * as mongo from './services/mongo.service';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const allowedOrigins = process.env.CORS_ORIGIN;

const options: cors.CorsOptions = {
    origin: allowedOrigins == undefined ? 'http://localhost:4200' : allowedOrigins
    , credentials: true
};

app.use(cors(options));

app.get('/', (req: Request, res: Response) => {
    res.send('Express + TypeScript Server is running now');
});

app.get('/api/collection/:contractAddress', async (req: Request, res: Response) => {
    await alchemy.getNftsForCollection(req.params.contractAddress).then((collection) => {
        res.send(collection);
    });
    console.log('done');
});

app.get('/api/collection/:contractAddress/nft/:id', async (req: Request, res: Response) => {
    await alchemy.getSingleNFT(req.params.contractAddress, parseInt(req.params.id)).then((nft) => {
        res.send(nft);
    });
    console.log('done');
});

app.get('/api/collection/:contractAddress/nft/:id/owner', async (req: Request, res: Response) => {
    alchemy.getOwnersForNft(req.params.contractAddress, parseInt(req.params.id)).then((ownerAddress) => {
        res.send(ownerAddress);
    });
});

app.get('/api/collections', async (req: Request, res: Response) => {
    mongo.connectToDatabase()
        .then(() => {
            mongo.getMarketplaceCollections().then((wl) => {
                res.send(wl);
            });
        });
})

app.get('/api/wallet/:walletAddress', async (req: Request, res: Response) => {
    alchemy.getNftsForWallet(req.params.walletAddress).then((collection) => {
        res.send(collection['ownedNfts']);
    })
})


app.listen(port, () => {
    console.log(`⚡️[server]: Server is running - ⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️`);
});