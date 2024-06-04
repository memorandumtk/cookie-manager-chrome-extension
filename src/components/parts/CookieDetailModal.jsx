import React, {useEffect, useState, useRef} from 'react';
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
    // State to store the local changes
    const [localDetails, setLocalDetails] = useState(cookie.details);
    const outsideModalRef = useRef(null);

    const handleDetailChangeSubmit = async (event) => {
        event.preventDefault();
        console.log('Submit button clicked');
        console.log('this is the local details', localDetails);
        // Call the onDetailChange with the updated details
        Object.entries(localDetails).map(async ([name, value]) => {
            console.log('this is the name and value', name, value);
            await onDetailChange(name, value);
        })
        onClose();
    };

    const handleInputChange = (name, value) => {
        console.log('this is the name and value', name, value);
        setLocalDetails(prevDetails => ({ ...prevDetails, [name]: value }));
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Escape') {
            onClose();
        }
    };

    const handleClickOutside = (event) => {
        if (outsideModalRef.current && outsideModalRef.current === event.target) {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const arrayOfDetails = Object.entries(localDetails);

    return (
        <div ref={outsideModalRef} className="fixed inset-0 flex flex-col items-center justify-center p-16 z-50">
            <Background className="text-gray-200 rounded-[32px] border-1 border-blue-200 shadow-lg shadow-blue-200 overflow-auto p-8">
                <div  className="flex flex-row justify-center gap-8 items-center border-b">
                    <h2 className="text-base font-bold">Details of{'  '}<span
                        className="text-2xl">{cookie.details.name}</span>{'  '}of {'  '}<span
                        className="text-2xl">{cookie.details.domain}</span></h2>
                    <span
                        className="text-xl font-bold cursor-pointer hover:font-extrabold focus:font-extrabold transition"
                        onClick={onClose}>&times;</span>
                </div>

                <form onSubmit={handleDetailChangeSubmit}>
                    <ul className="space-y-4 list-disc w-full pt-4">
                        {arrayOfDetails.map(([key, value]) => (
                            <li key={key} className="text-lg">
                                <CookieDetail
                                    key={key}
                                    detail={{key: key, value: value}}
                                    onDetailChange={handleInputChange}
                                />
                            </li>
                        ))}
                    </ul>

                    <button type="submit"
                            className="flex items-center gap-2 bg-blue-200 text-white py-2 px-4 rounded-md hover:bg-slate-500 hover:shadow-lg hover:shadow-blue-200 focus:bg-slate-500 focus:shadow-lg focus:shadow-blue-200 transition mt-6 m-auto">
                        Save
                    </button>
                </form>

            </Background>
        </div>
    )
        ;
};

export default CookieDetailModal;
