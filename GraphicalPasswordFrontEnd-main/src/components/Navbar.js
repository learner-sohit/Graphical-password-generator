import React from "react";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "../features/user";

const Navbar = ({ toastFunction }) => {
  const dispatch = useDispatch();
  const status = useSelector((state) => state.login.value);
  const login = status.login;

  const handelLogout = () => {
    dispatch(logout());
    localStorage.removeItem("login");
    toastFunction("Successfully logged out");
    window.location.href = "/login";
  };

  return (
    <>
      <nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 left-0 border-b border-gray-200 dark:border-gray-600">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
            Graphical Password
          </span>
          {login ? (
            <button
              type="button"
              onClick={handelLogout}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center mr-1 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Logout
            </button>
          ) : (
            <div className="flex md:order-2">
              <button
                type="button"
                onClick={() => (window.location.href = "/login")}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center mr-1 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => (window.location.href = "/signup")}
                className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-3 py-2 text-center mr-2 md:mr-0 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 ml-5"
              >
                Signup
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
