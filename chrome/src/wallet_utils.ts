import { 
    mnemonicGenerate,
    mnemonicToMiniSecret,
    mnemonicValidate,
    blake2AsU8a,
    sr25519PairFromSeed,
    cryptoWaitReady
} from '@polkadot/util-crypto';
import { decodeAddress, encodeAddress, Keyring } from '@polkadot/keyring';
import {
    naclDecrypt,
    naclEncrypt,
    randomAsU8a
  } from '@polkadot/util-crypto';
import { hexToU8a, isHex, stringToU8a, u8aToHex } from '@polkadot/util';
import { BittensorChain } from './bittensorChain';

// Types and Interfaces
interface KeyPair {
    publicKey: string;
    privateKey: string;
    ss58Address?: string;
}

interface WalletConfig {
    name?: string;
    coldkey?: string;
    path?: string;
}

type Password = string;

class KeyFileError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'KeyFileError';
    }
}

// TODO Test Constants for now.
// TODO as we add front-end functionality we'll remove these. 
const BT_WALLET_NAME = 'wallet_test';
const BT_WALLET_COLDKEY = 'coldkey';
// TODO This assumes that ~/.bittensor_wallets exists. Likely we need to store this in some local config file.
const BT_WALLET_PATH = '.bittensor_wallets';


// KeyFile Class
class KeyFile {
    private path: string;
    private name?: string;
    private saveToEnv: boolean;

    constructor(path: string, name?: string, saveToEnv: boolean = false) {
        this.path = path;
        this.name = name;
        this.saveToEnv = saveToEnv;
    }

    async existsOnDevice(): Promise<boolean> {
        // Local Storage is a web browser storage mechanism that saves data as key-value pairs in the user's browser.
        return localStorage.getItem(this.path) !== null;
    }

    async getKeypair(password?: Password): Promise<KeyPair> {
        const encryptedData = localStorage.getItem(this.path);
        if (!encryptedData) {
            throw new KeyFileError(`No keyfile exists at path: ${this.path}`);
        }
        return this.decryptKeypair(encryptedData, password);
    }

    async setKeypair(
        keypair: KeyPair, 
        encrypt: boolean = true, 
        overwrite: boolean = false,
        password?: Password
    ): Promise<void> {
        if (!overwrite && await this.existsOnDevice()) {
            throw new KeyFileError(`Keyfile already exists at path: ${this.path}`);
        }

        const encryptedData = encrypt ? 
            await this.encryptKeypair(keypair, password) :
            JSON.stringify(keypair);

            localStorage.setItem(this.path, encryptedData);
            
            if (this.saveToEnv && password) {
                localStorage.setItem(`BT_${this.name?.toUpperCase()}_PASSWORD`, password);
            }
    }

    private async encryptKeypair(keypair: KeyPair, password?: Password): Promise<string> {
        if (!password) {
            throw new KeyFileError('Password required for encryption');
        }
        
        // Convert the private key to Uint8Array for encryption
        const secretKeyU8a = hexToU8a(keypair.privateKey);
        
        // Take only the first 32 bytes of the secret key since the rest is the public key
        const messageToEncrypt = secretKeyU8a.slice(0, 32);
        const nonce = randomAsU8a(24);

        // Hash the password to get a 32-byte encryption key
        const encryptionKey = blake2AsU8a(password, 256); // 256 bits = 32 bytes
        // TODO maybe don't use a set salt, the security team would want randomized nonce.
        const encrypted = naclEncrypt(messageToEncrypt, encryptionKey, nonce);
        
        // Store encrypted data along with public information
        const encryptedData = {
            privateKey_encrypted: encrypted.encrypted,
            // TODO Add encoding information if necessary.
            // encoding: {
            //     content: ['pkcs8', 'ed25519'],
            //     type: ['scrypt'],
            //     version: '3'
            // },
            address: keypair.ss58Address,
            nonce: encrypted.nonce
        };

        return JSON.stringify(encryptedData);
    }

    private async decryptKeypair(encryptedData: string, password?: Password): Promise<KeyPair> {
        if (!password) {
            throw new KeyFileError('Password required for decryption');
        }

        try {
            const data = JSON.parse(encryptedData);
            const decrypted = naclDecrypt(
                data.encoded,
                data.nonce,
                stringToU8a(password)
            );

            if (!decrypted) {
                throw new Error('Decryption failed');
            }

            // Create keypair from the decrypted private key
            const keyring = new Keyring({ type: 'ed25519' });
            const pair = keyring.addFromSeed(decrypted);

            return {
                publicKey: u8aToHex(pair.publicKey),
                privateKey: u8aToHex(decrypted),
                ss58Address: data.address
            };
        } catch (error) {
            throw new KeyFileError('Failed to decrypt keypair');
        }
    }
}

// Main Wallet Class
export class Wallet {
    public name: string;
    public coldkey: string;
    public path: string;

    private _coldkey?: KeyPair;
    private _coldkeypub?: KeyPair;

