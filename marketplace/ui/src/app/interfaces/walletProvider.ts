export interface WalletProvider {
readonly selectedAddress: string;
readonly chainId: number;
readonly provider: string;
readonly isCreator: boolean;
}