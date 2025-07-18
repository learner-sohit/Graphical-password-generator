import React from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom";


// COMPONENTS
import Home from "./components/Home";
import Protected from "./components/Protected";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import Login from "./components/Login";
import NoPage from "./components/Nopage";


const App = () => {

  const toastFunction = (message, type) => {
    if (type === 0) {
      toast.error(message, { theme: "dark" })
    } else if (type === 1) {
      toast.success(message, { theme: "dark" });
    }
  }

  return (
    <>
      <ToastContainer />
      <Navbar toastFunction={ toastFunction } />
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Protected Component={<Home toastFunction={ toastFunction } />} />} /> 
          <Route path="/signup" element={ <Signup toastFunction={toastFunction}/> } />
          <Route path="/login" element={ <Login toastFunction={toastFunction}/> } />
          <Route path="*" element={ <NoPage/> } />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;