import React, {useEffect, useState, useRef} from 'react';
import useCookies from '../hooks/UseCookiesCustomHook.js';
import DateFilter from './parts/DateFilter.jsx';
import {openDB} from 'idb';
import '../css/popup.css';
import GetAllCookies from '../utils/GetAllCookies.js';
import ExportCookies from "../utils/ExportCookies";
import ImportCookies from "../utils/ImportCookies";
import removeAllCookies from "../utils/RemoveAllCookies";
import RemoveSelectedCookies from "../utils/RemoveSelectedCookies";
import FileInput from "./parts/FileInput";
import { FaTrashAlt, FaUpload, FaDownload, FaCog, FaSearch } from 'react-icons/fa';

const Popup = () => {
    const {cookies, filteredCookies, setFilteredCookies} = useCookies();
    const [buckets, setBuckets] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [groupedCookies, setGroupedCookies] = useState({});
    const [groupingCriteria, setGroupingCriteria] = useState('domain');
    const debounceTimerRef = useRef(null);
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

    const handleRemoveSelectedCookies = async () => {
        await RemoveSelectedCookies(buckets, setBuckets, filteredCookies, setFilteredCookies);
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

    const handleRemoveAllCookies = async () => {
        const cookiesData = await removeAllCookies();
        setFilteredCookies(cookiesData);
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

    const openOptionsPage = () => {
        if (chrome && chrome.runtime && chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            console.error('chrome.runtime.openOptionsPage is not available');
        }
    };

    return (
        <div className="w-96 p-6 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-gray-200 rounded-lg shadow-lg font-sans">
            <h1 className="text-2xl font-bold mb-4 text-center">Cookie Manager</h1>

            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2">
                    <FaSearch className="text-gray-300"/>
                    <input
                        type="text"
                        id="search-box"
                        name="search-box"
                        value={searchValue}
                        placeholder="Search by domain or name..."
                        onChange={handleSearchChange}
                        className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-indigo-600 focus:ring focus:ring-indigo-300 focus:ring-opacity-50"
                    />
                </div>

                <div className="flex flex-wrap gap-2 justify-between">
                    <button onClick={handleRemoveAllCookies} className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition">
                        <FaTrashAlt />
                        Remove All
                    </button>
                    {buckets.length > 0 && (
                        <button onClick={handleRemoveSelectedCookies} className="flex items-center gap-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition">
                            <FaTrashAlt />
                            Remove Selected
                        </button>
                    )}
                    <button onClick={handleExportCookies} className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition">
                        <FaDownload />
                        Export
                    </button>
                    <div className="flex items-center gap-2">
                        <FaUpload className="text-gray-300"/>
                        <FileInput id="file_input" onFileChange={handleImportCookies} fileName={fileName}/>
                    </div>
                </div>

                <p className="text-center">Total cookies: <span className="font-bold">{filteredCookies.length}</span></p>

                <button onClick={openOptionsPage} className="flex items-center gap-2 bg-gray-700 text-white py-2 px-4 rounded-md hover:bg-gray-800 transition mx-auto">
                    <FaCog />
                    Options
                </button>
            </div>
        </div>
    );
};

export default Popup;
