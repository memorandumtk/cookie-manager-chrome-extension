// src/components/Background.jsx
import React from 'react';

/**
 * Component for the background, can take children and classNames.
 * @param children
 * @param className
 * @returns {Element}
 * @constructor
 */
const Background = ({children, className}) => {

    return (
        <div className={`bg-gradient-to-r from-gray-600 via-slate-600 to-slate-800 ${className}`}>
            {children}
        </div>
    );
};

export default Background;
