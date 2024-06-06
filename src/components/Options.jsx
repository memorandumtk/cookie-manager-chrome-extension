import React, {useEffect, useState, useRef} from 'react';
import useCookies from "../hooks/useCookies";
import CookieDetailModal from './parts/CookieDetailModal.jsx';
import DateFilter from './parts/DateFilter.jsx';
import Checkbox from "./parts/Checkbox.jsx";
import {openDB} from 'idb';
import '../css/options.css';
import GetAllCookies from '../utils/GetAllCookies.js';
import ExportCookies from "../utils/ExportCookies";
import ImportCookies from "../utils/ImportCookies";
import RemoveAllCookies from "../utils/RemoveAllCookies";
import RemoveSelectedCookies from "../utils/RemoveSelectedCookies";
import HighlightText from "../utils/HighlightText";
import FileInput from "./parts/FileInput";
import CheckboxForOneCookie from "./parts/CheckboxForOneCookie";
import {FaTrashAlt, FaUpload, FaDownload, FaCog, FaSearch} from 'react-icons/fa';
import {FaRegTrashCan} from "react-icons/fa6";
import RemoveCookie from "../utils/RemoveCookie";
import Background from "./parts/Background";
import DetailChange from "../utils/DetailChange";

const Options = () => {
    const {cookies, setCookies, filteredCookies, setFilteredCookies} = useCookies();
    const [buckets, setBuckets] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [selectedCookie, setSelectedCookie] = useState(null);
    const [groupedCookies, setGroupedCookies] = useState({});
    const [groupingCriteria, setGroupingCriteria] = useState('domain');
    const debounceTimerRef = useRef(null);
    const [dateRange, setDateRange] = useState({startDate: new Date(), endDate: null});
    const [fileName, setFileName] = useState(null);
    const [sortKey, setSortKey] = useState({domain: 'asc', name: null, expirationDate: null});

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

    const handleRemoveSelectedCookies = async () => {
        await RemoveSelectedCookies(buckets, setBuckets, setCookies, setFilteredCookies);
    }

    const toggleCheckbox = (cookieKeyName) => {
        const checkbox = document.getElementById(`checkbox-${cookieKeyName}`);
        checkbox.checked = !checkbox.checked;
    }

    const handleCheckboxChange = (isChecked, cookie) => {
        console.log('This cookie is checked: ', cookie);
        if (isChecked) {
            setBuckets((prevBuckets) => [...prevBuckets, cookie]);
        } else {
            setBuckets((prevBuckets) => prevBuckets.filter((bucket) => bucket !== cookie));
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
                handleCheckboxChange(true, cookie)
                return toggleCheckbox(cookie.key_name)
            });
        } else {
            cookies.map((cookie) => {
                handleCheckboxChange(false, cookie)
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

    const handleDateChange = (startDate, endDate) => {
        setDateRange({startDate, endDate});
        performSearch(searchValue, {startDate, endDate});
    };

    const performSearch = (value, dateRange) => {
        let filtered = filteredCookies;
        if (value) {
            filtered = cookies.filter(cookie =>
                cookie.details.domain.includes(value) || cookie.details.name.includes(value)
            );
        }
        if (dateRange.endDate) {
            dateRange.startDate = dateRange.startDate ? new Date(dateRange.startDate) : new Date();
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
        await DetailChange(name, value, selectedCookie, setSelectedCookie, setFilteredCookies);
    };

    const handleRemoveAllCookies = async () => {
        await RemoveAllCookies(cookies, setCookies, setFilteredCookies);
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
        await ImportCookies(file, setCookies, setFilteredCookies);
    }

    return (
        <Background className={`p-12 font-sans text-gray-200 text-base min-h-screen	`}>
            <div className={selectedCookie ? "relative bg-opacity-50" : "relative"}>
                <Background className="sticky top-0 left-0 w-full z-50 cookie-stats">
                    <div className="flex flex-row items-center justify-center px-6 pb-4 gap-6">
                        <p className="text-slate-200 text-xl font-bold">Your total number of cookies: {' '}
                            <span className="text-2xl">{
                                cookies.length
                            }</span>
                        </p>

                        {(cookies.length !== filteredCookies.length && searchValue) && (
                            <p className="text-slate-200 text-xl font-bold">Filtered cookies: {' '}
                                <span className="text-2xl">{filteredCookies.length}</span>
                            </p>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 items-center">
                        <div className="grid grid-cols-2 gap-8 items-center justify-center">
                            <form className="flex flex-col gap-2">
                                <div className="flex flex-row items-center gap-2">
                                    <p>Search For:</p>
                                    <label htmlFor="search-box"
                                           className="block font-semibold text-gray-300">
                                        <input
                                            type="text"
                                            id="search-box"
                                            name="search-box"
                                            value={searchValue}
                                            placeholder={"Word may be in domain or name of a cookie..."}
                                            onChange={handleSearchChange}
                                            className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-slate-900 focus:ring focus:ring-blue-300 focus:ring-opacity-50 hover:border-slate-900"
                                            title={"Search for cookies by domain or name"}
                                        />
                                    </label>
                                </div>

                                <div className="flex flex-row gap-4 items-center">
                                    <DateFilter onDateChange={handleDateChange}/>
                                </div>

                            </form>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="search-box"
                                       className="block font-semibold text-gray-300">Group By:</label>
                                <select
                                    id="grouping-criteria"
                                    name="grouping-criteria"
                                    value={groupingCriteria}
                                    onChange={handleGroupingChange}
                                    title={"Group by the selected criteria"}
                                    className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-slate-900 focus:ring focus:ring-blue-300 focus:ring-opacity-50 hover:border-slate-900"
                                >
                                    <option value="domain">Domain</option>
                                    <option value="expirationDate">Expiration Date</option>
                                    <option value="session">Is It A Session Cookie?</option>
                                    <option value="usage">Usage</option>
                                </select>
                            </div>

                        </div>

                        <div className="flex flex-wrap gap-4 p-2 justify-center items-center">
                            <div className="flex flex-row gap-4">
                                <button onClick={handleRemoveAllCookies}
                                        className="flex items-center gap-2 bg-red-300 text-white py-2 px-4 rounded-md hover:bg-red-700 transition">
                                    <FaTrashAlt/>
                                    Remove All
                                </button>
                                {buckets.length > 0 && (
                                    <button onClick={handleRemoveSelectedCookies}
                                            className="flex items-center gap-2 bg-red-300 text-white py-2 px-4 rounded-md hover:bg-red-700 transition">
                                        <FaRegTrashCan/>
                                        Remove Selected
                                    </button>
                                )}
                            </div>

                            <div>
                                <button onClick={handleExportCookies}
                                        className="flex gap-2 items-center bg-blue-300 hover:bg-blue-600 focus:bg-blue-600
                                    text-white py-2 px-4 rounded-md transition duration-150 ease-in-out">
                                    <FaDownload/>
                                    Export
                                </button>
                            </div>
                            <div className="flex flex-row flex gap-2 items-center justify-center">
                                <FileInput id="file_input" onFileChange={handleImportCookies} fileName={fileName}/>
                            </div>
                        </div>
                    </div>
                </Background>

                {Object.keys(groupedCookies).length > 0 ? (
                    <div className="overflow-auto relative">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="table-header">
                            <tr className="p-2 font-bold border-b-2 border-gray-200">
                                <th className="p-2">{/* Empty Header */}</th>
                                <th className="p-2">{/* Empty Header */}</th>
                                <th className="p-2">{/* Empty Header */}</th>
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
                            <tbody className="">
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
                                                    cookie={cookie}
                                                    id={`checkbox-${cookie.key_name}`}
                                                    onChange={handleCheckboxChange}
                                                />
                                            </td>
                                            <td className="p-2">
                                                <button
                                                    onClick={async (event) => {
                                                        event.stopPropagation();
                                                        await RemoveCookie(cookie, setCookies, setFilteredCookies);
                                                    }}
                                                    className="bg-red-400 text-white py-1 px-2 rounded-md"
                                                >
                                                    <FaTrashAlt/>
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
            </div>
            {selectedCookie && (
                <CookieDetailModal
                    cookie={selectedCookie}
                    onClose={closeModal}
                    onDetailChange={handleDetailChange}
                />
            )}
        </Background>
    )
};
export default Options;
