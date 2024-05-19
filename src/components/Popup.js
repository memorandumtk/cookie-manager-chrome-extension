import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';
import { initDB } from '../utils/InitDB.js';

// Function to get the stored cookies from IndexedDB
async function getAllCookies(db) {
    return await db.getAll('cookies');
}

const Popup = () => {
    const [cookies, setCookies] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const db = await initDB();
            const cookiesData = await getAllCookies(db); // Await to fetch all cookies
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

    return (
        <div>
            <h1>Cookie Manager</h1>
            <table>
                <thead>
                <tr>
                    <th>Domain</th>
                    <th>Name</th>
                    <th>Expiration Date</th>
                    <th>Action</th>
                </tr>
                </thead>
                <tbody>
                {cookies.map((cookie) => (
                    <tr key={cookie.details.name}>
                        <td>{cookie.key_name}</td>
                        <td>{cookie.details.name}</td>
                        <td>{new Date(cookie.details.expirationDate * 1000).toLocaleString()}</td>
                        <td>
                            <button onClick={() => removeCookie(cookie.key_name)}>Remove</button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Popup;
