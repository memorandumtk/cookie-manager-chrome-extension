import React from 'react';

const CookieDetail = ({ detail, handleDetailChange, cookie }) => {
    const handleChange = (event) => {
        const { name, value } = event.target;
        console.log('Changed this detail of name: ' + name, ', value: ' + value);
        handleDetailChange(name, value);
    };

    return (
        <div className={'cookie-detail'}>
            <strong>{detail.key}:</strong>
            <label>
                <input
                    type="text"
                    name={detail.key}
                    value={detail.value}
                    onChange={handleChange}
                />
            </label>
        </div>
    );
};

const CookieDetailModal = ({ cookie, onClose, handleDetailChange }) => {
    console.log('CookieDetailModal, cookie: ', cookie);

    // Variable to store the details object of the cookie as an array.
    const arrayOfDetails = Object.entries(cookie.details);

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Details</h2>
                {arrayOfDetails.map(([key, value]) => (
                    <CookieDetail
                        key={key}
                        detail={{ key: key, value: value }}
                        handleDetailChange={handleDetailChange}
                        cookie={cookie}
                    />
                ))}
            </div>
        </div>
    );
};

export default CookieDetailModal;
