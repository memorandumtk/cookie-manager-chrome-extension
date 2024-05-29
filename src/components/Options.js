import React, {useEffect, useState, useRef} from 'react';
import useCookies from '../hooks/UseCookiesCustomHook.js';
import DateFilter from './DateFilter.js';
import {openDB} from 'idb';
import CookieDetailModal from './CookieDetailModal.js';
import '../css/popup.css';
import GetAllCookies from '../utils/GetAllCookies.js';
import ExportCookies from "../utils/ExportCookies";
import ImportCookies from "../utils/ImportCookies";
import removeAllCookies from "../utils/RemoveAllCookies";
import RemoveSelectedCookies from "../utils/RemoveSelectedCookies";
import HighlightText from "../utils/HighlightText";

const Options = () => {
    const {cookies, filteredCookies, setFilteredCookies} = useCookies();
    const [buckets, setBuckets] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [selectedCookie, setSelectedCookie] = useState(null);
    const [groupedCookies, setGroupedCookies] = useState({});
    const [groupingCriteria, setGroupingCriteria] = useState('domain');
    const debounceTimerRef = useRef(null);
    const [sortKey, setSortKey] = useState({domain: 'asc', name: null, expirationDate: null});
    const [dateRange, setDateRange] = useState({startDate: null, endDate: null});

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


    const handleDateChange = (startDate, endDate) => {
        setDateRange({startDate, endDate});
        performSearch(searchValue, {startDate, endDate});
    };

    const removeCookie = async (key_name) => {
        const db = await openDB('cookie-manager', 1);
        await db.delete('cookies', key_name);
        const cookiesData = await GetAllCookies(db);
        setFilteredCookies(cookiesData);
    };

    const handleRemoveSelectedCookies = async () => {
        await RemoveSelectedCookies(buckets, setBuckets, filteredCookies, setFilteredCookies);
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
            performSearch(value, dateRange);
        }, 300);
    };

    const performSearch = (value, dateRange) => {
        let filtered = cookies;
        if (value) {
            filtered = cookies.filter(cookie =>
                cookie.details.domain.includes(value) || cookie.details.name.includes(value)
            );
        }
        if (dateRange.startDate || dateRange.endDate) {
            filtered = filtered.filter(cookie => {
                const expirationDate = cookie.details.expirationDate ? new Date(cookie.details.expirationDate * 1000) : null;
                return (!dateRange.startDate || (expirationDate && expirationDate >= dateRange.startDate)) &&
                    (!dateRange.endDate || (expirationDate && expirationDate <= dateRange.endDate));
            });
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
        const cookiesData = await GetAllCookies(db);
        setFilteredCookies(cookiesData);
    };

    const handleRemoveAllCookies = async () => {
        const cookiesData = await removeAllCookies();
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

    const handleExportCookies = async () => {
        await ExportCookies(filteredCookies);
    }

    const handleImportCookies = async (file) => {
        await ImportCookies(file, setFilteredCookies);
    }

    return (
        <div>
            <h1>Options Page for Cookie Manager</h1>

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
                    <option value="usage">Usage</option>
                </select>
            </label>
            <br/>

            <DateFilter onDateChange={handleDateChange}/>
            <br/>

            <button onClick={handleRemoveAllCookies}>Remove All Cookies</button>
            {
                buckets.length > 0 && (
                    <button onClick={handleRemoveSelectedCookies}>Remove Selected Cookie</button>
                )
            }

            <br/>

            <div>
                <button onClick={handleExportCookies}>Export Cookies</button>
                <input type="file" accept=".json" onChange={(e) => handleImportCookies(e.target.files[0])}/>
            </div>

            <p>Your total number of cookies: {filteredCookies.length}</p>
            <br/>

            {Object.keys(groupedCookies).length > 0 ? (
                <div>
                    <table>
                        <thead>
                        <tr>
                            <th>{/*Making this header empty*/}</th>
                            <th>Action</th>
                            <th>
                                Domain
                                {sortKey.domain === 'asc'
                                    ? <span className="arrow-down-domain"
                                            onClick={() => sortCookies('domain')}></span>
                                    : <span className="arrow-up-domain"
                                            onClick={() => sortCookies('domain')}></span>
                                }
                            </th>
                            <th>
                                Name
                                {sortKey.name === 'asc'
                                    ? <span className="arrow-down-domain"
                                            onClick={() => sortCookies('name')}></span>
                                    : <span className="arrow-up-domain"
                                            onClick={() => sortCookies('name')}></span>
                                }
                            </th>
                            <th>
                                Expiration Date
                                {sortKey.expirationDate === 'asc'
                                    ? <span className="arrow-down-domain"
                                            onClick={() => sortCookies('expirationDate')}></span>
                                    : <span className="arrow-up-domain"
                                            onClick={() => sortCookies('expirationDate')}></span>
                                }
                            </th>
                        </tr>
                        </thead>

                        <tbody>
                        {Object.entries(groupedCookies).map(([group, cookies], index) => (
                            <React.Fragment key={group}>
                                <tr>
                                    <td colSpan="5">
                                        <p>{group}</p>
                                        <label htmlFor={`checkbox-${group}`}>
                                            <input
                                                name={`checkbox-${group}`}
                                                className={`checkbox-${group}`}
                                                id={`checkbox-${group}`}
                                                type="checkbox"
                                                onChange={(event) => handleCheckboxOfGroupingChange(event.target.checked, group)}
                                            />
                                        </label>
                                    </td>
                                </tr>
                                {cookies.map((cookie) => (
                                    <tr className={'row-of-cookie-data'} key={cookie.key_name}>
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
                                                e.preventDefault();
                                                handleRowClick(cookie);
                                            }}>Details
                                            </button>
                                            <button onClick={(e) => {
                                                e.stopPropagation();
                                                removeCookie(cookie.key_name);
                                            }}>Remove
                                            </button>
                                        </td>
                                        <td>{HighlightText(cookie.details.domain, searchValue)}</td>
                                        <td>{HighlightText(cookie.details.name, searchValue)}</td>
                                        <td>{cookie.details.expirationDate ? new Date(cookie.details.expirationDate * 1000).toLocaleString() : 'Session'}</td>
                                    </tr>
                                ))}
                            </React.Fragment>
                        ))}
                        </tbody>
                    </table>
                </div>
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

export default Options;
