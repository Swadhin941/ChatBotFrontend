import React, { useContext, useEffect, useState } from 'react';
import { SharedData } from '../../SharedData/SharedContext';
import "./Home.css";
import { serverUrl } from '../../CustomHook/Server/Server';
import OptionModal from '../../Modals/OptionModal';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import BeatLoader from "react-spinners/BeatLoader";
import useAxiosSecure from '../../CustomHook/useAxiosSecure/useAxiosSecure';
import { useNavigate } from 'react-router-dom';
import useTitle from '../../CustomHook/useTitle/useTitle';

const Home = () => {
    useTitle("Chatbot");
    const socket = io.connect(`${serverUrl}`);
    socket.auth= {token: `Bearer ${localStorage.getItem('token')}`};
    socket.connect();
    const { logout, user, setLoading } = useContext(SharedData);
    const [allMessages, setAllMessages] = useState([]);
    const [thinkingState, setThinkingState] = useState(false);
    const [listeningState, setListeningState] = useState(false);
    const [axiosSecure] = useAxiosSecure();
    const navigate = useNavigate();
    useEffect(() => {
        if(user){
            axiosSecure.get(`${serverUrl}/allMessages?user=${user?.email}`)
                .then(res => res.data)
                .then(data => {
                    setAllMessages(data);
                })
                .catch(error => {
                    if (error.message.split('code')[1] === 401) {
                        toast.error("Unauthorize access");
                        // logout()
                        // navigate('/login');
                        // setLoading(false);
                    }
                })
        }
        
    }, [user])

    useEffect(()=>{
        socket.on('connect_error', (error) => {
            console.log(error);
            if (error.message === "forbidden") {
                navigate("/forbidden");
            }
            if (error.message === 'empty_auth' || error.message === 'tokenError') {
                logout();
                setLoading(false);
                navigate('/login')
            }
        })
    },[socket])

    useEffect(() => {
        if (listeningState) {
            toast.error("Speech Recognition is not connected yet");
        }
    }, [listeningState])

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const message = form.messageField.value;
        const email = user?.email;
        const time = new Date().toLocaleTimeString();
        const date = new Date().toLocaleDateString();
        const currentSec = Date.now();
        socket.emit('personMessage', { message, sender: email, receiver: "chatbot@gmail.com", time, date, currentSec, token: `Bearer ${localStorage.getItem('token')}` }, (response) => {
            console.log(response);
            if(response.status==='Unauthenticated'){
                logout()
                setLoading(false);
                navigate('/login')
            }
            if (response.status === 'success') {
                form.reset();
                setThinkingState(true);
                setAllMessages(response.data)
                fetch(`https://api.openai.com/v1/chat/completions`, {
                    method: "POST",
                    headers: {
                        'content-type': "application/json",
                        Authorization: `Bearer ${process.env.REACT_APP_openAi}`
                    },
                    body: JSON.stringify({ model: "gpt-3.5-turbo", messages: [{ role: "user", content: message }] })
                })
                    .then(res => res.json())
                    .then(data => {
                        console.log(data);
                        if (data.id) {
                            const assistantReply = data.choices[0].message.content
                            const assistantTime = new Date().toLocaleTimeString();
                            const assistantDate = new Date().toLocaleDateString();
                            const assistantReceiver = user?.email;
                            const assistant = "chatbot@gmail.com";
                            const assistantSec = Date.now()
                            socket.emit('assistantMessage', { sender: assistant, receiver: assistantReceiver, message: assistantReply, time: assistantTime, date: assistantDate, currentSec: assistantSec, token: `Bearer ${localStorage.getItem('token')}` }, (res) => {
                                if(res.status==='Unauthenticated'){
                                    logout()
                                    setLoading(false)
                                    navigate('/login');
                                }
                                if (res.status === 'success') {
                                    Notification.requestPermission()
                                        .then((permission) => {
                                            if (permission === 'granted') {
                                                new Notification("Reply from your virtual assistant");
                                            }
                                        })
                                        .catch(error => {
                                            toast.error("Please give permission for the notification");
                                        })
                                    setThinkingState(false);
                                    setAllMessages(res.data)
                                }
                            })
                        }
                    })
            }
        })
    }


    return (
        <div className='container-fluid d-flex justify-content-center' style={{ height: "100vh" }}>
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
                            allMessages.map((data, index) => <div key={index} >
                                <div className={`d-flex justify-content-${data.sender === user?.email ? "end" : "start"}`}>
                                    <div>
                                        <p className='border border-1 rounded my-0 p-2' style={{ maxWidth: "200px", wordWrap: "break-word", height: "auto", backgroundColor: "#2777b5", color: "white" }}>{data.message}</p>
                                        <div className={`d-flex justify-content-${data.sender === user?.email ? "end" : "start"}`}>
                                            <small className='my-0' style={{ fontSize: "10px" }}>{data.time}</small>
                                        </div>

                                    </div>


                                </div>

                            </div>)
                        }
                    </div>
                }
                {
                    thinkingState && <div style={{ position: "absolute", bottom: "2.4rem" }}>
                        <div className='d-flex'>
                            <p className='ms-2'>Assistant thinking</p><div><BeatLoader color="black" size={5} /></div>
                        </div>
                    </div>
                }

                <div className="card-footer p-0" style={{ borderTop: "0px" }}>
                    <div className='p-0'>
                        <form className='form' onSubmit={handleSubmit}>
                            <div className='input-group'>
                                <textarea name="messageField" className='form-control' id="messageField" rows="1" style={{ resize: "none", borderRight: "0px" }} placeholder='Type your message here'></textarea>
                                <span className='input-group-text' style={{ backgroundColor: "white", borderRight: "0px", cursor: "pointer" }} onClick={() => setListeningState(true)} onMouseLeave={() => setListeningState(false)}>
                                    <i className='bi bi-mic'></i>
                                </span>
                                <span className='input-group-text'><button type='submit' className='btn btn-success'>Send</button></span>
                            </div>
                        </form>


                    </div>
                </div>
                <OptionModal></OptionModal>
            </div>
        </div>
    );
};

export default Home;