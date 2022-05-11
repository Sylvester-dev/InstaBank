import React, { useContext, useCallback, useEffect, useState } from "react";
import { ethers } from "ethers";

import { supportedNetworks, defaultChainId } from "./network_config";
import { fetchContracts } from "./fetch_contracts";

const ConnectionContext = React.createContext();

export function ConnectionProvider(props) {
  const [state, setState] = useState({
    ethers: ethers,
    chainId: defaultChainId,
    accounts: [],
    error: "",
  });

  const connectWallet = useCallback(async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const signer = provider.getSigner();

      const { chainId } = await provider.getNetwork();

      if (!supportedNetworks[chainId]) {
        throw new Error("Switch to Rinkeby or Mumbai network from your browser wallet");
      }

      setState({
        ...state,
        accounts,
        chainId,
        provider,
      });

      const contracts = await fetchContracts(signer, chainId);

      setState({
        ...state,
        accounts,
        chainId,
        ...contracts,
        provider,
      });
    } catch (e) {
      if (e.message !== "Switch to Rinkeby or Mumbai network from your browser wallet") {
        setState({ ...state, error: "Switch to Rinkeby or Mumbai network from your browser wallet. Detailed Error: " + e.message });
      } else {
        setState({ ...state, error: e.message });
      }
      console.log("useConnection : connectWallet failed -> " + e.message);
    }
  }, []);

  const initialize = useCallback(async () => {
    try {
      let provider;

      if (window.ethereum) {
        provider = new ethers.providers.Web3Provider(window.ethereum);
      } else {
        provider = new ethers.providers.JsonRpcProvider(supportedNetworks[defaultChainId].rpcURL);
      }

      const isMetamaskConnected = (await provider.listAccounts()).length > 0;

      if (isMetamaskConnected) {
        await connectWallet();
      } else {
        setState({
          ...state,
          provider,
        });

        const contracts = await fetchContracts(provider, defaultChainId);

        setState({ ...state, ...contracts, provider });
      }
    } catch (error) {
      console.log("Error ConnectionProvider -> ", error);

      setState({ ...state, error });
    }
  }, [connectWallet, state]);

  useEffect(() => {
    initialize();

    if (window.ethereum) {
      // Detect metamask account change
      window.ethereum.on("accountsChanged", async function (accounts) {
        connectWallet();
      });

      // Detect metamask network change
      window.ethereum.on("chainChanged", function (networkId) {
        connectWallet();
      });
    }
  }, []);

  return (
    <>
      <ConnectionContext.Provider
        value={{
          ...state,
          connectWallet,
        }}
      >
        {props.children}
      </ConnectionContext.Provider>
    </>
  );
}

export function useConnection() {
  return useContext(ConnectionContext);
}

export { ConnectionContext };
