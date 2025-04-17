# crucible_wallet

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.

## Running the Chrome Extension

To run the chrome extension, first download all the dependencies by running 
```
npm install
```

Then, build the wallet from the chrome directory (`cruciblelabs/wallet/chrome`) by running
```
npm run build
```

Then, load the extension into chrome by going to `chrome://extensions/`, clicking "Load unpacked", and selecting the `dist` folder inside the `chrome` directory. Note - You'll need to turn on Developer Mode to see the "Load unpacked" button in Chrome. 
