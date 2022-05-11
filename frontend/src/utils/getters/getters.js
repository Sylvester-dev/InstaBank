//Address Provider

//protocolDataProvider ;
//walletBalanceProvider ;
//getLendingPool() -> deposit, withdraw,repay, borrow, liquidate
//getWETHGateway() -> deposit, withdraw, repay,borrow

//ETH, LINK, DAI

//Get all Home Page assets
//Returns [
// {
//      //string symbol;
//     //address tokenAddress;
// }
// ]

//GET ICON FROM ASSSETS

const getAllAssets = "getAllReservesTokens()";

//GET ASSET INFO

//liquidityRate -> Deposit APR
// variableBorrowRate -> Borrow APR
//Market Size -> availableLiquidity + totalVariableDebt
//totalVariableDebt -> Total Borrowed
//utilizationRate -> Utilization Rate

const getAssetInfo = "getReserveData(address asset)";

//ADD Direct
//max LTV -> 75%
//Liquidation Threshold -> 80%
//Liquidation Penalty -> 10%

//GET USER INFO
//currentVariableDebt -> Total Debt
//healthFactor-> Health Factor
//availableToBorrow -> Available to borrow
//balanceOf(address user, address token) -> Get Wallet Balance of TOKEN
//currentATokenBalance -> Currently Total Deposited
//currentATokenBalance -> Available to borrow

const getAllUserData = "getUserReserveData(address asset, address user)";

//DEPOSIT ASSET  ERC20
//LINK, DAI

const depositAssetERC20 =
  "deposit( address asset, uint256 amount (wei), address onBehalfOf )";
const borrowAssetERC20 =
  "borrow( address asset, uint256 amount, address onBehalfOf)";
const repayAssetERC20 =
  " repay( address asset, uint256 amount, address onBehalfOf) ";

//IF want to withdraw all use type(unit256).max
const withdrawAssestERC20 =
  " withdraw( address asset, uint256 amount, address to)";

//DEPOSIT FOR ETH
const depositAssetETH = "depositETH()";
const borrowAssetETH = "borrowETH(uint256 amount, address onBehalfOf)";
const repayETH = "repayETH(uint256 amount)";
const withdrawETH = "withdrawETH(uint256 amount)";
