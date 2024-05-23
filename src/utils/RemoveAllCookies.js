import {openDB} from "idb";
import GetAllCookies from "./GetAllCookies";


const RemoveAllCookies = async () => {
    const db = await openDB('cookie-manager', 1);
    await db.clear('cookies');
    return await GetAllCookies(db);
}

export default RemoveAllCookies;