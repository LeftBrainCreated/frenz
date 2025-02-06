import express from 'express';
import * as collectionController from '../controllers/collectionController';
import * as pinataController from '../controllers/pinataController';
import * as creatorController from '../controllers/creatorController';
import * as walletController from '../controllers/walletController';

import { auth } from '../middleware/auth';

const router = express.Router();

// creator Controller
router.get('/api/creator/:walletAddress', creatorController.getCreator);
router.get('/api/isCreator/:walletAddress', creatorController.isCreator);

// collection Controller
router.get('/api/collection', collectionController.getMarketplaceCollections);
router.get('/api/collection/byDeployer/:deployerWallet', collectionController.getCollectionsOwnedByWallet);
router.get('/api/collection/:contractAddress', collectionController.getCollection);
router.get('/api/collection/:contractAddress/nft/:id', collectionController.getSingleNft);
router.get('/api/collection/:contractAddress/nft/:id/owner', collectionController.getNftOwner);

router.post('/api/collection/create', auth, collectionController.createCollection);

// pinata Controller
router.post('/api/pinata/ipfs/upload', auth, pinataController.uploadToIPFS);

// walletController
router.get('/api/wallet/:walletAddress', walletController.getNftsForWallet);


export default router;