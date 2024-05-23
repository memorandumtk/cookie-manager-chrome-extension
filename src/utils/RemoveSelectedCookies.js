import {openDB} from "idb";
import GetAllCookies from "./GetAllCookies";


const RemoveSelectedCookies = async (buckets, setBuckets, setCookies, setFilteredCookies) => {
    const db = await openDB('cookie-manager', 1);
    const tx = db.transaction('cookies', 'readwrite');
    const store = tx.objectStore('cookies');

    for (const cookie of buckets) {
        await store.delete(cookie);
        console.log('This cookie was removed:', cookie);
    }

    await tx.done; // Ensure the transaction is complete
    const cookiesData = await GetAllCookies(db);
    setCookies(cookiesData);
    setFilteredCookies(cookiesData);
    setBuckets([]); // Clear the selected buckets after removal
    console.log('All selected cookies were removed.')
}

export default RemoveSelectedCookies;