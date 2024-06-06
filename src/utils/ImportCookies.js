import { openDB } from 'idb';

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
        setFilteredCookies(cookies);
        setCookies(cookies);
        await tx.done;
    };
    reader.readAsText(file);
}

export default ImportCookies;