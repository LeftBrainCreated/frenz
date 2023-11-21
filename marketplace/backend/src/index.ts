import express, { Express, Request, Response } from 'express';
// import * from '/s'
import dotenv from 'dotenv';
import cors from 'cors';

import * as alchemy from './services/alchemy.service';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const allowedOrigins = process.env.CORS_ORIGIN;

const options: cors.CorsOptions = {
    origin: allowedOrigins
};

// app.use(cors(options));

app.get('/', (req: Request, res: Response) => {
    // res.appendHeader('Access-Control-Allow-Origin', allowedOrigins);
    res.send('Express + TypeScript Server is running now');
});

app.get('/api/collection/:contractAddress', async (req: Request, res: Response) => {
    // res.appendHeader('Access-Control-Allow-Origin', allowedOrigins);
    await alchemy.getNftsForCollection(req.params.contractAddress).then((nfts) => {
        res.send(nfts);
    });
    console.log('done');
});

app.get('/api/collection/:contractAddress/nft/:id', async (req: Request, res: Response) => {
    // res.appendHeader('Access-Control-Allow-Origin', allowedOrigins);
    await alchemy.getSingleNFT(req.params.contractAddress, parseInt(req.params.id)).then((nft) => {
        res.send(nft);
    });
    console.log('done');
});

app.get('/api/collection/:contractAddress/nft/:id/owner', async (req: Request, res: Response) => {
    // res.appendHeader('Access-Control-Allow-Origin', allowedOrigins);
    alchemy.getOwnersForNft(req.params.contractAddress, parseInt(req.params.id)).then((ownerAddress) => {
        res.send(ownerAddress);
    });
});



app.listen(port, () => {
    console.log(`⚡️[server]: Server is running - ⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️`);
});