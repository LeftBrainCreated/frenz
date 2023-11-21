export interface Asset {
    creatorName: string;
    imgPath: string;
    assetValue: number;
    assetLabel: string;
    collectionName: string;
    currency: string;
    link: string;
    pfpImagePath: string;
}

export interface Collection {
    collectionName: string;
    bannerImgPath: string;
    creatorName: string;
    link: string;
    pfpImagePath: string;
}