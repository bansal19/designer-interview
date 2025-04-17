# Crucible Wallet - Design Engineer Interview

This repository contains a Chrome extension wallet implementation that serves as the base for the design engineer interview at Crucible Labs.

## Getting Started

To run the chrome extension, first download all the dependencies by running 
```
npm install
```

Then, build the wallet from the chrome directory (`designer-interview/chrome`) by running
```
npm run build
```

Then, load the extension into chrome by going to `chrome://extensions/`, clicking "Load unpacked", and selecting the `dist` folder inside the `chrome` directory. Note - You'll need to turn on Developer Mode to see the "Load unpacked" button in Chrome.

## Interview Task

The current implementation has three screens that need design and implementation improvements:
- `popup.html` (main screen)
- `import-wallet.html`
- `create-wallet.html`

### Requirements

1. **Design Phase**
   - Create Figma designs for all three screens (or use any other design tool you prefer)
   - Focus on creating a modern, user-friendly interface
   - Consider the Chrome extension context and constraints
   - Feel free to use any design system or UI kit you're comfortable with

2. **Implementation Phase**
   - Re-implement the screens using your preferred framework (React, Vue, Svelte, etc.)
   - Use any UI library or component system you prefer (Material UI, Tailwind, Chakra, etc.)
   - Maintain all existing functionality
   - The main screen (`popup.html`) should allow users to:
     - Generate a new wallet
     - Import/Regenerate an existing wallet
   - Implement a back button to return to the main screen from both secondary screens

### Stretch Goals

1. **Enhanced Main Screen**
   - If a user already has a wallet, display their:
     - SS58 address
     - Balance
   - Note: Wallet information is stored in Chrome's application storage

### Submission

Please submit:
1. Design files (Figma or your preferred tool)
2. Your implementation code
3. A brief explanation of:
   - Your design decisions and implementation approach
   - Why you chose the specific tools and frameworks you used
   - Any additional features or improvements you'd like to highlight

### Tools & Resources
Feel free to use any tools, libraries, or frameworks that help you create the best possible solution. Some suggestions (but not limited to):
- Design: Figma, Adobe XD, Sketch, or any other design tool
- Frontend: React, Vue, Svelte, or any other framework
- AI: ChatGPT, Claude, Loveable, v0, etc! 


### Good luck! 
We're excited to see what you create and how you approach this challenge :) 