import {openDB} from "idb";
import GetAllCookies from "./GetAllCookies";
import useCookies from "../hooks/useCookies";

/**
 * Remove a cookie from the IndexedDB and the browser(chrome.cookie).
 * @param cookie
 * @param setFilteredCookies
 * @returns {Promise<void>}
 * @constructor
 */
const RemoveCookie = async (cookie, setFilteredCookies) => {

    console.log('This cookie will be removed:')
    console.log(cookie)

    const protocol = cookie.details.secure ? 'https:' : 'http:';
    const cookieUrl = `${protocol}//${cookie.details.trimmedDomain}${cookie.details.path}`;

    await chrome.cookies.remove({
        url: cookieUrl,
        name: cookie.details.name,
        storeId: cookie.details.storeId
    });

    const db = await openDB('cookie-manager', 1);
    await db.delete('cookies', cookie.key_name);
    const cookiesData = await GetAllCookies(db);

    setFilteredCookies(cookiesData);

}

export default RemoveCookie;