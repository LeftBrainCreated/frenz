import express, { Express, Request, Response } from 'express';
// import * from '/s'
import dotenv from 'dotenv';
import cors from 'cors';

import * as alchemy from './services/alchemy.service';
import * as mongo from './services/mongo.service';
import * as pinata from './services/pinata.service';
import multer from 'multer';

dotenv.config();

const app: Express = express();
const port = process.env.PORT;
const allowedOrigins = process.env.CORS_ORIGIN;
const upload = multer({ dest: 'uploads/' });

// const upload = multer({
//     dest: 'uploads/'
// });

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

app.get('/api/collections/byDeployer/:deployerWallet', async (req: Request, res: Response) => {
    try {
        mongo.connectToDatabase()
        .then(async () => {
            const collections = await mongo.getCollectionsOwnedByWallet(req.params.deployerWallet);
            res.send(collections);
        });
    } catch (ex) {
        res.status(500).send('An error occurred');
    }
});

app.get('/api/wallet/:walletAddress', async (req: Request, res: Response) => {
    alchemy.getNftsForWallet(req.params.walletAddress).then((collection) => {
        res.send(collection['ownedNfts']);
    })
})

app.post('/api/collections/create', async (req: Request, res: Response) => {
    // check for whitelisted creator address

    mongo.createNewMarketplaceCollection(req.body).then((result: boolean) => {
        res.send(result);
    })
})

app.post('/api/pinata/ipfs/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    pinata.pinFile(req.file).then((result) => {
        res.send(result);
    })
});

app.listen(port, () => {
    console.log(`⚡️[server]: Server is running - ⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️⚡️`);
});