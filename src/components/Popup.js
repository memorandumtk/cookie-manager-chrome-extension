import React, { useEffect, useState } from 'react';
import { openDB } from 'idb';
import { initDB } from '../utils/InitDB.js';
import CookieDetailModal from './CookieDetailModal.js';
import '../css/popup.css';

/**
 *Function to get the stored cookies from IndexedDB
 */
async function getAllCookies(db) {
    return await db.getAll('cookies');
}

/**
 * Function to highlight the text
 */
const highlightText = (text, highlight) => {
    if (!highlight) return text;

    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return parts.map((part, index) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={index} className="highlight">{part}</span>
        ) : (
            part
        )
    );
};

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

    const removeCookie = async (key_name) => {
        const db = await openDB('cookie-manager', 1);
        await db.delete('cookies', key_name);
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
        // If the search value is empty, set the filtered cookies to all cookies.
        if (!value) {
            setFilteredCookies(cookies);
        }

        setSearchValue(value);

        const filtered = cookies.filter(cookie =>
            // Check if the search value is included in the key_name generated by the domain and name.
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

    const handleDetailChange = async (name, value) => {
        const updatedCookie = { ...selectedCookie, details: { ...selectedCookie.details, [name]: value } };
        setSelectedCookie(updatedCookie);

        console.log('updated: ', updatedCookie);
        const db = await openDB('cookie-manager', 1);
        const tx = db.transaction('cookies', 'readwrite');
        const store = tx.objectStore('cookies');

        await store.put(updatedCookie); // Corrected line: no key parameter

        await tx.done;
        const cookiesData = await getAllCookies(db);
        setCookies(cookiesData);
        setFilteredCookies(cookiesData);
    };

    const removeAllCookies = async () => {
        const db = await openDB('cookie-manager', 1);
        await db.clear('cookies');
        const cookiesData = await getAllCookies(db);
        setCookies(cookiesData);
        setFilteredCookies(cookiesData);
    }

    // Function to export cookies to a JSON file
    const exportCookies = async (cookies) => {
        const blob = new Blob([JSON.stringify(cookies)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'cookies.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    // Function to import cookies from a JSON file
    const importCookies = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const cookies = JSON.parse(e.target.result);
            const db = await openDB('cookie-manager', 1);
            const tx = db.transaction('cookies', 'readwrite');
            const store = tx.objectStore('cookies');

            for (const cookie of cookies) {
                await store.put(cookie);
            }

            await tx.done;
            // Update the state to reflect the new cookies
            const cookiesData = await getAllCookies(db);
            setCookies(cookiesData);
            setFilteredCookies(cookiesData);
        };
        reader.readAsText(file);
    };

    return (
        <div>
            <h1>Cookie Manager</h1>

            <button onClick={removeSelectedCookies}>Remove Selected Cookie</button>

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

            <button onClick={removeAllCookies}>Remove All</button>
            <br/>

            <p>Your total number of cookies: {filteredCookies.length}</p>
            <br/>

            <div>
                <button onClick={() => exportCookies(filteredCookies)}>Export Cookies</button>
                <input type="file" accept=".json" onChange={(e) => importCookies(e.target.files[0])}/>
            </div>
            <br/>
            <br/>

            {filteredCookies.length > 0 ? (
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
                        <tr className={'row-of-cookie-data'} key={cookie.key_name}
                            onClick={() => handleRowClick(cookie)}>
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
                                <button onClick={(e) => {
                                    e.stopPropagation();
                                    removeCookie(cookie.key_name);
                                }}>Remove
                                </button>
                            </td>
                            <td>{highlightText(cookie.details.domain, searchValue)}</td>
                            <td>{highlightText(cookie.details.name, searchValue)}</td>
                            <td>{cookie.details.expirationDate ? new Date(cookie.details.expirationDate * 1000).toLocaleString() : 'Session'}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>

            ) : (
                <p>No data matched your search criteria.</p>
            )}

            {selectedCookie && (
                <CookieDetailModal
                    cookie={selectedCookie}
                    onClose={closeModal}
                    handleDetailChange={handleDetailChange}
                />
            )}
        </div>
    );
};

export default Popup;
