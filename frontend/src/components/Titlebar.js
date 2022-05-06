import { React } from "react";
import { Portis, Injected } from "../utils/web3-connectors";
import { useWeb3React } from "@web3-react/core";
import { AppBar, Grid, Typography } from "@material-ui/core";
import { MetaMaskButton, Button, EthAddress } from "rimble-ui";
import About from "./About";
import { Link } from "react-router-dom";

const styles = {
  appbar: {
    background: "transparent",
    boxShadow: "none",
    backdropFilter: "blur(15px)",
    marginTop: 10,
  },
};

const Titlebar = () => {
  const { account, activate } = useWeb3React();
  return (
    <AppBar position="static" style={styles.appbar}>
      <Grid container>
        <Grid item xs={12} sm={4}>
          <Typography variant="h4" color="textPrimary">
            <Link
              to="/"
              style={{
                textDecoration: "none",
                fontSize: "25px",
                color: "#262626",
                marginLeft: "20px",
              }}
            >
              INSTASAFE INSURANCE
            </Link>
          </Typography>
        </Grid>

        <Grid item sm={3} xs={16} alignItems="center">
          <Typography variant="h4" color="textPrimary">
            <div>
              <Link
                to="/About"
                style={{
                  textDecoration: "none",
                  fontSize: "25px",
                  color: "white",
                  backgroundColor:"black",
                }}
              >
                ABOUT US
              </Link>
              <Link
                to="/Faq"
                style={{
                  textDecoration: "none",
                  fontSize: "25px",
                  color: "white",
                  backgroundColor:"black",
                  marginLeft: "20px",
                }}
              >
                FAQ
              </Link>
            </div>

          </Typography>
        </Grid>

        {/* <Link to="/about">Contact</Link> */}

        <Grid
          container
          item
          xs={12}
          sm={5}
          spacing={2}
          alignItems="center"
          justify="flex-end"
        >
          {account && (
            <Grid item>
              <EthAddress address={account} />
            </Grid>
          )}

          <Grid item>
            <Button
              mainColor="#805ad5"
              onClick={() => activate(Portis)}
              fullWidth
            >
              <Grid container alignItems="center" spacing={1}>
                <Grid item>
                  <img
                    src="https://www.portis.io/static/logo-small.svg"
                    alt="portis-logo"
                    width={15}
                  />
                </Grid>
                <Grid item>Portis</Grid>
              </Grid>
            </Button>
          </Grid>

          <Grid item>
            <MetaMaskButton onClick={() => activate(Injected)}>
              Metamask
            </MetaMaskButton>
          </Grid>
        </Grid>
      </Grid>
    </AppBar>
  );
};

export default Titlebar;
