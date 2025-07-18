import React from "react";
import Image from "./Image";
import Loader from "./Loader";

const Modal = ({ link, handelImageClick, handelModalSubmit, type, loading }) => {

  return (
    <>
      <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <h1 className="text-center mb-3 text-2xl font-bold">Select Images</h1>
        <div className="grid grid-cols-3 gap-4">
          {link.map((photoLink) => (
            <Image
              key={photoLink.id}
              imageSrc={photoLink.urls.small}
              imageId={photoLink.id}
              func={handelImageClick}
            />
          ))}
        </div>
        <div className="text-center">
          {loading ? (
            <div className="mt-10 mb-2">
              <Loader />
            </div>
          ) : (
            <button
              type="button"
              onClick={handelModalSubmit}
              disabled={loading}
              class="bg-blue-500 rounded-md w-11/12 p-2 hover:bg-blue-950 hover:text-white font-medium text-sm px-5 py-2.5 text-center mb-2 mt-10"
            >
              {type}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
