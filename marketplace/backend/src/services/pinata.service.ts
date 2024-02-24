const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');
// const pinataSDK = require('@pinata/sdk');

import dotenv from 'dotenv';
dotenv.config();

export const pinFile = (file: any) => {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path), file.originalname);

        axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
            maxBodyLength: "Infinity",
            headers: {
                'Content-Type': `multipart/form-data; boundary=${file._boundary}`,
                'Authorization': `Bearer ${process.env.PINATA_JWT_TOKEN}`
            }
        }).then((response: any) => {
            resolve(response.data);
        }).catch((error: any) => {
            reject(error);
        });
    });
};