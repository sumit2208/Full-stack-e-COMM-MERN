import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CryptoJS from "crypto-js";
import api from "../api.js"; 

const Login = () => {
  const [userData, setUserData] = useState();
  const navigate = useNavigate();

  let encryptedRole;
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/login", userData);

      const newAccessToken = res.data.accessToken;

      localStorage.setItem("token", newAccessToken); 
      localStorage.setItem('_id',res.data.user.id)
      localStorage.setItem('kycStatus',res.data.user.kycStatus)
      api.defaults.headers.common["Authorization"] = `Bearer ${newAccessToken}`;


      encryptedRole = CryptoJS.AES.encrypt(
        res.data.user.role,
        "SUMITGUPTA"
      ).toString();
      localStorage.setItem("role", encryptedRole);
      navigate('/kyc')
    } catch (err) {
      console.error("Login failed:", err);
    }
  };


 
  return (
    <div className=" d-flex justify-content-center align-items-center mt-5">
      <form className="shadow-lg  bg-light p-5">
        <div class="mb-3">
          <label for="exampleInputEmail1" class="form-label">
            Email address
          </label>
          <input
            type="email"
            class="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            name="email"
            onChange={(e) =>
              setUserData({ ...userData, email: e.target.value })
            }
          />
          <div id="emailHelp" class="form-text">
            We'll never share your email with anyone else.
          </div>
        </div>
        <div class="mb-3">
          <label for="exampleInputPassword1" class="form-label">
            Password
          </label>
          <input
            type="password"
            class="form-control"
            id="exampleInputPassword1"
            name="password"
            onChange={(e) =>
              setUserData({ ...userData, password: e.target.value })
            }
          />
        </div>

        <button onClick={handleSubmit} type="submit" class="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Login;
