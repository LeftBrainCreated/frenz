export interface Collection {
    collectionName: string;
    description: string | null;
    contractAddress: string;
    collectionDefaultImage: string;
    symbol: string;
    creatorName: string;
    contractDeployer: string;
    // deployedBlockNumber: number;
    // floorPrice: number | null;
    collectionSlug: string | null;
    imageUrl: string | null;
    ipfs: string | null;
    // externalUrl: string | null;
    twitterUsername: string | null;
    discrodUrl: string | null;
    bannerImageUrl: string | null;
    // lastIngestedAt: Date;
    tokenType: string;
    // stats: any;
}