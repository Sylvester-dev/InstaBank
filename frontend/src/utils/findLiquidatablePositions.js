import { useConnection } from "./connection_provider/connection_provider";
import { ethers } from "ethers";

import IERC20Detailed from "../artifacts/contracts/interfaces/base/IERC20Detailed.sol/IERC20Detailed.json";
import { toEther } from "../utils/helpers";

const findLiqudatablePositions = async (
  data,
  provider,
  walletBalanceProvider,
  protocolDataProvider
) => {
  let loans = [];
  const healthFactorMax = 1;
  for (let i = 0; i < data.users.length; i++) {
    const user = data.users[i];
    var totalBorrowedInUsd = 0;
    var totalCollateralInUsd = 0;
    var totalCollateralThreshold = 0;
    var max_borrowedSymbol;
    var max_borrowedReserveAddress;
    var max_debtInToken = 0;
    var max_debtInUsd = 0;
    var max_collateralSymbol;
    var max_collateralReserveAddress;
    var max_collateralBonus = 0;
    var max_collateralPriceInUsd = 0;

    for (let b = 0; b < user.borrowReserve.length; b++) {
      const reserve = user.borrowReserve[b].reserve;

      const result = await protocolDataProvider.getUserReserveData(
        reserve,
        user.id
      );
      let symbol = await getSymbol(reserve, provider);
      // if (symbol === "WETH") symbol = "ETH";
      const priceInUsd = await getPriceInUsd(symbol, walletBalanceProvider);
      const debtInToken = toEther(result.currentVariableDebt);
      const debtInUsd = priceInUsd * debtInToken;
      totalBorrowedInUsd += debtInUsd;

      if (debtInToken > max_debtInToken) {
        max_borrowedSymbol = symbol;
        max_borrowedReserveAddress = reserve;
        max_debtInToken = debtInToken;
        max_debtInUsd = debtInUsd;
      }
    }

    for (let c = 0; c < user.collateralReserve.length; c++) {
      const reserve = user.collateralReserve[c].reserve;

      let symbol = await getSymbol(reserve, provider);
      // if (symbol === "WETH") symbol = "ETH";

      const priceInUsd = await getPriceInUsd(
        symbol,
        // symbol === "WETH" ? "ETH" : symbol,
        walletBalanceProvider
      );

      const result = await protocolDataProvider.getUserReserveData(
        reserve,
        user.id
      );
      const reserveInfo =
        await protocolDataProvider.getReserveConfigurationData(reserve);

      const aTokenBalance = toEther(result.currentATokenBalance);

      totalCollateralInUsd += priceInUsd * aTokenBalance;
      totalCollateralThreshold +=
        (totalCollateralInUsd * reserveInfo.liquidationThreshold) / 10000;

      if (reserveInfo.liquidationBonus > max_collateralBonus) {
        max_collateralSymbol = symbol;
        max_collateralReserveAddress = reserve;
        max_collateralBonus = reserveInfo.liquidationBonus;
        max_collateralPriceInUsd = priceInUsd;
      }
    }

    var healthFactor = totalCollateralThreshold / totalBorrowedInUsd;

    console.log("Health Factor", healthFactor);

    if (healthFactor <= healthFactorMax) {
      const borrowTokenRate = await getPriceInUsd(
        max_borrowedSymbol,
        walletBalanceProvider
      );
      const collateralTokenRate = await getPriceInUsd(
        max_collateralSymbol,
        walletBalanceProvider
      );

      const rate = borrowTokenRate / collateralTokenRate;

      const maxPayable = max_debtInToken * 0.5;
      const collateralBonus = max_collateralBonus / 10000;
      const maxRecievable = maxPayable * collateralBonus * rate;

      loans.push({
        userId: user.id,
        healthFactor: healthFactor,
        collateralSymbol: max_collateralSymbol,
        borrowedSymbol: max_borrowedSymbol,
        borrowedAddress: max_borrowedReserveAddress,
        debtInToken: max_debtInToken,
        debtInUsd: max_debtInUsd,
        collateralPriceInUsd: max_collateralPriceInUsd,
        collateralAddress: max_collateralReserveAddress,
        collateralBonus,
        maxPayable,
        maxRecievable,
      });
    }
  }
  // //filter out loans under a threshold that we know will not be profitable (liquidation_threshold)
  // loans = loans.filter(
  //   (loan) =>
  //     (loan.debtInToken * 0.5 * (loan.collateralBonus - 1) * loan.debtInUsd) /
  //       10 ** 18 >=
  //     0.01
  // );
  // console.log(loans);

  return loans;
};

