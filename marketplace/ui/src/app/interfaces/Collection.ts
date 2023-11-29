export interface Collection {
    collectionName: string;
    collectionDefaultImage: string;
    creatorName: string;
    contractAddress: string;
    symbol: string;
    totalSupply: string;
    tokenType: string;
    contractDeployer: string;
    deployedBlockNumber: number;
    floorPrice: number | null;
    collectionSlug: string | null;
    imageUrl: string | null;
    ipfs: string | null;
    description: string | null;
    externalUrl: string | null;
    twitterUsername: string | null;
    discrodUrl: string | null;
    bannerImageUrl: string | null;
    lastIngestedAt: Date;
    stats: any;
}