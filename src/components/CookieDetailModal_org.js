import React, { useState } from 'react';

const CookieDetail = ({ detail, handleDetailChange }) => {
    if (!detail.value) {
        return null;
    }

    const handleChange = (e) => {
        handleDetailChange(detail.key, e.target.value);
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

    const arrayOfDetails = Object.entries(cookie.details);

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Cookie Details</h2>
                {arrayOfDetails.map(([key, value]) => (
                    <CookieDetail
                        key={key}
                        detail={{ key, value }}
                        handleDetailChange={handleDetailChange}
                    />
                ))}
            </div>
        </div>
    );
};

export default CookieDetailModal;
