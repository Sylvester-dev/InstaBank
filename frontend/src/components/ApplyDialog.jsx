import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";

import { SUPERFLUID_USER_MANAGER_ADDRESS } from "../constants";
import { getPremiumRatePerSecond } from "../utils/chainlink-api-contract";
import { getSuperfluidSdk, startFlowFDaiX } from "../utils/superfluid";
import { useConnection } from "../utils/connection_provider/connection_provider";

const ApplyDialog = ({ refresh }) => {
  // Ethereum
  const { accounts } = useConnection();

  // State
  const [isOpen, setIsOpen] = useState(false);
  const [transactionProcessing, setTransactionProcessing] = useState(false);
  const [premiumRate, setPremiumRate] = useState(null);
  const [superFluidFramework, setSuperFluidFramework] = useState(null);

  useEffect(() => {
    const operation = async () => {

      
      // Get premium rate for user
      const premiumRate = await getPremiumRatePerSecond(accounts[0]);
      console.log(`Premium Rate for user: ${premiumRate} fDAI/s`);
      setPremiumRate(premiumRate);

      console.log("Setting up superfluid framework...");
      setSuperFluidFramework(await getSuperfluidSdk());
    };
    operation()
      .then(() => {})
      .catch(console.log);
  }, [accounts[0]]);
  return (
    <>
      <Button onClick={() => setIsOpen(true)} size="large" variant="outlined">
        <Typography variant="h3">Apply for an Insurance</Typography>
      </Button>
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Apply for Insurance</DialogTitle>
        <DialogContent>
          {transactionProcessing && <CircularProgress />}
          {premiumRate && !transactionProcessing && (
            <h4>
              Your premium rate is {premiumRate} x 10<sup>-18</sup> fDAI/s
            </h4>
          )} 
        </DialogContent>
        <DialogActions>
          {premiumRate && (
            <Button
              onClick={async () => {
                setTransactionProcessing(true);
                await startFlowFDaiX(
                  premiumRate,
                  accounts[0],
                  SUPERFLUID_USER_MANAGER_ADDRESS,
                  superFluidFramework
                );
                setTransactionProcessing(false);
                setIsOpen(false);
                refresh();
              }}
            >
              Start Payments
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ApplyDialog;