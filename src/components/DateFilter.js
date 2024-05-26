import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const DateFilter = ({ onDateChange }) => {
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
        <div>
            <label>
                Start Date:
                <DatePicker selected={startDate} onChange={handleStartDateChange} />
            </label>
            <label>
                End Date:
                <DatePicker selected={endDate} onChange={handleEndDateChange} />
            </label>
        </div>
    );
};

export default DateFilter;
