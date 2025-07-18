import React, {useState} from "react";
// import "./image.css"

const Image = ({ imageSrc, imageId, func }) => {

  const [click, setClick] = useState(-1)

  const style1 = {
    // border: "2px solid gray"
  }

  const style2 = {
    border: "4px solid black"
  }

  const handelClick = () => {
    setClick(click*-1)
  }

  return (
      <div onClick={handelClick}>
        <img
          class="rounded-t-lg"
          src={imageSrc}
          alt=""
          onClick={() => func(imageId)}
          className="cursor-pointer object-cover h-24 w-96 rounded-lg shadow-xl hover:border-2 hover:border-gray-100"
          style={click === -1 ? style1 : style2}
          id="image"
        ></img>
      </div>
  );
}

export default Image;