import { Wallet } from './wallet_utils';
import { Keyring } from '@polkadot/keyring';

document.addEventListener('DOMContentLoaded', async () => {
    const mnemonicHolder = document.getElementById('mnemonic-holder');
    const warningContainer = document.getElementById('warning-container');
    const addressHolder = document.getElementById('address-holder');
    const walletNameInput = document.getElementById('wallet-name-input') as HTMLInputElement;
    const walletPasswordInput = document.getElementById('wallet-password-input') as HTMLInputElement;
    const createWalletButton = document.getElementById('create-wallet-button');

    // Initially hide the warning and address containers
    if (warningContainer) warningContainer.style.display = 'none';
    if (addressHolder) addressHolder.style.display = 'none';

    createWalletButton?.addEventListener('click', async () => {
        const walletName = walletNameInput?.value || 'default-wallet';
        const password = walletPasswordInput?.value;

        if (!password) {
            alert('Please enter a password to encrypt your wallet');
            return;
        }

        try {
            const wallet = new Wallet({ name: walletName });
            const mnemonic = wallet.generateMnemonic();

            if (mnemonicHolder) {
                mnemonicHolder.style.display = 'block';
                mnemonicHolder.textContent = mnemonic;
                
                if (warningContainer) {
                    warningContainer.style.display = 'block';
                }

                const keypair = await wallet.createKeypairFromMnemonic(mnemonic);

                if (addressHolder) {
                    const addressValue = addressHolder.querySelector('.address-value');
                    if (addressValue) {
                        if (keypair.ss58Address) {
                            addressValue.textContent = keypair.ss58Address;
                        } else {
                            addressValue.textContent = 'Error creating wallet. Please try again.';
                        }
                    }
                    addressHolder.style.display = 'block';
                }

                // Create and encrypt keypair with the provided password
                await wallet.setColdkey(keypair, true, false, false, password);
                await wallet.setColdkeyPub(keypair, false);

                // Tao balance display
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
                chrome.storage.local.get(null, (items) => {
                    console.log('All storage items:', items);
                });
            }
        } catch (error) {
            console.error('Error creating wallet:', error);
            if (mnemonicHolder) {
                mnemonicHolder.textContent = 'Error creating wallet. Please try again.';
            }
        }
    });
});