import React, { useContext, useEffect, useState } from 'react';
import { SharedData } from '../../SharedData/SharedContext';
import "./Home.css";
import { serverUrl } from '../../CustomHook/Server/Server';
import OptionModal from '../../Modals/OptionModal';

const Home = () => {
    const { logout, user } = useContext(SharedData);
    const [allMessages, setAllMessages] = useState([]);
    useEffect(() => {
        fetch(`${serverUrl}/allMessages`)
            .then(res => res.json())
            .then(data => {
                setAllMessages(data);
            })
    }, [])

    return (
        <div className='container-fluid d-flex justify-content-center mt-5' style={{ height: "100vh" }}>
            <div className="card p-0 messageContainer">
                <div className="card-header p-2" style={{ backgroundColor: "#54ff9b" }}>
                    <div className='d-flex justify-content-between'>
                        <div className='d-flex'>
                            <div>
                                <img src={user?.photoURL} alt="" height={50} width={50} style={{ borderRadius: "50%" }} />
                            </div>
                            <div className='ms-2' style={{}}>
                                <h5>{user?.displayName}</h5>
                            </div>
                        </div>
                        <div className='d-flex justify-content-center align-items-center' data-bs-target="#OptionModal" data-bs-toggle="modal" >
                            <i className='bi bi-three-dots-vertical'></i>
                        </div>
                    </div>
                </div>
                {
                    allMessages.length === 0 ? <div className='card-body bg-secondary d-flex justify-content-center align-items-center' >
                        <div className=''>
                            <h1 className='text-muted fw-bolder'>Start Chatting</h1>
                        </div>

                    </div> : <div className="card-body" style={{ borderBottom: "0px", overflow: "auto", overflowY: "auto", overflowX: "hidden" }}>
                        {
                            allMessages.map((data, index) => <div key={index}>

                            </div>)
                        }
                    </div>
                }

                <div className="card-footer p-0" style={{ borderTop: "0px" }}>
                    <div className='p-0'>
                        <div className='input-group'>
                            <textarea name="" className='form-control' id="" rows="1" style={{ resize: "none", borderRight: "0px" }}></textarea>
                            <span className='input-group-text'><button className='btn btn-success'>Send</button></span>
                        </div>

                    </div>
                </div>
                <OptionModal></OptionModal>
            </div>
        </div>
    );
};

export default Home;