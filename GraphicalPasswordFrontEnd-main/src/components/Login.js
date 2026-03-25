import React, { useEffect, useState } from "react";
import axios from "axios";
import Modal from "./Modal";
import Loader from "./Loader";

import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../features/user";
import {
  extractErrorMessage,
  isValidEmail,
  normalizeEmail,
  normalizeTheme,
} from "../utils/auth";


const Login = ({ toastFunction }) => {
  const [email, setEmail] = useState("");
  const [nextLoading, setNextLoading] = useState(false);
  const [theme, setTheme] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [links, setLinks] = useState([]);
  const [id, setId] = useState([]);
  const [allId, setAllId] = useState([]);

  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handelSubmit = () => {
    const normalizedEmail = normalizeEmail(email);
    const normalizedTheme = normalizeTheme(theme);

    if (!isValidEmail(normalizedEmail)) {
      toastFunction("Please enter a valid email address.", 0);
      return;
    }

    if (normalizedTheme.length < 2) {
      toastFunction("Please enter a valid theme.", 0);
      return;
    }

    setNextLoading(true);
    const url = baseURL + "/login";
    axios({
      method: "POST",
      url,
      data: {
        email: normalizedEmail,
        theme: normalizedTheme,
      },
    })
      .then((resp) => {
        setNextLoading(false);
        setId([]);
        setLinks([]);
        setAllId(resp.data.Ids);
        setShowModal(true);
      })
      .catch((err) => {
        setNextLoading(false);
        toastFunction(extractErrorMessage(err, "Unable to start login."), 0);
      });
  };

  useEffect(() => {
    if (allId.length === 0) {
      return undefined;
    }

    let ignore = false;

    const fetchImageLinks = async () => {
      try {
        const fetchedLinks = await Promise.all(
          allId.map((imageId) =>
            axios.get(`https://api.unsplash.com/photos/${imageId}`, {
              params: {
                client_id: import.meta.env.VITE_CLIENT,
              },
            })
          )
        );

        if (!ignore) {
          setLinks(fetchedLinks.map((response) => response.data));
        }
      } catch (error) {
        if (!ignore) {
          toastFunction(extractErrorMessage(error, "Unable to load login images."), 0);
          setShowModal(false);
          setAllId([]);
          setLinks([]);
        }
      }
    };

    fetchImageLinks();

    return () => {
      ignore = true;
    };
  }, [allId, toastFunction]);

  const handelImageClick = (imageId) => {
    setId(id => id.concat(imageId));
  };

  const handelModalSubmit = () => {
    if (id.length === 0) {
      toastFunction("Please select at least one image.", 0);
      return;
    }

    setNextLoading(true);
    const url = baseURL + '/loginVerify';
    const data = {
      email: normalizeEmail(email),
      id,
      theme: normalizeTheme(theme),
    };
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
        toastFunction(extractErrorMessage(err, "Unable to verify the graphical password."), 0);
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
