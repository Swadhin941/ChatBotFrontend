import React from 'react';
import { Outlet } from 'react-router-dom';

const Main = () => {
    return (
        <div className='container-fluid' style={{height:"100vh"}}>
            <Outlet></Outlet>
        </div>
    );
};

export default Main;