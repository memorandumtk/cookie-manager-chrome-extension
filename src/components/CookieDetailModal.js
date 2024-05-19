import React from 'react';

const CookieDetail = ({detail}) => {
    if (!detail.value) {
        return null;
    }
    return (
        <div className={'cookie-detail'}>
           <strong>{detail.key}:</strong>
            <label>
                <input type="text" value={detail.value} readOnly/>
            </label>
        </div>
    )
}

const CookieDetailModal = ({ cookie, onClose }) => {
    if (!cookie) return null;

    const details = Object.entries(cookie);

    return (
        <div className="modal">
            <div className="modal-content">
                <span className="close" onClick={onClose}>&times;</span>
                <h2>Cookie Details</h2>
                {details.map(([key, value]) => (
                    // <p key={key}><strong>{key}:</strong> {value}</p>
                    <CookieDetail key={key} detail={{key: key, value: value}} />
                ))}
            </div>
        </div>
    );
};

export default CookieDetailModal;
