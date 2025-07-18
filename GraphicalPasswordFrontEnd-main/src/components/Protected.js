import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import propTypes from "prop-types"

const Protected = ({ Component }) => {

    const navigate = useNavigate();

    useEffect(() => {
        const login = localStorage.getItem("login");
        if (!login) {
            navigate("/login");
        }
    });

    return (
        <div>
            {Component}
        </div>
    )
};

Protected.propTypes = {
    Component: propTypes.object,
}

export default Protected;