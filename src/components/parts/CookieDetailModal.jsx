import React from 'react';
import CookieDetail from "./CookieDetail";

/**
 * Component for a single cookie detail.
 * @param cookie
 * @param onClose
 * @param handleDetailChange
 * @returns {Element}
 * @constructor
 */
const CookieDetailModal = ({cookie, onClose, handleDetailChange}) => {
    console.log('CookieDetailModal, cookie: ', cookie);

    // Variable to store the details object of the cookie as an array.
    const arrayOfDetails = Object.entries(cookie.details);

    return (
        // <div className="modal p-12 bg-gray-900 bg-opacity-75">
        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex flex-col items-center justify-center p-16 z-50">
            <div className="bg-slate-700 text-gray-200 p-8 rounded-lg shadow-lg overflow-auto">
                <div className="flex flex-row justify-center gap-8 items-center border-b">
                    <h2 className="text-xl font-bold">Details of <span
                        className="text-2xl">{cookie.details.name}</span> in <span
                        className="text-2xl">{cookie.details.domain}</span> domain</h2>
                    <span className="text-xl font-bold cursor-pointer hover:ring focus:ring"
                          onClick={onClose}>&times;</span>
                </div>

                <div>
                    <ul className="space-y-4 list-disc w-full pt-4">
                        {arrayOfDetails.map(([key, value]) => (
                            <li key={key} className="text-lg">
                                <CookieDetail
                                    key={key}
                                    detail={{key: key, value: value}}
                                    handleDetailChange={handleDetailChange}
                                    cookie={cookie}
                                />
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
        // </div>
    );
};

export default CookieDetailModal;
