import React, { useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import Loader from "./Loader";

import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { login } from "../features/user";

const Signup = ({toastFunction}) => {
    

  const [email, setEmail] = useState("");
  const [nextLoading, setNextLoading] = useState(false);
  const [theme, setTheme] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [links, setLinks] = useState([]);
  const [id, setId] = useState([]);
    
  const URL = `https://api.unsplash.com/search/photos?query=${theme}&client_id=${process.env.REACT_APP_CLIENT}`;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handelSubmit = async () => {
    setNextLoading(true);
    const { data } = await axios.get(URL);
    const photos = data.results;
    photos.pop();  
    setLinks([...photos]);
    setNextLoading(false);
    setShowModal(true);
    };
  

    const handelImageClick = (imageId) => {
      setId([...id, imageId]);
    };

  
  const handelModalSubmit = async () => {
      setNextLoading(true);
      const baseURL = process.env.REACT_APP_BACKEND_BASE_URL;
      const url = baseURL + "/signup";
      const data = { theme, email, links, id };
      axios({
        method: 'POST',
        url,
        data
      })
        .then(() => {
          setNextLoading(false);
          toastFunction("successfully signed up !!", 1);
          setShowModal(false);
          setEmail("");
          setTheme("");
          dispatch(login({ login: true }));
          localStorage.setItem("login", true);
          navigate("/");
        })
        .catch((err) => {
          setNextLoading(false);
          toastFunction(err.response.data, 0);
          setShowModal(false);
          setEmail("");
          setTheme("");
        });
  };

  return (
    <>
      <div className="flex justify-center items-center h-96 mt-24">
        <div className="flex flex-col rounded-md w-4/5 md:w-2/3 lg:w-1/3 justify-center items-center h-2/3 shadow-xl border-2 border-gray-100">
          <h1 className="mb-9 text-2xl">SignUp</h1>
          <input
            className="border border-gray-200 w-11/12 mb-1 rounded-md p-1 hover:border-gray-500 hover:border-2"
            value={email}
            placeholder="Enter Email"
            onChange={(e) => {
              setEmail(e.target.value);
            }}
          ></input>
          <input
            className="border border-gray-200 w-11/12 mb-1 rounded-md p-1 hover:border-gray-500 hover:border-2"
            value={theme}
            type="text"
            placeholder="Enter Theme"
            onChange={(e) => {
              setTheme(e.target.value);
            }}
          ></input>
          {nextLoading ? <Loader /> :
            <button
              className="bg-blue-500 rounded-md w-11/12 p-2 hover:bg-blue-950 hover:text-white"
              onClick={handelSubmit}
            >
              Next
            </button>
          }
        </div>
      </div>

      <div className="flex justify-center">
        {showModal && (
          <Modal
            link={links}
            handelImageClick={handelImageClick}
            handelModalSubmit={handelModalSubmit}
            type={"Sign Up"}
            loading={nextLoading}
          />
        )}
      </div>
    </>
  );
};

export default Signup;
