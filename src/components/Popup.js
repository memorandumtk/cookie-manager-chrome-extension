import React, {useEffect, useState, useRef} from 'react';
import {openDB} from 'idb';
import {initDB} from '../utils/InitDB.js';
import CookieDetailModal from './CookieDetailModal.js';
import '../css/popup.css';

/**
 *Function to get the stored cookies from IndexedDB
 */
async function getAllCookies(db) {
    const allCookies = await db.getAll('cookies');
    return allCookies;
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
    const [groupedCookies, setGroupedCookies] = useState({});
    const [groupingCriteria, setGroupingCriteria] = useState('domain');
    const debounceTimerRef = useRef(null);
    const [sortKey, setSortKey] = useState({domain: 'asc', name: null, expirationDate: null});

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

    useEffect(() => {
        groupCookies(filteredCookies, groupingCriteria);
    }, [filteredCookies, groupingCriteria]);

    function groupCookies(cookies, criteria) {
        const grouped = cookies.reduce((acc, cookie) => {
            const key = cookie.details[criteria] !== null ? cookie.details[criteria] : 'undefined';
            if (!acc[key]) acc[key] = [];
            acc[key].push(cookie);
            return acc;
        }, {});
        console.log(grouped)
        setGroupedCookies(grouped);
    }

    const handleGroupingChange = (event) => {
        setGroupingCriteria(event.target.value);
    };

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

    const toggleCheckbox = (cookieKeyName) => {
        const checkbox = document.getElementById(`checkbox-${cookieKeyName}`);
        checkbox.checked = !checkbox.checked;
    }

    const handleCheckboxChange = (isChecked, cookieKeyName) => {
        if (isChecked) {
            setBuckets((prevBuckets) => [...prevBuckets, cookieKeyName]);
        } else {
            setBuckets((prevBuckets) => prevBuckets.filter((bucket) => bucket !== cookieKeyName));
        }
    }

    const handleCheckboxOfGroupingChange = (isChecked, group) => {
        console.log('This group is checked: ', group);
        const cookies = groupedCookies[group];
        console.log('Cookies of this group: ')
        console.log(cookies);
        console.log('Buckets: ')
        console.log(buckets)
        if (isChecked) {
            cookies.map((cookie) => {
                handleCheckboxChange(true, cookie.key_name)
                return toggleCheckbox(cookie.key_name)
            });
        } else {
            cookies.map((cookie) => {
                handleCheckboxChange(false, cookie.key_name)
                return toggleCheckbox(cookie.key_name)
            });
        }
    }

    const handleSearchChange = (event) => {
        const value = event.target.value;
        setSearchValue(value);

        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            performSearch(value);
        }, 300);
    };

    const performSearch = (value) => {
        let filtered = cookies;
        if (value) {
            filtered = cookies.filter(cookie =>
                cookie.details.domain.includes(value) || cookie.details.name.includes(value)
            );
        }
        setFilteredCookies(filtered);
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


            <label htmlFor="grouping-criteria">
                Group By:
                <select id="grouping-criteria" name="grouping-criteria" value={groupingCriteria}
                        onChange={handleGroupingChange}>
                    <option value="domain">Domain</option>
                    <option value="expirationDate">Expiration Date</option>
                    <option value="session">Is It A Session Cookie?</option>
                    <option value="httpOnly">Is It A Http Only Cookie?</option>
                </select>
            </label>
            <br/>

            <button onClick={removeAllCookies}>Remove All</button>
            <br/>

            <p>Your total number of cookies: {filteredCookies.length}</p>
            <br/>
            <br/>

            {Object.keys(groupedCookies).length > 0 ? (
                Object.entries(groupedCookies).map(([group, cookies]) => (
                    <div key={group}>
                        <div>
                            <h3>{group}</h3>
                            <label htmlFor={`checkbox-${group}`}>
                                <input
                                    name={`checkbox-${group}`}
                                    className={`checkbox-${group}`}
                                    id={`checkbox-${group}`}
                                    type="checkbox"
                                    onChange={(event) => handleCheckboxOfGroupingChange(event.target.checked, group)}
                                />
                            </label>
                        </div>
                        <table>
                            <thead>
                            <tr>
                                <th>Select</th>
                                <th>Action</th>

                                <th>
                                    Domain
                                    {
                                        sortKey.domain === 'asc'
                                            ? <span className="arrow-down-domain"
                                                    onClick={() => sortCookies('domain')}></span>
                                            : <span className="arrow-up-domain"
                                                    onClick={() => sortCookies('domain')}></span>
                                    }
                                </th>
                                <th>
                                    Name
                                    {
                                        sortKey.name === 'asc'
                                            ? <span className="arrow-down-domain"
                                                    onClick={() => sortCookies('name')}></span>
                                            : <span className="arrow-up-domain"
                                                    onClick={() => sortCookies('name')}></span>
                                    }
                                </th>
                                <th>
                                    Expiration Date
                                    {
                                        sortKey.expirationDate === 'asc'
                                            ? <span className="arrow-down-domain"
                                                    onClick={() => sortCookies('expirationDate')}></span>
                                            : <span className="arrow-up-domain"
                                                    onClick={() => sortCookies('expirationDate')}></span>
                                    }
                                </th>
                            </tr>

                            </thead>
                            <tbody>
                            {cookies.map((cookie) => (
                                <tr className={'row-of-cookie-data'} key={cookie.key_name}
                                    onClick={() => handleRowClick(cookie)}>
                                    <td>
                                        <label htmlFor={`checkbox-${cookie.key_name}`}>
                                            <input
                                                name={`checkbox-${cookie.key_name}`}
                                                className={`checkbox-${cookie.key_name}`}
                                                id={`checkbox-${cookie.key_name}`}
                                                type="checkbox"
                                                onChange={(event) => handleCheckboxChange(event.target.checked, cookie.key_name)}
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
                    </div>
                ))
                // {filteredCookies.length > 0 ? (
                //     <table>
                //         <thead>
                //         <tr>
                //             <th>Select</th>
                //             <th>Action</th>
                //             <th>
                //                 Domain
                //                 {
                //                     sortKey.domain === 'asc'
                //                         ? <span className="arrow-down-domain" onClick={() => sortCookies('domain')}></span>
                //                         : <span className="arrow-up-domain" onClick={() => sortCookies('domain')}></span>
                //                 }
                //             </th>
                //             <th>
                //                 Name
                //                 {
                //                     sortKey.name === 'asc'
                //                         ? <span className="arrow-down-domain" onClick={() => sortCookies('name')}></span>
                //                         : <span className="arrow-up-domain" onClick={() => sortCookies('name')}></span>
                //                 }
                //             </th>
                //             <th>
                //                 Expiration Date
                //                 {
                //                     sortKey.expirationDate === 'asc'
                //                         ? <span className="arrow-down-domain"
                //                                 onClick={() => sortCookies('expirationDate')}></span>
                //                         : <span className="arrow-up-domain"
                //                                 onClick={() => sortCookies('expirationDate')}></span>
                //                 }
                //             </th>
                //         </tr>
                //         </thead>
                //         <tbody>
                //         {filteredCookies.map((cookie) => (
                //             <tr className={'row-of-cookie-data'} key={cookie.key_name}
                //                 onClick={() => handleRowClick(cookie)}>
                //                 <td>
                //                     <label htmlFor={`checkbox-${cookie.key_name}`}>
                //                         <input
                //                             name={`checkbox-${cookie.key_name}`}
                //                             className={`checkbox-${cookie.key_name}`}
                //                             id={`checkbox-${cookie.key_name}`}
                //                             type="checkbox"
                //                             onChange={(event) => handleCheckboxChange(event, cookie.key_name)}
                //                         />
                //                     </label>
                //                 </td>
                //                 <td>
                //                     <button onClick={(e) => {
                //                         e.stopPropagation();
                //                         removeCookie(cookie.key_name);
                //                     }}>Remove
                //                     </button>
                //                 </td>
                //                 <td>{highlightText(cookie.details.domain, searchValue)}</td>
                //                 <td>{highlightText(cookie.details.name, searchValue)}</td>
                //                 <td>{cookie.details.expirationDate ? new Date(cookie.details.expirationDate * 1000).toLocaleString() : 'Session'}</td>
                //             </tr>
                //         ))}
                //         </tbody>
                //     </table>
                //
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
