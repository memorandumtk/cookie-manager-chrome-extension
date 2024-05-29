import React from 'react';
import ReactDOM from 'react-dom';
import Options from './components/Options';

// This mounts the React component to the DOM element with id 'root'
ReactDOM.render(
    <React.StrictMode>
        <Options />
    </React.StrictMode>,
    document.getElementById('root')
);
