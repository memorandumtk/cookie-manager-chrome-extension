import {openDB} from "idb";
import useCookies from "../hooks/useCookies";
import RemoveCookie from "./RemoveCookie";

/**
 * Remove selected cookies from the IndexedDB and chrome itself(chrome.cookie).
 * @param buckets
 * @param setBuckets
 * @param filteredCookies
 * @param setFilteredCookies
 * @returns {Promise<void>}
 * @constructor
 */
const RemoveSelectedCookies = async (buckets, setBuckets, setFilteredCookies) => {

    const db = await openDB('cookie-manager', 1);
    const tx = db.transaction('cookies', 'readwrite');
    const store = tx.objectStore('cookies');

    buckets.map(async (cookie) => {
        await store.delete(cookie.key_name);
        await RemoveCookie(cookie, setFilteredCookies);
        console.log('This cookie was removed:', cookie);
    })
    // setFilteredCookies(filteredCookies.filter((cookie) => {
    //     return !buckets.includes(cookie.key_name);
    // }));
    console.log('This is the filtered cookies:');
    await tx.done; // Ensure the transaction is complete
    setBuckets([]); // Clear the selected buckets after removal
    console.log('Selected cookies were removed.')
}

export default RemoveSelectedCookies;