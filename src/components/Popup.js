import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';
import { initDB } from '../utils/InitDB.js';
import CookieDetailModal from './CookieDetailModal.js';
import '../css/popup.css';

// Function to get the stored cookies from IndexedDB
async function getAllCookies(db) {
    return await db.getAll('cookies');
}

const Popup = () => {
    const [cookies, setCookies] = useState([]);
    const [filteredCookies, setFilteredCookies] = useState([]);
    const [buckets, setBuckets] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [selectedCookie, setSelectedCookie] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const db = await initDB();
            const cookiesData = await getAllCookies(db); // Await to fetch all cookies
            console.log('Cookies data:', cookiesData);
            setCookies(cookiesData);
            setFilteredCookies(cookiesData);
        };

        fetchData();
    }, []); // Empty dependency array to run the effect only once

    const removeCookie = async (domain) => {
        const db = await openDB('cookie-manager', 1);
        await db.delete('cookies', domain);
        const cookiesData = await getAllCookies(db);
        setCookies(cookiesData);
        setFilteredCookies(cookiesData);
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
        setFilteredCookies(cookiesData);
        setBuckets([]); // Clear the selected buckets after removal
        console.log('All selected cookies were removed.')
    }

    const handleCheckboxChange = (event, cookieKeyName) => {
        const { checked } = event.target;
        if (checked) {
            setBuckets((prevBuckets) => [...prevBuckets, cookieKeyName]);
        } else {
            setBuckets((prevBuckets) => prevBuckets.filter((bucket) => bucket !== cookieKeyName));
        }
    }

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchValue(value);

        const filtered = cookies.filter(cookie =>
            cookie.key_name.includes(value) ||
            cookie.details.domain.includes(value) ||
            cookie.details.name.includes(value)
        );

        setFilteredCookies(filtered);
    };

    const handleRowClick = (cookie) => {
        setSelectedCookie(cookie);
    };

    const closeModal = () => {
        setSelectedCookie(null);
    };

    return (
        <div>
            <h1>Cookie Manager</h1>
            <button onClick={removeSelectedCookies}>Remove Selected</button>
            <br/>
            <label htmlFor="search-box">
                Search:
                <input
                    type="text"
                    id="search-box"
                    name="search-box"
                    value={searchValue}
                    onChange={handleSearchChange}
                />
            </label>
            <br/>
            <br/>
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
                {filteredCookies.map((cookie) => (
                    <tr key={cookie.key_name} onClick={() => handleRowClick(cookie.details)}>
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
                            <button onClick={(e) => { e.stopPropagation(); removeCookie(cookie.key_name); }}>Remove</button>
                        </td>
                        <td>{cookie.details.domain}</td>
                        <td>{cookie.details.name}</td>
                        <td>{cookie.details.expirationDate ? new Date(cookie.details.expirationDate * 1000).toLocaleString() : 'Session'}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <CookieDetailModal cookie={selectedCookie} onClose={closeModal} />
        </div>
    );
};

export default Popup;