    constructor(config?: WalletConfig) {
        this.name = config?.name ?? BT_WALLET_NAME;
        this.coldkey = config?.coldkey ?? BT_WALLET_COLDKEY;
        this.path = config?.path ?? BT_WALLET_PATH;
    }

    toString(): string {
        return `Wallet (Name: '${this.name}', Coldkey: '${this.coldkey}', Path: '~/${this.path}')`;
    }

    // Key File Getters
    async coldKeyFile(saveColdkeyToEnv: boolean = false): Promise<KeyFile> {
        const coldkeyPath = `${this.path}/${this.name}/coldkey`;
        return new KeyFile(coldkeyPath, 'coldkey', saveColdkeyToEnv);
    }

    async coldKeyPubFile(): Promise<KeyFile> {
        const coldkeypubPath = `${this.path}/${this.name}/coldkeypub.txt`;
        return new KeyFile(coldkeypubPath, 'coldkeypub.txt', false);
    }

    // Create New Keys
    async createNewColdkey(
        // TODO For now, set usePassword to false. Support for passwords will be added tho, as we add front-end functionality.
        usePassword: boolean = false,
        overwrite: boolean = false,
        suppress: boolean = false,
        saveColdkeyToEnv: boolean = false,
        coldkeyPassword?: Password
    ): Promise<Wallet> {
        const mnemonic = this.generateMnemonic();
        const keypair = await this.createKeypairFromMnemonic(mnemonic);

        // If password is provided, force usePassword to true
        const shouldUsePassword = coldkeyPassword ? true : usePassword;

        await this.setColdkey(
            keypair,
            shouldUsePassword,
            overwrite,
            saveColdkeyToEnv,
            coldkeyPassword
        );

        await this.setColdkeyPub(keypair, false, overwrite);

        return this;
    }

    // Key Management Methods
    async setColdkey(
        keypair: KeyPair,
        encrypt: boolean = true,
        overwrite: boolean = false,
        saveColdkeyToEnv: boolean = false,
        password?: Password // TODO Look at Polkadot wallet function for reference.
    ): Promise<void> {
        this._coldkey = keypair;
        const keyfile = await this.coldKeyFile(saveColdkeyToEnv);
        await keyfile.setKeypair(keypair, encrypt, overwrite, password);
    }

    async setColdkeyPub(
        keypair: KeyPair,
        encrypt: boolean = false,
        overwrite: boolean = false
    ): Promise<void> {
        const ss58Address = keypair.ss58Address;
        if (!ss58Address) {
            throw new KeyFileError('SS58 address required for coldkeypub');
        }

        const coldkeypubKeypair: KeyPair = {
            publicKey: keypair.publicKey,
            privateKey: '', // Public key only
            ss58Address
        };

        this._coldkeypub = coldkeypubKeypair;
        const keyfile = await this.coldKeyPubFile();
        await keyfile.setKeypair(coldkeypubKeypair, encrypt, overwrite);
    }

    // Helper Methods
    public generateMnemonic(): string {
        let mnemonic = mnemonicGenerate(12);  // Initialize with first attempt
        let isValid: boolean = mnemonicValidate(mnemonic); // Validate the mnemonic using BIP39

        while (!isValid) {
            mnemonic = mnemonicGenerate(12);
            isValid = mnemonicValidate(mnemonic);
        }

        return mnemonic;
    }

    public async createKeypairFromMnemonic(mnemonic: string): Promise<KeyPair> {
        // Create valid Substrate-compatible seed from mnemonic
        const seed = mnemonicToMiniSecret(mnemonic);
        await cryptoWaitReady();
        // Generate new public/secret keypair for Alice from the supplied seed
        const { publicKey, secretKey } = sr25519PairFromSeed(seed);
        // Generate SS58 address from the public key, using the Bittensor 42 ss58 format
        const ss58Address = encodeAddress(publicKey);
        return {
            publicKey: u8aToHex(publicKey),
            privateKey: u8aToHex(secretKey),
            ss58Address: ss58Address.toString(),
        };
    }

    public async getBalance(): Promise<string> {
        if (!this._coldkey?.ss58Address) {
            throw new Error('No coldkey address available');
        }

        try {
            const chain = BittensorChain.getInstance();
            console.log('Getting balance from chain for address:', this._coldkey.ss58Address);
            const balanceOnChain = await chain.getBalance(this._coldkey.ss58Address);
            
            await chain.disconnect();

            // Convert to string and ensure 9 decimal places
            const balance = BigInt(balanceOnChain);
            const whole = balance / BigInt(1_000_000_000);
            const decimal = balance % BigInt(1_000_000_000);
            
            // Format with leading zeros for decimal part
            return `${whole}.${decimal.toString().padStart(9, '0')}`;
        } catch (error) {
            console.error('Error getting wallet balance:', error);
            const chain = BittensorChain.getInstance();
            await chain.disconnect();
            throw new Error('Failed to get wallet balance');
        }
    }
}
