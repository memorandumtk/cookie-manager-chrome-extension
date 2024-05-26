import {openDB} from "idb";

const RemoveSelectedCookies = async (buckets, setBuckets, filteredCookies, setFilteredCookies) => {
    const db = await openDB('cookie-manager', 1);
    const tx = db.transaction('cookies', 'readwrite');
    const store = tx.objectStore('cookies');

    for (const cookie of buckets) {
        await store.delete(cookie);
        console.log('This cookie was removed:', cookie);
    }
    setFilteredCookies(filteredCookies.filter((cookie) => !buckets.includes(cookie.key_name)));
    console.log('This is the filtered cookies:');
    console.log(filteredCookies)
    await tx.done; // Ensure the transaction is complete
    setBuckets([]); // Clear the selected buckets after removal
    console.log('All selected cookies were removed.')
}

export default RemoveSelectedCookies;