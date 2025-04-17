import { Wallet } from './wallet_utils';
import { cryptoWaitReady, mnemonicValidate } from '@polkadot/util-crypto';
import { BittensorChain } from './bittensorChain';

document.addEventListener('DOMContentLoaded', () => {
    const mnemonicInput = document.getElementById('mnemonic-input') as HTMLTextAreaElement;
    const walletNameInput = document.getElementById('wallet-name-input') as HTMLInputElement;
    const walletPasswordInput = document.getElementById('wallet-password-input') as HTMLInputElement;
    const importWalletButton = document.getElementById('import-wallet-button');
    const mnemonicError = document.getElementById('mnemonic-error');
    const passwordError = document.getElementById('password-error');

    importWalletButton?.addEventListener('click', async () => {
        let isValid = true;

        // Reset error messages
        if (mnemonicError) mnemonicError.style.display = 'none';
        if (passwordError) passwordError.style.display = 'none';

        const mnemonic = mnemonicInput?.value.trim();
        const walletName = walletNameInput?.value || 'imported-wallet';
        const password = walletPasswordInput?.value;

        // Validate mnemonic format first
        if (!mnemonic) {
            if (mnemonicError) {
                mnemonicError.textContent = 'Please enter a mnemonic phrase';
                mnemonicError.style.display = 'block';
                isValid = false;
            }
        } else if (!mnemonicValidate(mnemonic)) {
            if (mnemonicError) {
                mnemonicError.textContent = 'Invalid mnemonic phrase. Please check that you have entered 12 words correctly';
                mnemonicError.style.display = 'block';
                isValid = false;
            }
        }

        // Validate password
        if (!password) {
            if (passwordError) {
                passwordError.textContent = 'Password is required';
                passwordError.style.display = 'block';
                isValid = false;
            }
        } else if (password.length < 8) {
            if (passwordError) {
                passwordError.textContent = 'Password must be at least 8 characters long';
                passwordError.style.display = 'block';
                isValid = false;
            }
        }

        if (!isValid) return;

        try {
            const wallet = new Wallet({ name: walletName });
            const keypair = await wallet.createKeypairFromMnemonic(mnemonic);
            
            // Store the wallet with password encryption, with keypair, encrypting the coldkey, and not overwriting if the wallet already exists
            await wallet.setColdkey(keypair, true, false, false, password);
            await wallet.setColdkeyPub(keypair, false);

            // Add balance display
            const balanceContainer = document.getElementById('balance-container');
            if (balanceContainer) {
                balanceContainer.style.display = 'block';
                try {                    
                    const balance = await wallet.getBalance();
                    const balanceValue = balanceContainer.querySelector('.balance-value');
                    if (balanceValue) {
                        balanceValue.textContent = `${balance} τ`;
                    }
                } catch (error) {
                    console.error('Error displaying balance:', error);
                    const balanceValue = balanceContainer.querySelector('.balance-value');
                    if (balanceValue) {
                        balanceValue.textContent = 'Error fetching balance';
                    }
                }
            }

            alert('Wallet imported successfully!');
        } catch (error) {
            console.error('Error importing wallet:', error);
            
            // Specific Password and Mnemonic rror handling
            if (error instanceof Error) {
                if (error.message.includes('mnemonic')) {
                    if (mnemonicError) {
                        mnemonicError.textContent = 'Invalid mnemonic phrase. Please verify each word is spelled correctly';
                        mnemonicError.style.display = 'block';
                    }
                } else if (error.message.includes('password') || error.message.includes('encryption')) {
                    if (passwordError) {
                        passwordError.textContent = 'Invalid password format or encryption error';
                        passwordError.style.display = 'block';
                    }
                } else {
                    alert(`Failed to import wallet: ${error.message}`);
                }
            } else {
                alert('An unexpected error occurred while importing the wallet');
            }
        }
    });
});
