import React from 'react';
import RingLoader from "react-spinners/RingLoader";

const Spinner = () => {
    return (
        <div className='container-fluid d-flex justify-content-center align-items-center' style={{ height: '100vh' }}>
            <RingLoader color="black" size={35} speedMultiplier={2} />
        </div>
    );
};

export default Spinner;