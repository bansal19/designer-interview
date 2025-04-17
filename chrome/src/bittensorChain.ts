import { ApiPromise, WsProvider } from '@polkadot/api';

export class BittensorChain {
    private static instance: BittensorChain;
    private api: ApiPromise | null = null;
    
    // Define network endpoints
    private static readonly NETWORKS = {
        // Pulled from https://docs.bittensor.com/bittensor-networks
        MAINNET: 'wss://entrypoint-finney.opentensor.ai:443',
        TESTNET: 'wss://test.finney.opentensor.ai:443'
    };
    
    private constructor() {}

    static getInstance(): BittensorChain {
        if (!BittensorChain.instance) {
            BittensorChain.instance = new BittensorChain();
        }
        return BittensorChain.instance;
    }

    // TODO Connect to the Bittensor testnet Chain on default
    async connect(useTestnet: boolean = true): Promise<void> {
        if (!this.api) {
            const endpoint = useTestnet 
                ? BittensorChain.NETWORKS.TESTNET
                : BittensorChain.NETWORKS.MAINNET;

            const provider = new WsProvider(endpoint);
            this.api = await ApiPromise.create({ provider });
            await this.api.isReady;
        }
    }

    async disconnect(): Promise<void> {
        if (this.api) {
            await this.api.disconnect();
            this.api = null;
        }
    }

    public async getBalance(address: string): Promise<string> {
        try {
            // Ensure connection exists
            if (!this.api) {
                await this.connect(true); // Force testnet connection                
            }

            console.log('Querying the chain for address:', address);
            const accountData = await this.api!.query.system.account(address);
            const accountInfo = accountData.toJSON() as any;
            
            // Calculate and return total balance (free + reserved)
            return (BigInt(accountInfo.data.free) + BigInt(accountInfo.data.reserved)).toString();
        } catch (error) {
            console.error('Error retrieving balance:', error);
            throw error;
        }
    }
} 