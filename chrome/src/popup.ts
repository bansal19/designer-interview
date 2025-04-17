document.addEventListener('DOMContentLoaded', () => {

    const generateWalletButton = document.getElementById('generateWallet') as HTMLButtonElement;
    if (generateWalletButton) {
      generateWalletButton.addEventListener('click', () => {
        window.location.href = chrome.runtime.getURL('/html/create-wallet.html');
      });
    } else {
        console.error("Generate Wallet button not found.");
    }

    const importWalletButton = document.getElementById('importWallet') as HTMLButtonElement;
    if (importWalletButton) {
      importWalletButton.addEventListener('click', () => {
        window.location.href = chrome.runtime.getURL('/html/import-wallet.html');
      });
    }
  });

