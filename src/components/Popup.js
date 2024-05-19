// src/components/Popup.js
import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';

const Popup = () => {
    const [cookies, setCookies] = useState([]);

    async function initDB() {
        const db = await openDB('cookie-manager', 1, {
            upgrade(db) {
                db.createObjectStore('cookies', { keyPath: 'name' });
                db.createObjectStore('details', { keyPath: 'id', autoIncrement: true });
            }
        });
        return db;
    }

    const dbPromise = initDB();

    useEffect(() => {
        // Get the stored cookies from the indexedDB.
        // then set the cookie data into the state.
    });

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
                    <tr key={cookie.name}>
                        <td>{cookie.domain}</td>
                        <td>{cookie.name}</td>
                        <td>{new Date(cookie.expirationDate * 1000).toLocaleString()}</td>
                        <td>
                            {/*<button onClick={() => removeCookie(cookie.name)}>Remove</button>*/}
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default Popup;
