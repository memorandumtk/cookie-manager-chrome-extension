import {openDB} from "idb";
import GetAllCookies from "./GetAllCookies";
import useCookies from "../hooks/useCookies";
import RemoveCookie from "./RemoveCookie";

/**
 * Remove all cookies from indexedDB and chrome.cookies.
 * @returns {Promise<void>}
 * @constructor
 */
const RemoveAllCookies = async () => {
    const {cookies, filteredCookies, setFilteredCookies} = useCookies();

    cookies.map(async (cookie) => {
        await RemoveCookie(cookie, setFilteredCookies);
    })

    console.log('All cookies will be removed.')

    const db = await openDB('cookie-manager', 1);
    await db.clear('cookies');
}

export default RemoveAllCookies;