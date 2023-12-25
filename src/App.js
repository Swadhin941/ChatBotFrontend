import logo from './logo.svg';
import './App.css';
import io from "socket.io-client";
import { useEffect, useState } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Main from './Components/Layout/Main';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import { Toaster } from "react-hot-toast";
import Home from './Components/Home/Home/Home';
import PrivateRoute from './Components/PrivateRoute/PrivateRoute';

function App() {
  // const socket = io.connect('http://localhost:5000',{

  // });
  // const [allMessages, setAllMessages]= useState([]);
  // useEffect(() => {
  //   socket.on("receiveMessage", (data)=>{
  //     let temp = [...allMessages, data];
  //     setAllMessages(temp);
  //   })
  // }, [socket])

  // const handleSubmit= (e)=>{
  //   e.preventDefault();
  //   socket.emit("testMessage", { message: e.target.text.value });
  // }

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Main></Main>,
      children: [
        {
          path: '/',
          element: <PrivateRoute><Home></Home></PrivateRoute>
        },
        {
          path: '/login',
          element: <Login></Login>
        },
        {
          path: '/register',
          element: <Register></Register>
        }
        
      ]
    }
  ])

  return (
    <div >
      <RouterProvider router={router}>

      </RouterProvider>
      <Toaster />
    </div>
  );
}

export default App;
