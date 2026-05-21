import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import App from "./App";
import "./i18n";
import { store } from "./store";
import { registerRefreshHandler } from "./services/api/client";
import { initializeAuth, refreshSession } from "./features/auth/authSlice";

registerRefreshHandler(() => store.dispatch(refreshSession()).unwrap());
store.dispatch(initializeAuth());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
