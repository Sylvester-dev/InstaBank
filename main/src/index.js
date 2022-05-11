import React from "react";
import ReactDOM from "react-dom";
import "./styles/global.scss";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ConnectionProvider } from "./utils/connection_provider/connection_provider";
import { AssetsProvider } from "./utils/assets_provider/assets_provider";

ReactDOM.render(
  <React.StrictMode>
    <ConnectionProvider>
      <AssetsProvider>
        <App />
      </AssetsProvider>
    </ConnectionProvider>
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
