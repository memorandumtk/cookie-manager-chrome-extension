import {openDB} from "idb";
import GetAllCookies from "./GetAllCookies";

/**
 * Update a cookie in the IndexedDB and the browser(chrome.cookie).
 * @param name
 * @param value
 * @param selectedCookie
 * @param setSelectedCookie
 * @param setFilteredCookies
 * @returns {Promise<void>}
 * @constructor
 */
const DetailChange = async (name, value, selectedCookie, setSelectedCookie, setFilteredCookies) => {

    setSelectedCookie((prevCookie) => {
        prevCookie.details[name] = value;
        return {...prevCookie}
    });

    console.log('selected Cookie updated: ', selectedCookie);

    try {
        // Use selectedCookie instead of updatedCookie
        await chrome.cookies.set({
            url: `http${selectedCookie.details.secure ? 's' : ''}://${selectedCookie.details.trimmedDomain}`,
            name: selectedCookie.details.name,
            value: selectedCookie.details.value,
            expirationDate: selectedCookie.details.expirationDate ? selectedCookie.details.expirationDate : undefined,
            path: selectedCookie.details.path || '/',
            secure: selectedCookie.details.secure || false,
            httpOnly: selectedCookie.details.httpOnly || false,
            sameSite: selectedCookie.details.sameSite || 'no_restriction'
        });

        console.log('Chrome cookie set successfully');

        // Update the IndexedDB
        const db = await openDB('cookie-manager', 1);
        const tx = db.transaction('cookies', 'readwrite');
        const store = tx.objectStore('cookies');

        await store.put(selectedCookie); // Corrected line: no key parameter

        await tx.done;
        const cookiesData = await GetAllCookies(db);
        setFilteredCookies(cookiesData);
    } catch (error) {
        console.error('Error setting chrome cookie:', error);
    }
};

export default DetailChange;