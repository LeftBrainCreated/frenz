export interface NewAsset {
    name: string;
    collectionName: string;
    description: string;
    image: string;
    attributes: Attribute[];
    date: number;
}

interface Attribute {
    trait_type: string;
    value: string;
    display_type: string;
}