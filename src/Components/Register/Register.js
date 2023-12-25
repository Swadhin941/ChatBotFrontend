import React, { useContext, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useNavigate } from 'react-router-dom';
import { SharedData } from '../SharedData/SharedContext';
import useToken from '../CustomHook/useToken/useToken';
import { serverUrl } from '../CustomHook/Server/Server';
import ErrorNotify from '../CustomHook/ErrorNotify/ErrorNotify';
import ClockLoader from "react-spinners/ClockLoader";

const Register = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { createAccount, user, updateName, verifyEmail, updateProfilePhoto, setLoading } = useContext(SharedData);
    const navigate = useNavigate();
    const [token] = useToken(user?.email);
    const [registerLoading, setRegisterLoading] = useState(false);

    useEffect(() => {
        if (token) {
            navigate('/', { replace: true });
        }
    }, [token])

    const handleSubmit = (e) => {
        e.preventDefault();
        setRegisterLoading(true);
        const form = e.target;
        const fullName = form.fullName.value;
        const email = form.email.value;
        const password = form.password.value;
        const confirmPassword = form.confirmPassword.value;
        if (password !== confirmPassword) {
            toast.error('Passwords are not same');
            return;
        }
        if (password.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }
        createAccount(email, password)
            .then((users) => {
                updateName(fullName)
                    .then(() => {
                        updateProfilePhoto('https://i.ibb.co/bmVqbdY/empty-person.jpg')
                            .then(() => {
                                verifyEmail()
                                    .then(() => {
                                        fetch(`${serverUrl}/user`, {
                                            method: "POST",
                                            headers: {
                                                'content-type': "application/json"
                                            },
                                            body: JSON.stringify({ email: users?.user?.email, fullName: fullName, emailStatus: false, profilePicture: "https://i.ibb.co/bmVqbdY/empty-person.jpg", activeStatus: false })
                                        })
                                            .then(res => res.json())
                                            .then(data => {
                                                if (data.acknowledged) {
                                                    setRegisterLoading(false);
                                                    toast.success(`Verification Email Send`);
                                                    setLoading(true);

                                                }
                                            })

                                    })
                                    .catch(error => {
                                        setRegisterLoading(false);
                                        ErrorNotify(error.message);
                                    })
                            })


                    })
                    .catch(error => {
                        setRegisterLoading(false);
                        ErrorNotify(error.message);
                    })
            })
            .catch(error => {
                setRegisterLoading(false);
                ErrorNotify(error.message);
            })

    }
    return (
        <div className='container-fluid d-flex justify-content-center align-items-center' style={{ height: "100vh" }}>
            <div className="card">
                <div className="card-body">
                    <h2 className='text-center'>Register</h2>
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="fullName">Full Name:</label>
                            <div className="input-group">
                                <span className='input-group-text'><i className='bi bi-person'></i></span>
                                <input type="text" name="fullName" className='form-control' required placeholder='Enter your full name' />
                            </div>
                        </div>
                        <div className='mt-2'>
                            <label htmlFor="email">Email:</label>
                            <div className='input-group'>
                                <span className='input-group-text'><i className='bi bi-envelope'></i></span>
                                <input type="email" className='form-control' name='email' placeholder='Enter your email' required />
                            </div>
                        </div>
                        <div className='mt-2'>
                            <label htmlFor="Password">Password:</label>
                            <div className='input-group'>
                                <span className='input-group-text'><i className='bi bi-key'></i></span>
                                <input type={showPassword ? "text" : "password"} className='form-control' name='password' required placeholder='Enter your password' />
                            </div>
                        </div>
                        <div className='mt-2'>
                            <label htmlFor="confirmPassword">Confirm Password:</label>
                            <div className='input-group'>
                                <span className='input-group-text'><i className='bi bi-key'></i></span>
                                <input type={showPassword ? "text" : "password"} className='form-control' name='confirmPassword' required placeholder='Confirm your password' />
                            </div>
                        </div>
                        <div className='d-flex mt-2' >
                            <input type="checkbox" className='form-check-input' onClick={() => setShowPassword(!showPassword)} /><span className='ms-3'>{showPassword ? 'Close Password' : "Show Password"}</span>
                        </div>
                        <div className='mt-2 d-flex justify-content-center'>
                            <button type='submit' className='btn btn-primary d-flex justify-content-center' style={{ width: "120px" }}>{registerLoading ? <ClockLoader size={24} color='white' /> : 'Register'}</button>
                        </div>
                    </form>
                    <p className='text-center mt-2'><Link to={'/login'}>Already have a account?</Link></p>
                </div>
            </div>
        </div>
    );
};

export default Register;