import {openDB} from "idb";

/**
 * Initialize the IndexedDB promise object with db names.
 */
export async function InitDB() {
    const db = await openDB('cookie-manager', 1, {
        upgrade(db) {
            db.createObjectStore('cookies', { keyPath: 'key_name' });
            db.createObjectStore('details', { keyPath: 'id', autoIncrement: true });
        }
    });
    return db;
}
