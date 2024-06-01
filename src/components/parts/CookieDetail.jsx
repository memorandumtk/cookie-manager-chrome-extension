import React, {useEffect, useState} from "react";
import DatePicker from "react-datepicker";

/**
 * Component for a single cookie detail.
 */
const CookieDetail = ({detail, handleDetailChange, cookie}) => {
    const [expirationDate, setExpirationDate] = useState(detail.key === 'expirationDate' ? new Date(detail.value * 1000) : null);

    useEffect(() => {
        if (detail.key === 'expirationDate') {
            setExpirationDate(new Date(detail.value * 1000));
        }
    }, [detail]);

    const handleChange = (name, value) => {
        console.log('Changed this detail of name: ' + name, ', value: ' + value);
        handleDetailChange(name, value);
    };

    const handleExpirationDateChange = (date) => {
        setExpirationDate(date);
        const timestamp = Math.floor(date.getTime() / 1000);
        console.log('Changed expirationDate to:', timestamp);
        handleDetailChange('expirationDate', timestamp);
    };

    return (
        <div className="flex items-center gap-4">
            <strong className="w-1/3 text-lg font-semibold">{detail.key}:</strong>
            {detail.key === 'value' ? (
                <label className="w-2/3">
                    <input
                        type="text"
                        name={detail.key}
                        value={detail.value}
                        onChange={e => {
                            handleChange(e.target.name, e.target.value)
                        }}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </label>
            ) : detail.key === 'expirationDate' ? (
                <label className="w-2/3">
                    <DatePicker
                        selected={expirationDate}
                        onChange={handleExpirationDateChange}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="Pp"
                        className="w-full p-2 border rounded-md text-gray-800 bg-gray-50 focus:border-blue-700 focus:ring focus:ring-blue-500 focus:ring-opacity-50 hover:border-blue-700"
                    />
                </label>
            ) : (
                <p className="w-2/3 p-2 text-gray-200 rounded-md">
                    {detail.value === true ? 'true' : detail.value === false ? 'false' : detail.value}
                </p>
            )}
        </div>
    );
};

export default CookieDetail;
