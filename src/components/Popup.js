import React, {useEffect, useState} from 'react';
import {openDB} from 'idb';
import {initDB} from '../utils/InitDB.js';

// Function to get the stored cookies from IndexedDB
async function getAllCookies(db) {
    return await db.getAll('cookies');
}

const Popup = () => {
    const [cookies, setCookies] = useState([]);
    const [buckets, setBuckets] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const db = await initDB();
            const cookiesData = await getAllCookies(db); // Await to fetch all cookies
            console.log('Cookies data:', cookiesData);
            setCookies(cookiesData);
        };

        fetchData();
    }, []); // Empty dependency array to run the effect only once

    const removeCookie = async (domain) => {
        const db = await openDB('cookie-manager', 1);
        await db.delete('cookies', domain);
        const cookiesData = await getAllCookies(db);
        setCookies(cookiesData);
    };

    const removeSelectedCookies = async () => {
        const db = await openDB('cookie-manager', 1);
        const tx = db.transaction('cookies', 'readwrite');
        const store = tx.objectStore('cookies');

        for (const cookie of buckets) {
            await store.delete(cookie);
            console.log('This cookie was removed:', cookie);
        }

        await tx.done; // Ensure the transaction is complete
        const cookiesData = await getAllCookies(db);
        setCookies(cookiesData);
        setBuckets([]); // Clear the selected buckets after removal
    }

    const handleCheckboxChange = (event, cookieKeyName) => {
        const {checked} = event.target;
        if (checked) {
            setBuckets((prevBuckets) => [...prevBuckets, cookieKeyName]);
        } else {
            setBuckets((prevBuckets) => prevBuckets.filter((bucket) => bucket !== cookieKeyName));
        }
    }

    return (
        <div>
            <h1>Cookie Manager</h1>
            <button onClick={removeSelectedCookies}>Remove Selected</button>
            <table>
                <thead>
                <tr>
                    <th>Select</th>
                    <th>Action</th>
                    <th>Domain</th>
                    <th>Name</th>
                    <th>Expiration Date</th>
                </tr>
                </thead>
                <tbody>
                {cookies.map((cookie) => (
                    <tr key={cookie.key_name}>
                        <td>
                            <label htmlFor={`checkbox-${cookie.key_name}`}>
                                <input
                                    name={`checkbox-${cookie.key_name}`}
                                    className={`checkbox-${cookie.key_name}`}
                                    id={`checkbox-${cookie.key_name}`}
                                    type="checkbox"
                                    onChange={(event) => handleCheckboxChange(event, cookie.key_name)}
                                />
                            </label>
                        </td>
                        <td>
                            <button onClick={() => removeCookie(cookie.key_name)}>Remove</button>
                        </td>
                        <td>{cookie.details.domain}</td>
                        <td>{cookie.details.name}</td>
                        <td>{cookie.details.expirationDate ? new Date(cookie.details.expirationDate * 1000).toLocaleString() : 'Session'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Popup;
