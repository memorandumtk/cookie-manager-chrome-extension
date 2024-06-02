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

console.log('Getting all cookie data process is started');
chrome.cookies.getAll({}, async (cookies) => {
    console.log('this is the cookie data');
    console.log(cookies[0]);
    try {
        const db = await dbPromise;
        const tx = db.transaction('cookies', 'readwrite');
        const store = tx.objectStore('cookies');

        for (const [index, cookie] of cookies.entries()) {
            try {

                let usage = 'Essential'; // Default

                const domain = cookie.domain;
                const name = cookie.name;
                if (!domain) {
                    usage = 'Unknown';
                    continue; // Skip this cookie if it doesn't have a domain or name
                } else if (!name) {
                    usage = 'Unknown';
                    continue; // Skip this cookie if it doesn't have a domain or name
                }

                const trimmedDomain = domain[0] === '.' ? domain.substring(1) : domain;
                const dbKey = `${trimmedDomain}_of_${name}`;

                // Create a new object for storage
                const storedData = { ...cookie, trimmedDomain };

                // Determine usage category
                const convertedName = name.toLowerCase();
                const convertedDomain = domain.toLowerCase();

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

            } catch (cookieError) {
                console.error(`Error processing cookie [${index}]:`, cookieError, cookie);
            }
        }

        await tx.done;
        console.log('All cookie data is stored in IndexedDB.');
    } catch (error) {
        console.error('Error storing cookie data in IndexedDB:', error);
    }
});
