import { useEffect } from "react";
import "./navbar.scss";

import { useNavigate } from "react-router";
import { useConnection } from "../../utils/connection_provider/connection_provider";
import { supportedNetworks } from "../../utils/connection_provider/network_config";
import { displayAddress } from "../../utils/helpers";
import Box from "../Box";

function Navbar() {
  const { chainId, accounts, connectWallet } = useConnection();

  const navigate = useNavigate()

  const isConnected = accounts.length > 0;

  useEffect(() => {
    // Select proper nav-option on load
    const route = window.location.href.split("/").at(-1);
    if (route === "" || route === "#") {
      document.getElementById('h').setAttribute('class', 'nav-option nav-option-c');
    } else if (route === "dashboard") {
      document.getElementById('d').setAttribute('class', 'nav-option nav-option-c');
    } else if (route === "liquidation") {
      document.getElementById('l').setAttribute('class', 'nav-option nav-option-c');
    } else if (route === "docs" || route.split("#").at(0) === "docs") {
      document.getElementById('docs').setAttribute('class', 'nav-option nav-option-c');
    }else if (route === "faq" || route.split("#").at(0) === "faq") {
      document.getElementById('faq').setAttribute('class', 'nav-option nav-option-c');
    } else {
      document.getElementById('h').setAttribute('class', 'nav-option nav-option-c');
    }

    // On nav - option click
    Array.from(document.getElementsByClassName('nav-option')).forEach(element => {
      element.addEventListener('click', () => {
        document.getElementsByClassName('nav-option-c')[0].setAttribute('class', 'nav-option')
        element.setAttribute('class', 'nav-option nav-option-c')
      })
    });
  }, []);

  return (
    <nav className="navbar mt-4">
      <a href="/#">
        <h3 className="logo">INSTABANK</h3>
      </a>
      <div className="nav-options">
        <div className="tabs">
          <div id="h" onClick={() => { navigate('/') }} className="nav-option">Home</div>

          <Box width="20" />

          {/* <div id="d" onClick={() => { navigate('/dashboard') }} className="nav-option">Dashboard</div>
          <Box width="20" /> */}

          <div id="l" onClick={() => { navigate('/liquidation') }} className="nav-option">Liquidation</div>
          <Box width="20" />

          <div id="faq" onClick={() => { navigate('/faq') }} className="nav-option">Faq</div>
          <Box width="20" />

          <div id="Insurance" onClick={() => { navigate('/ins') }} className="nav-option">Insurance</div>
          <Box width="20" />

          <div id="about" onClick={() => { navigate('/about') }} className="nav-option">About</div>
          <Box width="20" />



        </div>
        {/* <div className="tabs">
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/liquidation">Liquidation</Link>
          <Link to="/docs">Docs</Link>
        </div> */}
        <h6 className="info-box">{supportedNetworks[chainId].name}</h6>
        <h6
          className="info-box"
          onClick={connectWallet}
          style={{
            cursor: isConnected ? "inherit" : "pointer",
          }}
        >
          {isConnected ? displayAddress(accounts[0]) : "Connect"}
        </h6>
      </div>
    </nav>
  );
}

export default Navbar;
