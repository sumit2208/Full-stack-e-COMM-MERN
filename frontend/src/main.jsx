import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import "./index.css";
import App from "./App.jsx";
import store from './redux/store.js'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-4mvz1wae1jlncdlc.us.auth0.com"
      clientId="RCbnCBQaeL2Zdn8hJWCsSKpiYp8M7rwO"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <Provider store={store}>
        <BrowserRouter>
      <App />
      </BrowserRouter>
      </Provider>
    </Auth0Provider>
  </StrictMode>
);
