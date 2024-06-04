import React, {useState} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Component for the date filter.
 * @param onDateChange
 * @returns {Element}
 * @constructor
 */
const DateFilter = ({onDateChange}) => {
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const handleStartDateChange = (date) => {
        setStartDate(date);
        onDateChange(date, endDate);
    };

    const handleEndDateChange = (date) => {
        setEndDate(date);
        onDateChange(startDate, date);
    };

    return (
        <>
            <div className="flex flex-row gap-2">
                <label htmlFor="search-start-date"
                       className="block font-semibold text-gray-300">
                    <DatePicker
                        id={"search-start-date"}
                        name={"search-start-date"}
                        selected={startDate}
                        onChange={handleStartDateChange}
                        placeholderText="Expiration Date From(optional):"
                        className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-blue-700 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-700"
                    />
                </label>
            </div>

            <div className="flex flex-row gap-2">
                <label htmlFor="search-end-date"
                       className="block font-semibold text-gray-300">
                    <DatePicker
                        id={"search-end-date"}
                        name={"search-end-date"}
                        selected={endDate}
                        onChange={handleEndDateChange}
                        placeholderText="Expiration Date To:"
                        className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-blue-700 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-700"
                    />
                </label>
            </div>
        </>
    );
};

export default DateFilter;
