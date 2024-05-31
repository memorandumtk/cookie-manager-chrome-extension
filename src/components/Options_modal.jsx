import React, {useEffect, useState, useRef} from 'react';
import useCookies from '../hooks/UseCookiesCustomHook.js';
import CookieDetailModal from './parts/CookieDetailModal.jsx';
import DateFilter from './parts/DateFilter.jsx';
import Checkbox from "./parts/Checkbox.jsx";
import {openDB} from 'idb';
import '../css/options.css';
import GetAllCookies from '../utils/GetAllCookies.js';
import ExportCookies from "../utils/ExportCookies";
import ImportCookies from "../utils/ImportCookies";
import removeAllCookies from "../utils/RemoveAllCookies";
import RemoveSelectedCookies from "../utils/RemoveSelectedCookies";
import HighlightText from "../utils/HighlightText";
import FileInput from "./parts/FileInput";
import CheckboxForOneCookie from "./parts/CheckboxForOneCookie";

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
    const [fileName, setFileName] = useState(null);

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
        console.log('This cookie is checked: ', cookieKeyName);
        if (isChecked) {
            setBuckets((prevBuckets) => [...prevBuckets, cookieKeyName]);
        } else {
            setBuckets((prevBuckets) => prevBuckets.filter((bucket) => bucket !== cookieKeyName));
        }
    }

    const handleCheckboxOfGroupingChange = (event, group) => {
        event.stopPropagation();
        const isChecked = event.target.checked;
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

    const handleRowClick = (event, cookie) => {
        event.stopPropagation();
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

    const handleImportCookies = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setFileName(file.name);
        }
        await ImportCookies(file, setFilteredCookies);
    }

    return (
        <div className="p-12 font-sans bg-slate-700 text-gray-200 text-base">
            {/*If a cookie object is selected, the cookie details will be displayed in the modal.*/}
            {selectedCookie ?
                (
                    <CookieDetailModal
                        cookie={selectedCookie}
                        onClose={closeModal}
                        onDetailChange={handleDetailChange}
                    />
                ) : (
                    <>
                        <h1 className="text-4xl font-bold text-center mb-6 text-white">Options Page for Cookie
                            Manager</h1>

                        <div className="flex flex-col gap-4">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 items-center justify-center">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="search-box"
                                           className="block font-semibold text-lg text-gray-300">Search:</label>
                                    <input
                                        type="text"
                                        id="search-box"
                                        name="search-box"
                                        value={searchValue}
                                        placeholder={"Enter a word may be in domain or name of a cookie..."}
                                        onChange={handleSearchChange}
                                        className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-slate-900 focus:ring focus:ring-blue-300 focus:ring-opacity-50 hover:border-slate-900"
                                    />

                                </div>

                                <div className="flex flex-col gap-2">
                                    <label htmlFor="search-box"
                                           className="block font-semibold text-lg text-gray-300">Group By:</label>
                                    <select
                                        id="grouping-criteria"
                                        name="grouping-criteria"
                                        value={groupingCriteria}
                                        onChange={handleGroupingChange}
                                        className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-slate-900 focus:ring focus:ring-blue-300 focus:ring-opacity-50 hover:border-slate-900"
                                    >
                                        <option value="domain">Domain</option>
                                        <option value="expirationDate">Expiration Date</option>
                                        <option value="session">Is It A Session Cookie?</option>
                                        <option value="usage">Usage</option>
                                    </select>
                                </div>

                                <div className="flex flex-row gap-4 items-center">
                                    <DateFilter onDateChange={handleDateChange}/>
                                </div>

                            </div>

                            <div className="flex flex-wrap gap-4 p-2 justify-center items-center">
                                <div className="flex flex-row gap-4">
                                    <button onClick={handleRemoveAllCookies}
                                            className="bg-red-400 text-white py-2 px-4 rounded-md">
                                        Remove All Cookies
                                    </button>
                                    {buckets.length > 0 && (
                                        <button onClick={handleRemoveSelectedCookies}
                                                className="bg-red-400 text-white py-2 px-4 rounded-md">Remove Selected
                                            Cookies</button>
                                    )}
                                </div>

                                <div>
                                    <button onClick={handleExportCookies}
                                        className="bg-blue-200 hover:bg-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50 text-white py-2 px-4 rounded-md transition duration-150 ease-in-out"
                                            >
                                        Export Cookies
                                    </button>
                                </div>
                                <div className="p-2 flex-row flex gap-2 items-center justify-center">
                                    <FileInput id="file_input" onFileChange={handleImportCookies} fileName={fileName}/>
                                </div>
                            </div>
                        </div>

                        <p className="px-4 text-slate-200 text-xl font-bold">Your total number of cookies: {' '}
                            <span className="text-2xl">{filteredCookies.length}</span>
                        </p>

                        {Object.keys(groupedCookies).length > 0 ? (
                            <div className="overflow-auto">
                                {/*<table className="w-full border-collapse rounded-sm mb-4">*/}
                                <table className="min-w-full divide-y divide-gray-200">
                                        <thead>
                                        <tr className="p-2 font-bold border-b-2 border-gray-200">
                                            <th className="p-2">{/* Empty Header */}</th>
                                            <th className="p-2">{/* Empty Header */}</th>
                                            <th className="p-2 uppercase tracking-wider">Action</th>
                                            <th className="p-2 cursor-pointer uppercase tracking-wider hover:bg-gray-100 hover:text-slate-700"
                                                onClick={() => sortCookies('domain')}>
                                                Domain
                                                {sortKey.domain === 'asc' ? (
                                                    <span className="ml-1 text-sm">▲</span>
                                                ) : (
                                                    <span className="ml-1 text-sm">▼</span>
                                                )}
                                            </th>
                                            <th className="p-2 cursor-pointer uppercase tracking-wider hover:bg-gray-100 hover:text-slate-700"
                                                onClick={() => sortCookies('name')}>
                                                Name
                                                {sortKey.name === 'asc' ? (
                                                    <span className="ml-1 text-sm">▲</span>
                                                ) : (
                                                    <span className="ml-1 text-sm">▼</span>
                                                )}
                                            </th>
                                            <th className="p-2 cursor-pointer uppercase tracking-wider hover:bg-gray-100 hover:text-slate-700"
                                                onClick={() => sortCookies('expirationDate')}>
                                                Expiration Date
                                                {sortKey.expirationDate === 'asc' ? (
                                                    <span className="ml-1 text-sm">▲</span>
                                                ) : (
                                                    <span className="ml-1 text-sm">▼</span>
                                                )}
                                            </th>
                                        </tr>
                                        </thead>
                                    <tbody>
                                    {Object.entries(groupedCookies).map(([group, cookies]) => (
                                        <React.Fragment key={group}>
                                            <tr>
                                                <td colSpan="4" className="p-2">
                                                    <Checkbox
                                                        key={group}
                                                        id={`group-checkbox-${group}`}
                                                        label={group}
                                                        onChange={(e) => handleCheckboxOfGroupingChange(e, group)}
                                                        disabled={false}
                                                    />
                                                </td>
                                            </tr>
                                            {cookies.map(cookie => (
                                                <tr key={cookie.key_name}
                                                    onClick={(e) => handleRowClick(e, cookie)}
                                                    className="hover:bg-gray-100 cursor-pointer hover:text-slate-700 text-center"
                                                >
                                                    <td>
                                                        {/*Empty td for alignment */}
                                                    </td>
                                                    <td className="p-2">
                                                        <CheckboxForOneCookie
                                                            keyName={cookie.key_name}
                                                            id={`checkbox-${cookie.key_name}`}
                                                            label={''}
                                                            onChange={handleCheckboxChange}
                                                            disabled={false}
                                                        />
                                                    </td>
                                                    <td className="p-2">
                                                        <button
                                                            onClick={(event) => {
                                                                event.stopPropagation();
                                                                removeCookie(cookie.key_name);
                                                            }}
                                                            className="bg-red-400 text-white py-1 px-2 rounded-md"
                                                        >
                                                            Remove
                                                        </button>
                                                    </td>
                                                    <td className="p-2">{HighlightText(cookie.details.domain, searchValue)}</td>
                                                    <td className="p-2">{HighlightText(cookie.details.name, searchValue)}</td>
                                                    <td className="p-2">{cookie.details.expirationDate ? new Date(cookie.details.expirationDate * 1000).toLocaleString() : 'Session Cookie'}</td>
                                                </tr>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                            ) : (
                            <p>No cookies found.</p>
                        )}
                    </>
                )}
        </div>
    )
};
export default Options;
