
import React from "react";

/**
 * Component for a single cookie detail.
 */
const CookieDetail = ({detail, handleDetailChange, cookie}) => {
    const handleChange = (event) => {
        const {name, value} = event.target;
        console.log('Changed this detail of name: ' + name, ', value: ' + value);
        handleDetailChange(name, value);
    };

    return (
        <div className="flex items-center gap-4">
            <strong className="w-1/3 text-lg font-semibold">{detail.key}:</strong>
            {detail.key === 'value' || detail.key === 'expirationDate' ? (
                <label className="w-2/3">
                    <input
                        type="text"
                        name={detail.key}
                        value={detail.value}
                        onChange={handleChange}
                        className="w-full p-2 border border-gray-300 rounded-md text-gray-700 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
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
