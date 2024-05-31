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

const Popup = () => {
    const {cookies, filteredCookies, setFilteredCookies} = useCookies();
    const [buckets, setBuckets] = useState([]);
    const [searchValue, setSearchValue] = useState('');
    const [groupedCookies, setGroupedCookies] = useState({});
    const [groupingCriteria, setGroupingCriteria] = useState('domain');
    const debounceTimerRef = useRef(null);
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

    const handleImportCookies = async (file) => {
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
        <div>
            <h1>Cookie Manager</h1>

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

            <button id="options-button" onClick={openOptionsPage}>Options
            </button>
            <br/>

        </div>
    );
};

export default Popup;
