import { useEffect, useState } from 'react';
import GetAllCookies from '../utils/GetAllCookies';

/**
 * Custom hook to fetch and store cookies data into cookies and filteredCookies.
 * @returns {{setFilteredCookies: (value: (((prevState: *[]) => *[]) | *[])) => void, cookies: *[], filteredCookies: *[]}}
 */
const useCookies = () => {
    const [cookies, setCookies] = useState([]);
    const [filteredCookies, setFilteredCookies] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            const cookiesData = await GetAllCookies();
            setCookies(cookiesData);
            setFilteredCookies(cookiesData);
        };

        fetchData();
    }, []);

    return { cookies, filteredCookies, setFilteredCookies };
};

export default useCookies;
