// "import" statement should import a module from the directory supposed as a path after built.
import {openDB} from './idb/node_modules/idb/build/index.js';

async function initDB() {
    const db = await openDB('cookie-manager', 1, {
        upgrade(db) {
            db.createObjectStore('cookies', {keyPath: 'name'});
            db.createObjectStore('details', {keyPath: 'id', autoIncrement: true});
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
        await db.put('details', {details: message.details});
        console.log('Details stored in background.js:', message.details);
        chrome.runtime.openOptionsPage();
        sendResponse({status: 'Options page opened and details stored'});
        return true; // Indicate that we will send a response asynchronously
    }
});

// Listener for cookie changes
// chrome.cookies.onChanged.addListener(async (changeInfo) => {
//     if (!changeInfo.removed) {
//         const domain = changeInfo.cookie.domain;
//         const name = changeInfo.cookie.name;
//         const storedData = changeInfo.cookie;
//
//         const db = await dbPromise;
//         const existingDomain = await db.get('cookies', domain) || {};
//
//         if (!existingDomain[name]) {
//             existingDomain[name] = storedData;
//         }
//
//         await db.put('cookies', existingDomain);
//         console.log('Stored data:', storedData);
//     }
// });

/**
 * When the extension is started, the background script will load all of the cookies from the browser and store them in the IndexedDB.
 */
console.log('Getting all cookie data process is started');
chrome.cookies.getAll({}, async (cookies) => {
    const db = await dbPromise;

    for (const cookie of cookies) {
        const domain = cookie.domain;
        const name = cookie.name;
        const storedData = cookie;

        const existingDomain = await db.get('cookies', domain) || {};

        if (!existingDomain[name]) {
            existingDomain[name] = storedData;
        }

        await db.put('cookies', { name: domain, cookies: existingDomain.cookies });
    }

    console.log(await db.getAll('cookies'));
    console.log('All cookie data is stored in IndexedDB:');
});