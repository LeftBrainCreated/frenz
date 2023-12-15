import { Asset } from "./asset";
import { Collection } from "./collection";

export interface Breadcrumb {
    viewType: number,
    collectionAddress?: string,
    assetId?: string
}