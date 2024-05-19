// "import" statement should import a module from the directory supposed as a path after built.
import { openDB } from './idb/node_modules/idb/build/index.js';

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

console.log('Getting all cookie data process is started');
chrome.cookies.getAll({}, async (cookies) => {
    const db = await dbPromise;
    const tx = db.transaction('cookies', 'readwrite');
    const store = tx.objectStore('cookies');

    for (const cookie of cookies) {
        const domain = cookie.domain;
        const name = cookie.name;
        const trimmedDomain = domain[0] === '.' ? domain.substring(1) : domain;
        const dbKey = `${name}_of_${trimmedDomain}`;
        const storedData = cookie;

        let existingDomain = await store.get(dbKey) || { key_name: dbKey, details: {} };

        existingDomain.details = storedData;

        store.put(existingDomain);
    }

    await tx.done;
    console.log('All cookie data is stored in IndexedDB.');
});
