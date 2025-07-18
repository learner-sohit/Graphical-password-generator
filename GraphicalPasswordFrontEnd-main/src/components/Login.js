import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import Loader from "./Loader";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../features/user";


const Login = ({ toastFunction }) => {
  const [email, setEmail] = useState("");
  const [nextLoading, setNextLoading] = useState(false);
  const [theme, setTheme] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [links, setLinks] = useState([]);
  const [id, setId] = useState([]);
  const [allId, setAllId] = useState([]);

  const baseURL = process.env.REACT_APP_BACKEND_BASE_URL;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handelSubmit = () => {
    setNextLoading(true);
    const url = baseURL + "/login";
    axios({
      method: "POST",
      url,
      data: {
        email,
        theme,
      },
    })
      .then((resp) => {
        setNextLoading(false);
        setAllId(resp.data.Ids);
        setShowModal(true);
      })
      .catch((err) => {
        setNextLoading(false);
        toastFunction(err.response.data, 0);
      });
  };

  useEffect(() => {
    const fetchImageLinks = async () => {
      for (let i = 0; i < allId.length; i++) {
        let url = `https://api.unsplash.com/photos/${allId[i]}?client_id=${process.env.REACT_APP_CLIENT}`;
        const fetchedLink = await axios.get(url);
        setLinks((current) => [...current, fetchedLink.data]);
      }
    };
    fetchImageLinks();
  }, [allId]);

  const handelImageClick = (imageId) => {
    setId(id => id.concat(imageId));
  };

  const handelModalSubmit = () => {
    setNextLoading(true);
    const url = baseURL + '/loginVerify';
    const data = { id, theme };
    axios({
      method: "POST",
      url,
      data
    })
      .then(() => {
        setNextLoading(false);
        toastFunction("Successfully Logged in", 1);
        setEmail("");
        setTheme("");
        setShowModal(false);
        setAllId([]);
        setLinks([]);
        dispatch(login({ login: true }));
        localStorage.setItem("login", true);
        navigate("/");
      })
      .catch((err) => {
        setNextLoading(false);
        toastFunction(err.response.data, 0);
        setEmail("");
        setTheme("");
        setShowModal(false);
        setAllId([]);
        setLinks([]);
    })
  };


  return (
    <>
      <div className="flex justify-center items-center h-96 mt-24">
        <div className="flex flex-col rounded-md w-4/5 md:w-2/3 lg:w-1/3 justify-center items-center h-2/3 shadow-xl border-2 border-gray-100">
          <h1 className="mb-9 text-2xl">Login</h1>
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
          {nextLoading ? <Loader/> :
            <button
              className="bg-blue-500 rounded-md w-11/12 p-2 hover:bg-blue-950 hover:text-white"
              onClick={handelSubmit} disabled={nextLoading}
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
            type={"Login"}
            loading={nextLoading}
          />
        )}
      </div>
    </>
  );
};

export default Login;
