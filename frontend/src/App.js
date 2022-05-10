import { Web3Provider } from "@ethersproject/providers";
import { Web3ReactProvider } from "@web3-react/core";
import { ApolloProvider } from "@apollo/client";
import { client } from "./utils/apollo_client.js";

//import { useConnection } from "./utils/connection_provider/connection_provider";



import Homepage from "./components/Homepage.js";
import About from "./components/About";
import Faq from "./components/Faq";
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import  Titlebar  from "./components/Titlebar.js";
import Dashboard from "./components/Dashboard.js";
import Depositpage from "./components/Depositpage.js";
import Hp from "./pages/Hp";

function App() {


  
  return (
    <ApolloProvider client={client}>
      <Router>
    <Web3ReactProvider
      getLibrary={(provider, connector) => new Web3Provider(provider)}
    >
      <Titlebar />
      <Routes>
        <Route path="/" element={<Homepage />} />
        <Route path="/About" element={<About />} />       
        <Route path="/Faq" element={<Faq />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Deposit" element={<Depositpage />} />
        <Route path="/Hp" element={<Hp />} />
      </Routes>
    </Web3ReactProvider>
    </Router>
    </ApolloProvider>
      
    
  )
}

export default App;