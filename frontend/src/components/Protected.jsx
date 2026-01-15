import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getDecryptedRole } from "./common/encodedecode";

const Protected = ({ Component, allowedRoles = ["ADMIN", "CUSTOMER"] }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkk = () => {
      const token = localStorage.getItem("token");
      const role = getDecryptedRole();
      const status = localStorage.getItem("kycStatus");
      
      if (!token || !role) {
        navigate("/login", { replace: true });
        return;
      }
      if (status === "APPROVED" && role === "CUSTOMER") {
        navigate("/products");
      }

      if (!allowedRoles.includes(role)) {
        if (role === "CUSTOMER" && status === "Pending") {
          navigate("/kyc", { replace: true });
        } else {
          navigate("/", { replace: true });
        }
        return;
      }

      setIsAuthorized(true);
    };

    checkk();
  }, [navigate, allowedRoles]);

  if (!isAuthorized) {
    return <>Loading</>;
  }

  return <Component />;
};

export default Protected;
