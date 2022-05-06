import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import Homepage from "./components/Homepage.js";
import About from "./components/About";
import Faq from "./components/Faq";
import './App.css';
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import  Titlebar  from "./components/Titlebar.js";

function App() {
  return (
    <Router>
    <Web3ReactProvider
      getLibrary={(provider, connector) => new Web3Provider(provider)}
    >
      <Titlebar />
      
      <Switch>
        <Route exact path="/">
          <Homepage />
        </Route>
        <Route path="/About">
          <About />
        </Route>
        <Route path="/Faq">
          <Faq />
        </Route>
      </Switch>
    </Web3ReactProvider>
    </Router>
  )
}

export default App;