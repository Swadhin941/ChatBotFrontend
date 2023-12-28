import React, { useContext, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { SharedData } from '../SharedData/SharedContext';
import toast from 'react-hot-toast';
import useTitle from '../CustomHook/useTitle/useTitle';
import useToken from '../CustomHook/useToken/useToken';
import ErrorNotify from '../CustomHook/ErrorNotify/ErrorNotify';
import ClockLoader from 'react-spinners/ClockLoader';
import { serverUrl } from '../CustomHook/Server/Server';

const Login = () => {
    useTitle('Login- Chatbot');
    const { login, googleLogin, user, loading, setUser, updateProfilePhoto, setLoading } = useContext(SharedData);
    const [showPassword, setShowPassword] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || '/';
    const [loginLoading, setLoginLoading] = useState(false);

    useEffect(() => {
        if (user) {
            navigate(from, { replace: true });
        }
    }, [user])

    const handleGoogle = () => {
        googleLogin()
            .then((users) => {
                fetch(`${serverUrl}/user`,{
                    method:"POST",
                    headers:{
                        'content-type': "application/json",
                    },
                    body: JSON.stringify({ fullName: users?.user?.displayName, email: users?.user?.email, emailStatus: true, profilePicture:"https://i.ibb.co/bmVqbdY/empty-person.jpg", activeStatus: false})
                })
                .then(res=>res.json())
                .then(data=>{
                    if(data.acknowledged){
                        updateProfilePhoto('https://i.ibb.co/bmVqbdY/empty-person.jpg')
                        .then(()=>{
                            setLoading(false)
                        })
                    }
                })
                toast.success(`Welcome ${users?.user?.displayName}`);
            })
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoginLoading(true);
        const form = e.target;
        const email = form.email.value;
        const password = form.password.value;
        fetch(`${serverUrl}/emailStatus?user=${email}`)
            .then(res => res.json())
            .then(data => {
                if (data.emailStatus) {
                    login(email, password)
                        .then((users) => {
                            toast.success(`Welcome ${users?.user?.displayName}`);
                            setLoginLoading(false);
                        })
                        .catch(error => {
                            setLoginLoading(false);
                            ErrorNotify(error.message);
                        })
                }
                else{
                    login(email, password)
                    .then(users=>{
                        window.location.reload();
                        toast.success(`Welcome ${users?.user?.displayName}`);
                        setLoginLoading(false);
                    })
                    .catch(error=>{
                        setLoading(false);
                        setLoginLoading(false);
                        ErrorNotify(error.message);
                    })
                }
            })

    }
    return (
        <div className='container-fluid'>
            <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
                <div className="card shadow-lg">
                    <div className="card-body">
                        <h2 className='text-center'>Login</h2>
                        <form className='form mt-2' onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="email">Email:</label>
                                <div className='input-group'>
                                    <span className='input-group-text'><i className='bi bi-envelope'></i></span>
                                    <input type="email" name='email' placeholder='Enter your email' className='form-control' required />
                                </div>
                            </div>
                            <div className='mt-2'>
                                <label htmlFor="password">Password:</label>
                                <div className='input-group'>
                                    <span className='input-group-text'><i className='bi bi-key'></i></span>
                                    <input type={showPassword ? "text" : "password"} name='password' className='form-control' placeholder='Enter your password' required />
                                    <span className='input-group-text' onClick={() => setShowPassword(!showPassword)}><i className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}></i></span>
                                </div>
                            </div>
                            <div className='mt-4'>
                                <button type='submit' className='btn btn-primary w-100 d-flex justify-content-center'>{loginLoading ? <ClockLoader size={24} color='white' /> : "Login"}</button>
                            </div>
                        </form>
                        <div className='mt-2 d-flex justify-content-end'>
                            <Link to={'/register'}>Don't have a account?</Link>
                        </div>
                        <div className='mt-2'>
                            <button className='btn btn-white w-100 border border-1 border-dark' onClick={handleGoogle}> <img src="https://i.ibb.co/Y8TSkVN/google-icon.png" alt="" width={24} height={24} className='img-fluid me-2' /> Continue with Google</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;