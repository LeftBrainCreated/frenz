import dotenv from 'dotenv';
import { MongoClient, Db, Collection } from 'mongodb';
import { MpCollection } from '../classes/Collection';
import { Creator } from '../classes/Creator';
import path from 'path';

const isDebugMode = process.env.DEBUG_MODE === 'true';

if (isDebugMode) {
    // Running in debug mode, adjust .env path relative to dist folder
    const envPath = path.join(__dirname, '../../.env');
    dotenv.config({ path: envPath });
} else {
    // Default loading of .env for non-debug mode
    dotenv.config();
}

const MONGO_USER = process.env.MONGO_USER;
const MONGO_PW = process.env.MONGO_PW;
const MONGO_HOST = process.env.MONGO_HOST;
const url = `mongodb://${MONGO_USER}:${MONGO_PW}@${MONGO_HOST}:27017/`;

let client: MongoClient;
let collections: {
    collections?: Collection<MpCollection>;
    creators?: Collection<Creator>;
} = {};

export async function connectToDatabase() {
    try {
        client = new MongoClient(url);
        await client.connect();

        const db: Db = client.db('frenz_mp');
        collections.collections = db.collection<MpCollection>('collections');
        collections.creators = db.collection<Creator>('creators');
        
        console.log(`Connected to database: ${db.databaseName}, collection: ${collections.collections.collectionName}`);
    } catch (error) {
        console.error("Error connecting to the database:", error);
        throw error;
    }
}

export async function closeDatabaseConnection() {
    try {
        await client.close();
        console.log("Database connection closed");
    } catch (err) {
        console.error("Error closing the database connection:", err);
    }
}

export const getMarketplaceCollections = async (): Promise<MpCollection[]> => {
    try {
        const cols = (await collections.collections?.find({}).toArray()) as MpCollection[];
        return cols;
    } catch (ex) {
        console.error(ex);
        throw ex;
    }
};

export const getCollectionsOwnedByWallet = async (deployerWallet: string): Promise<MpCollection[]> => {
    try {
        const query = { contractDeployer: deployerWallet };
        const cols = await collections.collections?.find(query).toArray() as unknown as MpCollection[];
        return cols;
    } catch (ex) {
        console.error(ex);
        throw ex;
    }
};

export const createNewMarketplaceCollection = async (colDetails: MpCollection): Promise<boolean> => {
    try {
        if (!collections.collections) throw new Error("Collection is not initialized");

        const res = await collections.collections.insertOne(colDetails);
        return res.acknowledged;
    } catch (err) {
        console.error("Error in creating marketplace collection:", err);
        throw err;
    }
};

export const getCreator = async (walletAddress: string): Promise<Creator> => {
    try {
        if (!collections.collections) throw new Error("DB Not Initialized");

        const query = { walletAddress: walletAddress };
        const res = await collections.creators?.findOne(query) as Creator

        return res;
    } catch (err) {
        console.error("Error in creating marketplace collection:", err);
        throw err;
    }
}
