import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { useConnection } from "../utils/connection_provider/connection_provider";
import { useAssetProvider } from "../utils/assets_provider/assets_provider";
import {
  displayAddress,
  getBlockExplorerLink,
  getImageFromSymbol,
  MAX_UINT,
  toEther,
  toWei,
} from "../utils/helpers";

import DepositSection from "../components/lendingpool/DepositSection";
import BorrowSection from "../components/lendingpool/BorrowSection";

import "../styles/asset_page.scss";
import WithdrawSection from "../components/lendingpool/WithdrawSection";
import RepaySection from "../components/lendingpool/RepaySection";
import Box from "../components/Box";
import Loading from "../components/loading/Loading";
import InfoIcon from "../components/info_icon/InfoIcon";

function AssetPage() {
  const { id } = useParams();

  const {
    chainId,
    protocolDataProvider,
    walletBalanceProvider,
    lendingPoolContract,
    daiContract,
    linkContract,
    awethContract,
    wETHGatewayContract,
    accounts,
    dwethContract,
  } = useConnection();

  let { state: assets, refresh } = useAssetProvider();

  const [asset, setAsset] = useState();
  const [isLoading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(
    "Please confirm the transaction from Browser Wallet"
  );
  const [localError, setError] = useState({
    deposit: null,
    withdraw: null,
    borrow: null,
    repay: null,
  });

  const [positions, setPositions] = useState({
    healthFactor: 0,
    currentBorrowed: 0,
    currentDeposited: 0,
    walletBalance: 0,
    availableToBorrow: 0,
    isApproved: true,
  });

  useEffect(() => {
    const fetchAsset = () => {
      setAsset(assets.find((asset) => asset.symbol === id));
    };

    fetchAsset();
  }, [assets, id]);

  const isTokenApproved = useCallback(async () => {
    switch (asset.symbol) {
      case "DAI":
        const approvedDAI = await daiContract.allowance(
          accounts[0],
          lendingPoolContract.address
        );
        return toEther(approvedDAI) !== 0;
      case "LINK":
        const approvedLINK = await linkContract.allowance(
          accounts[0],
          lendingPoolContract.address
        );
        return toEther(approvedLINK) !== 0;
      case "ETH":
        const approvedaWETH = await awethContract.allowance(
          accounts[0],
          wETHGatewayContract.address
        );
        return toEther(approvedaWETH) !== 0;
      default:
        break;
    }
  }, [asset, daiContract, linkContract, awethContract]);

  const fetchPositons = useCallback(async () => {
    const isApproved = await isTokenApproved();
    const isDwethApproved = await isDWETHApproved();

    //Fetch user data
    const userData = await protocolDataProvider.getUserReserveData(
      asset.tokenAddress,
      accounts[0]
    );

    let walletBalance = 0;

    if (asset.symbol === "ETH") {
      walletBalance = await walletBalanceProvider.balanceOf(
        accounts[0],
        "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
      );
    } else {
      walletBalance = await walletBalanceProvider.balanceOf(
        accounts[0],
        asset.tokenAddress
      );
    }

    const {
      currentVariableDebt,
      healthFactor,
      availableToBorrow,
      currentATokenBalance,
    } = userData;

    setPositions({
      currentBorrowed: toEther(currentVariableDebt),
      healthFactor: toEther(healthFactor),
      currentDeposited: toEther(currentATokenBalance),
      walletBalance: toEther(walletBalance),
      availableToBorrow: toEther(availableToBorrow),
      isApproved: isApproved,
      isDwethApproved: isDwethApproved,
    });
  }, [isTokenApproved, protocolDataProvider, walletBalanceProvider]);

  useEffect(() => {
    if (asset === undefined) return;
    if (accounts.length === 0) return;

    fetchPositons();
  }, [asset, accounts, fetchPositons]);

  const approveToken = async (isApproved, isRepay) => {
    setError({});
    if (isApproved) return;

    try {
      setLoading(true);
      setLoadingMsg("Approving Token");

      switch (asset.symbol) {
        case "DAI":
          const daiTx = await daiContract.approve(
            lendingPoolContract.address,
            MAX_UINT
          );
          await daiTx.wait();
          break;

        case "LINK":
          const linkTx = await linkContract.approve(
            lendingPoolContract.address,
            MAX_UINT
          );
          await linkTx.wait();
          break;

        case "ETH":
          console.log("Here");
          const awethTx = await awethContract.approve(
            wETHGatewayContract.address,
            MAX_UINT
          );
          await awethTx.wait();
          break;
        default:
          break;
      }

      setLoading(false);
    } catch (error) {
      isRepay ?
        setError({ repay: "Oops! The transaction failed" }) :
        setError({ deposit: "Oops! The transaction failed" });
      setLoading(false);
      console.log(error);
    }
  };

  const depositAsset = async (amount, isApproved) => {
    await approveToken(isApproved);

    if (localError.deposit !== null && localError.deposit !== undefined) return;

    try {
      setError({});
      setLoading(true);
      setLoadingMsg("Depositing Asset");

      if (asset.symbol === "ETH") {
        await wETHGatewayContract.depositETH({
          value: toWei(amount),
        });
      } else {
        await lendingPoolContract.deposit(
          asset.tokenAddress,
          toWei(amount),
          accounts[0]
        );
      }

      refresh();
      setLoading(false);
    } catch (error) {
      setError({ deposit: "Oops! The transaction failed" });
      setLoading(false);
      console.log(error);
    }
  };

  const approveETHBorrow = async (isApproved) => {
    setError({});
    if (isApproved || asset.symbol !== "ETH") return;

    try {
      setLoading(true);
      setLoadingMsg("Approving Token");

      const tx = await dwethContract.approveDelegation(
        wETHGatewayContract.address,
        MAX_UINT
      );
      await tx.wait();

      setLoading(false);
    } catch (error) {
      setError({ borrow: "Oops! The transaction failed" });
      setLoading(false);
      console.log(error);
    }
  };

  const borrowAsset = async (amount, isApproved) => {
    await approveETHBorrow(isApproved);

    if (localError.borrow !== null && localError.borrow !== undefined) return;

    try {
      if (amount * asset.priceInUsd > asset.availableLiquidityUsd) {
        setError({ borrow: "Protocol doesn't have enough liquidity" });
        return;
      }

      setError({});
      setLoading(true);
      setLoadingMsg("Borrowing Asset");

      if (asset.symbol === "ETH") {
        await wETHGatewayContract.borrowETH(toWei(amount), accounts[0]);
      } else {
        await lendingPoolContract.borrow(
          asset.tokenAddress,
          toWei(amount),
          accounts[0]
        );
      }

      refresh();
      setLoading(false);
    } catch (error) {
      setError({ borrow: "Oops! The transaction failed" });
      setLoading(false);
      console.log(error);
    }
  };

  const repayAsset = async (amount, isApproved) => {
    await approveToken(isApproved, true);

    if (localError.repay !== null && localError.repay !== undefined) return;

    try {
      setError({});
      setLoading(true);
      setLoadingMsg("Repaying Debt");

      if (asset.symbol === "ETH") {
        await wETHGatewayContract.repayETH(toWei(amount), {
          value: toWei(amount),
        });
      } else {
        await lendingPoolContract.repay(
          asset.tokenAddress,
          toWei(amount),
          accounts[0]
        );
      }

      refresh();
      setLoading(false);
    } catch (error) {
      setError({ repay: "Oops! The transaction failed" });
      setLoading(false);
      console.log(error);
    }
  };

  const withdrawAsset = async (amount) => {
    try {
      setError({});
      setLoading(true);
      setLoadingMsg("Witdrawing Asset");

      if (asset.symbol === "ETH") {
        await wETHGatewayContract.withdrawETH(toWei(amount));
      } else {
        await lendingPoolContract.withdraw(
          asset.tokenAddress,
          toWei(amount),
          accounts[0]
        );
      }

      refresh();
      setLoading(false);
    } catch (error) {
      setError({ withdraw: "Oops! The transaction failed" });
      setLoading(false);
      console.log(error);
    }
  };

  const withdrawAll = async () => {
    try {
      setError({});
      setLoading(true);

      if (asset.symbol === "ETH") {
        await wETHGatewayContract.withdrawETH(MAX_UINT);
      } else {
        await lendingPoolContract.withdraw(
          asset.tokenAddress,
          MAX_UINT,
          accounts[0]
        );
      }

      refresh();
      setLoading(false);
    } catch (error) {
      setError({ withdraw: "Oops! The transaction failed" });
      setLoading(false);
      console.log(error);
    }
  };

  const isDWETHApproved = async () => {
    const value = await dwethContract.borrowAllowance(
      accounts[0],
      wETHGatewayContract.address
    );
    return toEther(value) !== 0;
  };

  const getTokenFaucet = async () => {
    if (asset.symbol === "ETH") {
      if (chainId === 4) {
        window.open("https://faucet.rinkeby.io/", "_blank");
      }
    } else if (asset.symbol === "MATIC") {
      window.open("https://faucet.polygon.technology/", "_blank");
    } else if (asset.symbol === "DAI") {
      if (chainId === 4) {
        window.open(
          "https://ethereum.stackexchange.com/questions/72388/does-rinkeby-have-a-faucet-where-i-can-fill-a-wallet-with-dai",
          "_blank"
        );
      } else {
        await daiContract.mint(accounts[0], toWei(10));
      }
    } else if (asset.symbol === "LINK") {
      if (chainId === 4) {
        window.open("https://faucets.chain.link/rinkeby", "_blank");
      } else {
        await linkContract.mint(accounts[0], toWei(10));
      }
    }
  };

  if (asset === undefined) {
    return <Loading message={"Loading Asset Data"} />;
  } else if (isLoading) {
    return <Loading message={loadingMsg} />;
  }

  return (
    <main>
      <section className="asset-container pt-5 pb-5 pr-5 pl-5 mt-6 mb-5">
        <div className="asset-name mb-5">
          <img
            className="mr-2"
            src={getImageFromSymbol(asset.symbol)}
            alt="Crypto Icon"
          />
          <h4>{asset.symbol}</h4>
          <Box width={40} />
          <div>
            <a
              target="_blank"
              href={getBlockExplorerLink(chainId, asset.tokenAddress)}
            >
              {displayAddress(asset.tokenAddress)}
            </a>
            <Box height={5} />
            <div className="t-link" onClick={getTokenFaucet}>
              Get Testnet {asset.symbol}
            </div>
          </div>
        </div>

        <div className="asset-stats mb-5">
          <div>
            <p>Market Size</p>
            <h4>
              ${" "}
              {(asset.availableLiquidityUsd + asset.totalBorrowedUsd).toFixed(
                2
              )}
            </h4>
          </div>
          <div>
            <p>Available Liquidity</p>
            <h4>$ {asset.availableLiquidityUsd.toFixed(2)}</h4>
          </div>
          <div>
            <p>Price</p>
            <h4>$ {asset.priceInUsd.toFixed(2)}</h4>
          </div>
        </div>

        <div className="asset-info">
          <AssetInfo
            name="Deposit APY"
            value={asset.depositAPY.toFixed(2) + "%"}
          />
          <AssetInfo
            name="Borrow APY"
            value={asset.borrowAPY.toFixed(2) + "%"}
          />
          <AssetInfo
            name="Percentage Utilization"
            value={(asset.utilizationRatio * 100).toFixed(2) + "%"}
          />
          <AssetInfo name="Max LTV" value={asset.ltv + "%"} />
          <AssetInfo
            name="Liquidation Threshold"
            value={asset.liquidationThreshold + "%"}
          />
          <AssetInfo
            name="Liquidation Penalty"
            value={asset.liquidationBonus + "%"}
          />
        </div>
      </section>

      <section className="market-container mb-8">
        <div className="earn-section">
          <DepositSection
            symbol={asset.symbol}
            walletBalance={positions.walletBalance}
            isApproved={positions.isApproved}
            depositAsset={depositAsset}
            error={localError.deposit}
            onInputChange={(value) => {
              setError({})
            }}
          />
          {positions.currentDeposited > 0 ? (
            <>
              <Box height={50} />
              <WithdrawSection
                symbol={asset.symbol}
                currentDeposited={positions.currentDeposited}
                withdrawAsset={withdrawAsset}
                withdrawAll={withdrawAll}
                error={localError.withdraw}
                onInputChange={(value) => {
                  setError({})
                }}
              />
            </>
          ) : (
            <></>
          )}
        </div>
        <div className="borrow-section">
          <BorrowSection
            symbol={asset.symbol}
            availableToBorrow={positions.availableToBorrow}
            isApproved={positions.isDwethApproved}
            borrowAsset={borrowAsset}
            error={localError.borrow}
            onInputChange={(value) => {
              setError({})
            }}
          />
          {positions.currentBorrowed > 0 ? (
            <>
              <Box height={50} />
              <RepaySection
                symbol={asset.symbol}
                currentBorrowed={positions.currentBorrowed}
                isApproved={positions.isApproved}
                repayAsset={repayAsset}
                error={localError.repay}
                onInputChange={(value) => {
                  setError({})
                }}
              />
            </>
          ) : (
            <></>
          )}
        </div>
      </section>
    </main>
  );
}
export default AssetPage;

function AssetInfo({ name, value }) {
  return (
    <div>
      <p>{name}</p>
      <h4>{value}</h4>
    </div>
  );
}
