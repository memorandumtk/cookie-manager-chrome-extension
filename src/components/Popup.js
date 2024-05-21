import React, {useEffect, useState, useRef} from 'react';
import {openDB} from 'idb';
import {initDB} from '../utils/InitDB.js';
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
    const debounceTimerRef = useRef(null);
    const [sortKey, setSortKey] = useState({domain: null, name: 'asc', expirationDate: null});

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
        const {checked} = event.target;
        if (checked) {
            setBuckets((prevBuckets) => [...prevBuckets, cookieKeyName]);
        } else {
            setBuckets((prevBuckets) => prevBuckets.filter((bucket) => bucket !== cookieKeyName));
        }
    }

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchValue(value);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            if (!value) {
                setFilteredCookies(cookies);
            } else {
                const filtered = cookies.filter(cookie =>
                    cookie.details.domain.includes(value) || cookie.details.name.includes(value)
                );
                setFilteredCookies(filtered);
            }
        }, 1000);
    };

    const handleRowClick = (cookie) => {
        setSelectedCookie(cookie);
    };

    const closeModal = () => {
        setSelectedCookie(null);
    };

    const handleDetailChange = async (name, value) => {
        const updatedCookie = {...selectedCookie, details: {...selectedCookie.details, [name]: value}};
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

    const sortCookies = (key) => {
        console.log(key + ' order will be sorted in the order as opposite as: ', sortKey[key]);
        const sortedCookies = [...filteredCookies].sort((a, b) => {
            if (a.details[key] > b.details[key]) {
                return sortKey[key] === 'asc' ? -1 : 1;
            }
            if (a.details[key] < b.details[key]) {
                return sortKey[key] === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setFilteredCookies(sortedCookies);
        setSortKey({...sortKey, [key]: sortKey[key] === 'asc' ? 'desc' : 'asc'});
    }

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
            <br/>

            {filteredCookies.length > 0 ? (
                <table>
                    <thead>
                    <tr>
                        <th>Select</th>
                        <th>Action</th>
                        <th>
                            Domain
                            {
                                sortKey.domain === 'asc'
                                    ? <span className="arrow-down-domain" onClick={() => sortCookies('domain')}></span>
                                    : <span className="arrow-up-domain" onClick={() => sortCookies('domain')}></span>
                            }
                        </th>
                        <th>
                            Name
                            {
                                sortKey.name === 'asc'
                                    ? <span className="arrow-down-domain" onClick={() => sortCookies('name')}></span>
                                    : <span className="arrow-up-domain" onClick={() => sortCookies('name')}></span>
                            }
                        </th>
                        <th>
                            Expiration Date
                        </th>
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
