import "./App.css";
import Navbar from "./components/Navbar";
import Signup from "./components/Signup";
import { useAuth0 } from "@auth0/auth0-react";
import Products from "./components/Products";
import Login from "./components/Login";
import { Route, Routes } from "react-router-dom";
import Protected from "./components/Protected";
import Kyc from "./components/Kyc";
import AllProducts from "./components/AllProducts";
import Dashboard from "./components/Dashboard";
import OrderManage from "./components/OrderManage";
import AllUsers from "./components/AllUsers";
import Permission from "./components/Permission"; 
import PaymentSuccess from "./components/PaymentSuccess";
import Transactions from "./components/Transaction";
import UserOrders from "./components/UserOrders";
import ChatBoard from "./components/ChatBoard";
// import Footer from "./components/Footer";

function App() {
  // const { user, loginWithRedirect, isAuthenticated } = useAuth0();
  return (
    <>
      {/* {isAuthenticated ? (
        <button>Logout</button>
      ) : (
        <button onClick={(e) => loginWithRedirect()}>Login</button>
      )} */}

      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} /> 
        <Route path="/" element={<Protected Component={Dashboard} allowedRoles={["ADMIN"]} />} />
        <Route path="/allproducts" element={ <Protected Component={AllProducts} allowedRoles={["ADMIN"]} /> } />
        <Route  path="/allusers" element={<Protected Component={AllUsers} allowedRoles={["ADMIN"]} />} />
        <Route  path="/permissionpanel"  element={ <Protected Component={Permission} allowedRoles={["ADMIN"]} /> }  />
        <Route  path="/allorders" element={ <Protected Component={OrderManage} allowedRoles={["ADMIN"]} /> } /> 
        <Route  path="/products" element={  <Protected Component={Products} allowedRoles={["ADMIN", "CUSTOMER"]} /> } />
        <Route path="/kyc" element={ <Protected Component={Kyc} allowedRoles={["CUSTOMER"]} /> }  />
        <Route path="/signup" element={<Signup />} /> 
        <Route path="/paymentSuccess" element={<PaymentSuccess />} />
        <Route path="/chat" element={<ChatBoard />} />
        <Route path="/razorpay" element={<Transactions />} />
        <Route path="/userOrders" element={<UserOrders />} />
      </Routes>

      {/* <Footer/> */}
    </>
  );
}

export default App;
