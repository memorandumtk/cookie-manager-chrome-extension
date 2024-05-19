// "import" statement should import a module from the directory supposed as a path after built.
import {openDB} from './idb/node_modules/idb/build/index.js';

async function initDB() {
    const db = await openDB('cookie-manager', 1, {
        upgrade(db) {
            db.createObjectStore('cookies', { keyPath: 'key_name' });
            db.createObjectStore('details', { keyPath: 'id', autoIncrement: true });
        }
    });
    return db;
}

const dbPromise = initDB();

/**
 * Listener for opening the options page to pass the message from popup to details through this in background.
 */
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
    console.log('Message received in background.js:', message);
    if (message.action === 'openOptionsPage') {
        const db = await dbPromise;
        await db.put('details', { details: message.details });
        console.log('Details stored in background.js:', message.details);
        chrome.runtime.openOptionsPage();
        sendResponse({ status: 'Options page opened and details stored' });
        return true; // Indicate that we will send a response asynchronously
    }
});

/**
 * When the extension is started, the background script will load all the cookies from the browser and store them in the IndexedDB.
 */
console.log('Getting all cookie data process is started');
// chrome.runtime.onStartup.addListener(() => {
    chrome.cookies.getAll({}, async (cookies) => {
        const db = await dbPromise;

        console.log(cookies[0])

        for (const cookie of cookies) {
            const domain = cookie.domain;
            const name = cookie.name;
            // To make it unique for sure,
            // it will be the string combined cookie name and domain name as the key
            const trimmedDomain = domain[0] === '.' ? domain.substring(1) : domain;
            const dbKey = `${name}_of_${trimmedDomain}`
            const storedData = cookie;

            // Ensure existingDomain is an object with the correct structure
            let existingDomain = await db.get('cookies', dbKey) || {key_name: dbKey, details: {}};

            // Add or update the cookie detail
            existingDomain.details = storedData;

            // Store the updated existingDomain object back into the IndexedDB
            await db.put('cookies', existingDomain);
        }

        console.log('All cookie data is stored in IndexedDB.');
    });
// });