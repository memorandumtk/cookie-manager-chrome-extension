import { openDB } from './idb/node_modules/idb/build/index.js';

async function initDB() {
    const db = await openDB('cookie-manager', 1, {
        upgrade(db) {
            db.createObjectStore('cookies', { keyPath: 'key_name' });
        }
    });
    return db;
}
const dbPromise = initDB();

const storeCookies = async (cookie, store) => {
    try {
        const domain = cookie.domain;
        const name = cookie.name;
        if (!domain || !name) {
            return; // Skip this cookie if it doesn't have a domain or name
        }

        const trimmedDomain = domain[0] === '.' ? domain.substring(1) : domain;
        const dbKey = `${trimmedDomain}_of_${name}`;

        // Create a new object for storage
        const storedData = { ...cookie, trimmedDomain };

        // Determine usage category
        const convertedName = name.toLowerCase();
        const convertedDomain = domain.toLowerCase();

        let usage = 'Essential'; // Default

        if (convertedName.includes('ga') || convertedName.includes('utm') || convertedName.includes('analytics')) {
            usage = 'Analytics';
        } else if (convertedDomain.includes('doubleclick') || convertedDomain.includes('ad')) {
            usage = 'Advertising';
        } else if (convertedName.includes('pref') || convertedName.includes('settings') || convertedName.includes('lang')) {
            usage = 'Preferences';
        }

        storedData['usage'] = usage;

        let existingDomain = await store.get(dbKey) || { key_name: dbKey, details: {} };

        existingDomain.details = storedData;

        await store.put(existingDomain);

    } catch (error) {
        console.error('Error storing cookie data in IndexedDB:', error);
    }

}


const storeAllCookies = async (cookies) => {
    try {
        const db = await dbPromise;
        const tx = db.transaction('cookies', 'readwrite');
        const store = tx.objectStore('cookies');

        cookies.map(async cookie => {
            await storeCookies(cookie, store);
        })

        await tx.done;
        console.log('All cookie data is stored in IndexedDB.');
    } catch (error) {
        console.error('Error storing cookie data in IndexedDB:', error);
    }
}


chrome.cookies.getAll({}, async (cookies) => {
    console.log('Getting all cookie data process is started');
    console.log(cookies.length);
    console.log(cookies[0]);

    await storeAllCookies(cookies);
});


chrome.cookies.onChanged.addListener(async (changeInfo) => {
    console.log('Cookie changed:', changeInfo);
    try {
        const db = await dbPromise;
        const tx = db.transaction('cookies', 'readwrite');
        const store = tx.objectStore('cookies');

        await storeCookies(changeInfo.cookie, store);

        await tx.done;
        console.log('Cookie data is updated in IndexedDB.');
    } catch (error) {
        console.error('Error updating cookie data in IndexedDB:', error);
    }
})
