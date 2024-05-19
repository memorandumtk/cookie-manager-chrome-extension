import React from 'react';

const CookieDetailModal = ({ cookie, onClose }) => {
    if (!cookie) return null;

    const details = Object.entries(cookie);

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Cookie Details</h2>
                {details.map(([key, value]) => (
                    <p key={key}><strong>{key}:</strong> {value}</p>
                ))}
            </div>
        </div>
    );
};

export default CookieDetailModal;
