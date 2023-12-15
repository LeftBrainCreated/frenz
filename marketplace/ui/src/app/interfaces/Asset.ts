import { ListedAsset } from "./marketplace-assets"

export interface Asset {
    contract: {
        address: string,
        name: string,
        symbol: string,
        totalSupply: number,
        tokenType: string,
        // openSea: any,
        contractDeployer: string,
        deployedBlockNumber: number
    },
    tokenId: string,
    tokenType: string,
    title: string
    description: string,
    timeLastUpdated: string,
    metadataError: string,
    rawMetadata: {
        date: number,
        image: string,
        dna: string,
        name: string,
        description: string,
        edition: number,
        metadata: any[],
        attributes: any[]
    },
    tokenUri: {
        gateway: string,
        raw: string,
    },
    media: [{
        gateway: string,
        thumbnail: string,
        raw: string,
        format: string,
        bytes: number
    }],
    listing: ListedAsset
}
