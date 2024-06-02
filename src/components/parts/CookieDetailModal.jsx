import React from 'react';
import CookieDetail from "./CookieDetail";
import Background from "./Background";

/**
 * Component for a single cookie detail.
 * @param cookie
 * @param onClose
 * @param handleDetailChange
 * @returns {Element}
 * @constructor
 */
const CookieDetailModal = ({cookie, onClose, onDetailChange}) => {
    console.log('CookieDetailModal, cookie: ', cookie);

    // Variable to store the details object of the cookie as an array.
    const arrayOfDetails = Object.entries(cookie.details);

    return (
        <div className="fixed inset-0 flex flex-col items-center justify-center p-16 z-50">
            <Background className="text-gray-200 rounded-lg shadow-lg overflow-auto">
                <div className="flex flex-row justify-center gap-8 items-center border-b">
                    <h2 className="text-base font-bold">Details of{'  '}<span
                        className="text-2xl">{cookie.details.name}</span>{'  '}of {'  '}<span
                        className="text-2xl">{cookie.details.domain}</span></h2>
                    <span
                        className="text-xl font-bold cursor-pointer hover:font-extrabold focus:font-extrabold transition"
                        onClick={onClose}>&times;</span>
                </div>

                <div>
                    <ul className="space-y-4 list-disc w-full pt-4">
                        {arrayOfDetails.map(([key, value]) => (
                            <li key={key} className="text-lg">
                                <CookieDetail
                                    key={key}
                                    detail={{key: key, value: value}}
                                    handleDetailChange={onDetailChange}
                                    cookie={cookie}
                                />
                            </li>
                        ))}
                    </ul>
                </div>

            </Background>
        </div>
    )
        ;
};

export default CookieDetailModal;
