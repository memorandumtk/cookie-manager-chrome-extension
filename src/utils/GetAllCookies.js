import {InitDB} from "./InitDB";


/**
 * Get all cookies from the IndexedDB.
 * @param passedDbObj || null (case of null, it will initialize the IndexedDB)
 * @returns {Promise<StoreValue<unknown, string>[]>}
 * @constructor
 */
const GetAllCookies = async (passedDbObj = null) => {
    const db = passedDbObj !== null ? passedDbObj : await InitDB();
    const allCookies = await db.getAll('cookies');

    console.log(('GetAllCookies is called.'))
    console.log(allCookies);

    return allCookies;
}

export default GetAllCookies;