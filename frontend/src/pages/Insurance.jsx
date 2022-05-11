import React, { useState, useEffect } from "react";
//import Titlebar from "./Titlebar";
import { useWeb3React } from "@web3-react/core";
import { ethers, providers } from "ethers";
import { SUPERFLUID_USER_MANAGER_ADDRESS } from "../constants";
import { SUPER_FLUID_TEST_ABI } from "../Abi/SuperFluidTest";
import RegisterDialog from "../components/RegisterDialog";
import ApplyDialog from "../components/ApplyDialog";
import { Typography } from "@material-ui/core";
import { useConnection } from "../utils/connection_provider/connection_provider";

const Insurance = () => {

  //console.log(window.ethereum);
  const { accounts } = useConnection();
  //const { library } = useWeb3React();
  const [isRegistered, setIsRegistered] = useState(null);
  const [isPayingPremiun, setIsPayingPremiun] = useState(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);

  const reRenderHomePage = () => setNeedsRefresh(!needsRefresh);

  useEffect(() => {
    console.log(accounts[0])
    //console.log(library)
    const operation = async () => {
      

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      const signer = provider.getSigner();

      const { chainId } = await provider.getNetwork();


      //const signer = provider.getSigner();
      //const signer = library.getSigner(accounts[0]);

      
      const superFluidContract = new ethers.Contract(
        SUPERFLUID_USER_MANAGER_ADDRESS,
        SUPER_FLUID_TEST_ABI,
        signer
      );

      // Check if address is registered
      const registrationStatus = await superFluidContract.isAddressRegistered(
        accounts[0]
      );
      if (registrationStatus) {
        console.log(`${accounts[0]} is registered`);
      } else {
        console.log(`${accounts[0]} is not registred`);
      }
      setIsRegistered(registrationStatus);

      // Check fi user is paying premiums
      const premiumPaymentStatus = await superFluidContract.isAddressSendingPremiums(
        accounts[0]
      );
      if (premiumPaymentStatus) {
        console.log(`${accounts[0]} is paying premiums`);
      } else {
        console.log(`${accounts[0]} is not paying premiums`);
      }
      setIsPayingPremiun(premiumPaymentStatus);
    };
    operation()
      .then(() => {})
      .catch(console.log);
  }, [accounts[0], isRegistered, providers, needsRefresh]);

  return (
    <>
      {/* <div
        class="bg_image"
        style={{
          backgroundImage: `url('https://wallup.net/wp-content/uploads/2016/07/20/23083-waves-The_Great_Wave_off_Kanagawa.jpg')`,
          backgroundSize: "cover",
          height: "92vh",
          opacity:"0.4",
          marginTop:"5px",
        }}
      ></div> */}
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "50%",
          color:"darkstalegrey",
          transform: "translate(-50%, -50%)",
        }}
      >
        {!isRegistered && (
          <Typography variant="h1">
         <i style={fontSize="30px"}> "If you wish to be protected against damages that could wreck your life, then you must purchase insurance today."</i>
          </Typography>
        )}
        {isRegistered && !isPayingPremiun && (
          <Typography variant="h2">
            Once you start paying the premiums you'll automatically recieve a
            payout if you're hit by a Natural Disaster.
          </Typography>
        )}
        {isPayingPremiun && (
          <Typography variant="h2">You are now insured!</Typography>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "70%",
          transform: "translate(-50%, -50%)",
        }}
      >
        {accounts[0] &&
          (isRegistered ? (
            !isPayingPremiun && <ApplyDialog refresh={reRenderHomePage} />
          ) : (
            <RegisterDialog refresh={reRenderHomePage} />
          ))}{" "}
      </div>
    </>
  );
};

export default Insurance;