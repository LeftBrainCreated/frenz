export interface OwnedAsset {
    contractAddress: string,
    tokenId: string
}

export interface ListedAsset {
    seller: string,
    price: number,
    contractAddress: string,
    tokenId: number | string
    active: boolean
    listingId: number
}