// data.users.forEach(async (user, i) => {
//   var totalBorrowed = 0;
//   var totalCollateral = 0;
//   var totalCollateralThreshold = 0;
//   var max_borrowedSymbol;
//   var max_borrowedPrincipal = 0;
//   var max_borrowedPriceInEth = 0;
//   var max_collateralSymbol;
//   var max_collateralBonus = 0;
//   var max_collateralPriceInEth = 0;
//   var totalBorrowed = 0;
//   var totalCollateral = 0;
//   var totalCollateralThreshold = 0;
//   var max_borrowedSymbol;
//   var max_borrowedPrincipal = 0;
//   var max_borrowedPriceInEth = 0;
//   var max_collateralSymbol;
//   var max_collateralBonus = 0;
//   var max_collateralPriceInEth = 0;

//   const promises = user.borrowReserve.map(async (reserve, i) => {
//     const data = await protocolDataProvider.getUserReserveData(
//       reserve,
//       user.id
//     );
//     // const symbol = await getSymbol(reserve, provider);
//     // const priceInUsd = await getPriceInUsd(symbol, walletBalanceProvider);
//     // const debtInToken = data.currentVariableDebt;
//     // const debtInUsd = priceInUsd * debtInToken;
//     // max_borrowedPriceInEth = debtInUsd;
//   });

//   await Promise.all(promises);

// user.borrowReserve.forEach((borrowReserve, i) => {
//   var priceInEth = borrowReserve.reserve.price.priceInEth;
//   var principalBorrowed = borrowReserve.currentTotalDebt;
//   totalBorrowed +=
//     (priceInEth * principalBorrowed) / 10 ** borrowReserve.reserve.decimals;
//   if (principalBorrowed > max_borrowedPrincipal)
//     max_borrowedSymbol = borrowReserve.reserve.symbol;
//   max_borrowedPrincipal = principalBorrowed;
//   max_borrowedPriceInEth = priceInEth;
// });
//   // user.collateralReserve.forEach((collateralReserve, i) => {
//   //   var priceInEth = collateralReserve.reserve.price.priceInEth;
//   //   var principalATokenBalance = collateralReserve.currentATokenBalance;
//   //   totalCollateral +=
//   //     (priceInEth * principalATokenBalance) /
//   //     10 ** collateralReserve.reserve.decimals;
//   //   totalCollateralThreshold +=
//   //     (priceInEth *
//   //       principalATokenBalance *
//   //       (collateralReserve.reserve.reserveLiquidationThreshold / 10000)) /
//   //     10 ** collateralReserve.reserve.decimals;
//   //   if (
//   //     collateralReserve.reserve.reserveLiquidationBonus > max_collateralBonus
//   //   ) {
//   //     max_collateralSymbol = collateralReserve.reserve.symbol;
//   //     max_collateralBonus = collateralReserve.reserve.reserveLiquidationBonus;
//   //     max_collateralPriceInEth = priceInEth;
//   //   }
//   // });
//   // var healthFactor = totalCollateralThreshold / totalBorrowed;

//   // if (healthFactor <= healthFactorMax) {
//   //   loans.push({
//   //     user_id: user.id,
//   //     healthFactor: healthFactor,
//   //     max_collateralSymbol: max_collateralSymbol,
//   //     max_borrowedSymbol: max_borrowedSymbol,
//   //     max_borrowedPrincipal: max_borrowedPrincipal,
//   //     max_borrowedPriceInEth: max_borrowedPriceInEth,
//   //     max_collateralBonus: max_collateralBonus / 10000,
//   //     max_collateralPriceInEth: max_collateralPriceInEth,
//   //   });
//   // }
// });

//   filter out loans under a threshold that we know will not be profitable (liquidation_threshold)
//   loans = loans.filter(
//     (loan) =>
//       (loan.max_borrowedPrincipal *
//         allowedLiquidation *
//         (loan.max_collateralBonus - 1) *
//         loan.max_borrowedPriceInEth) /
//         10 ** TOKEN_LIST[loan.max_borrowedSymbol].decimals >=
//       profit_threshold
//   );
// return loans;
// };

export default findLiqudatablePositions;

//
const getPriceInUsd = async (symbol, walletBalanceProvider) => {
  const assetSymbol = symbol === "WETH" ? "ETH" : symbol;

  const byte32 = ethers.utils.formatBytes32String(assetSymbol);

  const value = await walletBalanceProvider.getPriceInUsd(byte32);

  const priceInUsd = value / 1e8;

  // return priceInUsd;
  ///mock
  if (assetSymbol === "ETH") return 1;
  if (assetSymbol === "DAI") return 2.2;
  return priceInUsd;
};

const getSymbol = async (address, provider) => {
  const contract = new ethers.Contract(address, IERC20Detailed.abi, provider);

  return await contract.symbol();
};
