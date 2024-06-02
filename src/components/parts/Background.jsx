// src/components/Background.jsx
import React from 'react';

const Background = ({children, className}) => {
    return (
        <div className={`bg-gradient-to-r from-gray-600 via-slate-600 to-slate-800 p-6 rounded-md ${className}`}>
            {children}
        </div>
    );
};

export default Background;
