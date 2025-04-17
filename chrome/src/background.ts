chrome.runtime.onInstalled.addListener(() => {
  console.log('Crucible Labs Extension installed broooo!!!');
  
  chrome.storage.local.set({
    isInitialized: true,
    installDate: new Date().toISOString()
  }, () => {
    console.log('Extension initialization complete');
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background script received message:', message);
  // Important: Return true if you want to send a response asynchronously
  return true;
});
