const { ethers } = require("ethers");

const customPrint = (str) => {
  // console.log(str);
};

const toWei = (num) => {
  return ethers.utils.parseEther(num.toString());
};

const toEther = (num) => {
  return parseFloat(ethers.utils.formatEther(num.toString()));
};

const calculateAPY = (aprInWei) => {
  const apr = toEther(aprInWei);
  let rate = apr / 2102400;

  rate = rate / 100;

  let apy = (1 + rate) ** 2102400 - 1;

  console.log(apy * 100);
};

module.exports = {
  toWei,
  toEther,
  customPrint,
  calculateAPY,
};
