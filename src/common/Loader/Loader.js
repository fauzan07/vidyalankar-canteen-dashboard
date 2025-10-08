import React from 'react';
import Spinner from './assets/loader.gif';
import './Loader.css';


function Loader() {
    return (
       
        <div className="spinner">
        <img src={Spinner} alt="loading"/>
        </div>
        
    )
}

export default Loader;
