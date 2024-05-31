import React, {useState} from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
            <div className="flex flex-col gap-2">
                <label htmlFor="search-box"
                       className="block font-semibold text-lg text-gray-300">
                    Start Date:
                </label>
                <DatePicker
                    selected={startDate}
                    onChange={handleStartDateChange}
                    className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-blue-700 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-700"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label htmlFor="search-box"
                       className="block font-semibold text-lg text-gray-300">
                    End Date:
                </label>
                <DatePicker
                    selected={endDate}
                    onChange={handleEndDateChange}
                    className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-blue-700 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-700"
                />
            </div>
        </>
    );
};

export default DateFilter;
