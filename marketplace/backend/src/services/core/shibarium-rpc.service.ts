const FormData = require('form-data');
const fs = require('fs');
const axios: Axios = require('axios');
import { Axios } from 'axios';
import { RequestMethod } from '../../enums/RequestMethod';

export abstract class shibariumRpc {


    public getSingleNFT(contractAddress: string, assetId: string): Promise<any> {
        return new Promise((res, rej) => {

        })

    }

    protected sendRequest(
        uri: string,
        method: RequestMethod = RequestMethod.GET,
        payload: any = null,
        httpOptions: any = {}
    ) {
        return new Promise((res, rej) => {
            switch (method) {
                case RequestMethod.POST:
                    var formData: any = { "some": "value" };
                    axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", formData, {
                        headers: {}
                    }).then((response: any) => {
                        res(response.data);
                    }).catch((error: any) => {
                        rej(error);
                    });



                    // this.http.get(uri, httpOptions)
                    //         .subscribe(async (body: any) => {
                    //             res(body);
                    //         });
                    break;

                case RequestMethod.GET:
                    axios.get("https://api.pinata.cloud/pinning/pinFileToIPFS").then((response: any) => {
                        res(response.data);
                    }).catch((error: any) => {
                        rej(error);
                    });


                    // this.http.post(uri, JSON.stringify(payload), httpOptions)
                    //     .subscribe(async (body: any) => {
                    //         res(body);
                    //     });

                    break;
            }
        })
    }


}
