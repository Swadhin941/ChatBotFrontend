import React, { createContext, useEffect, useState } from 'react';
import app from '../Firebase/Firebase';
import { GoogleAuthProvider, createUserWithEmailAndPassword, getAuth, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signOut, updateProfile } from "firebase/auth";
import { serverUrl } from '../CustomHook/Server/Server';

export const SharedData = createContext();


const SharedContext = ({ children }) => {
    const auth = getAuth(app);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    // const [test, setTest]= useState(true);
    const googleProvider = new GoogleAuthProvider();

    const login = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    }

    const createAccount = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
    }

    const logout = () => {
        setLoading(true);
        localStorage.removeItem('token');
        signOut(auth);
    }

    const verifyEmail = () => {
        setLoading(true);
        return sendEmailVerification(auth.currentUser);
    }

    const updateName = (fullName) => {
        setLoading(true);
        return updateProfile(auth.currentUser, {
            displayName: fullName
        });
    }

    const updateProfilePhoto = (photo) => {
        setLoading(true);
        return updateProfile(auth.currentUser, {
            photoURL: photo
        })
    }

    const googleLogin = async () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    }

    //Email Verification customizations

    useEffect(() => {
        if (user) {
            fetch(`${serverUrl}/emailStatus?user=${user?.email}`)
                .then(res => res.json())
                .then(data => {
                    if (!data.emailStatus) {
                        setUser(user);
                    }
                    // setLoading(false);
                })
        }
    }, [user])

    useEffect(() => {
        const check = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && currentUser?.emailVerified) {
                fetch(`${serverUrl}/jwt`, {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                    },
                    body: JSON.stringify({ email: currentUser?.email })
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.token) {
                            localStorage.setItem('token', data.token);
                            setUser(currentUser);
                        }
                    })

            }
            else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        })
        return () => check();
    }, [])

    const authInfo = { createAccount, login, user, setUser, logout, setLoading, verifyEmail, updateName, updateProfilePhoto, googleLogin, loading };
    return (
        <div>
            <SharedData.Provider value={authInfo}>
                {children}
            </SharedData.Provider>
        </div>
    );
};

export default SharedContext;