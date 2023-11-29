import dotenv from 'dotenv';
import { MpCollection } from '../classes/Collection';
import * as mongoDb from 'mongodb';

dotenv.config();
const MONGO_USER = process.env.MONGO_USER;
const MONGO_PW = process.env.MONGO_PW;
const { MongoClient } = require('mongodb');

const url = `mongodb://${MONGO_USER}:${MONGO_PW}@localhost:27017/`;

export async function connectToDatabase() {
    dotenv.config();

    const client: mongoDb.MongoClient = new mongoDb.MongoClient(url);

    await client.connect();

    const db: mongoDb.Db = client.db('frenz_mp');

    const wl: mongoDb.Collection = db.collection('whitelist');

    collections.whiteList = wl;

    console.log(`Successfully connected to database: ${db.databaseName} and collection: ${wl.collectionName}`);
}

export const getMarketplaceCollections = async (): Promise<any> => {
    // return new Promise(async (res, rej) => {

    try {
        const cols = (await collections.whiteList?.find({}).toArray()) as unknown as MpCollection[];

        cols.forEach((col) => {
            console.log('Record: ' + col.collectionName);

        })

        return (cols);
        // res(cols);
    } catch (ex) {
        // rej(ex);
        console.log(ex);
    }
}

export const collections: { whiteList?: mongoDb.Collection } = {}
