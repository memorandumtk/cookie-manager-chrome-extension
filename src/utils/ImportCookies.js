import { openDB } from 'idb';
import GetAllCookies from './GetAllCookies';

const ImportCookies = (file, setCookies, setFilteredCookies) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
        const cookies = JSON.parse(event.target.result);
        const db = await openDB('cookie-manager', 1);
        const tx = db.transaction('cookies', 'readwrite');
        const store = tx.objectStore('cookies');
        for (const cookie of cookies) {
            await store.put(cookie);
        }
        await tx.done;
        const cookiesData = await GetAllCookies(db);
        setCookies(cookiesData);
        setFilteredCookies(cookiesData);
    };
    reader.readAsText(file);
}

export default ImportCookies;