import React from "react";

/**
 * Handle the import of cookies from a file
 * @param id
 * @param onFileChange
 * @param fileName
 * @returns {Element}
 * @constructor
 */
const FileInput = ({id, onFileChange, fileName}) => {

    return (
        <>
            <label className="block font-semibold hidden">Import Cookies</label>
            <div className="relative">
                <input
                    className="text-slate-600 border border-gray-300 rounded-lg cursor-pointer bg-gray-100 focus:outline-none hidden"
                    id={id}
                    type="file"
                    accept=".json"
                    onChange={onFileChange}
                />
                <label
                    htmlFor={id}
                    className="cursor-pointer bg-blue-300 text-white py-2 px-4 rounded-md hover:bg-blue-400"
                >
                    Import Cookies
                </label>
                {fileName && (
                    <span className="ml-2">{fileName}</span>
                )}
            </div>
        </>
    )

}

export default FileInput;