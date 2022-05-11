const ProtocolErrors = {
    //common errors
    BORROW_ALLOWANCE_NOT_ENOUGH: "59", //* User borrows on behalf, but allowance are too small

    //contract specific errors
    VL_INVALID_AMOUNT: "1", //* 'Amount must be greater than 0'
    VL_INVALID_ASSET: "79", //* 'Asset reserve does not exist'
    VL_NO_ACTIVE_RESERVE: "2", // 'Action requires an active reserve'
    VL_RESERVE_FROZEN: "3", // 'Action cannot be performed because the reserve is frozen'
    VL_CURRENT_AVAILABLE_LIQUIDITY_NOT_ENOUGH: "4", // 'The current liquidity is not enough'
    VL_NOT_ENOUGH_AVAILABLE_USER_BALANCE: "5", //* 'User cannot withdraw more than the available balance'
    VL_TRANSFER_NOT_ALLOWED: "6", //* 'Transfer cannot be allowed.'
    VL_BORROWING_NOT_ENABLED: "7", // 'Borrowing is not enabled'
    VL_INVALID_INTEREST_RATE_MODE_SELECTED: "8", // 'Invalid interest rate mode selected'
    VL_COLLATERAL_BALANCE_IS_0: "9", //* 'The collateral balance is 0'
    VL_HEALTH_FACTOR_LOWER_THAN_LIQUIDATION_THRESHOLD: "10", //* 'Health factor is lesser than the liquidation threshold'
    VL_COLLATERAL_CANNOT_COVER_NEW_BORROW: "11", //* 'There is not enough collateral to cover a new borrow'
    VL_STABLE_BORROWING_NOT_ENABLED: "12", // stable borrowing not enabled
    VL_COLLATERAL_SAME_AS_BORROWING_CURRENCY: "13", // collateral is (mostly) the same currency that is being borrowed
    VL_AMOUNT_BIGGER_THAN_MAX_LOAN_SIZE_STABLE: "14", // 'The requested amount is greater than the max loan size in stable rate mode
    VL_NO_DEBT_OF_SELECTED_TYPE: "15", // 'for repayment of stable debt, the user needs to have stable debt, otherwise, he needs to have variable debt'
    VL_NO_EXPLICIT_AMOUNT_TO_REPAY_ON_BEHALF: "16", //* 'To repay on behalf of an user an explicit amount to repay is needed'
    VL_NO_STABLE_RATE_LOAN_IN_RESERVE: "17", // 'User does not have a stable rate loan in progress on this reserve'
    VL_NO_VARIABLE_RATE_LOAN_IN_RESERVE: "18", // 'User does not have a variable rate loan in progress on this reserve'
    VL_UNDERLYING_BALANCE_NOT_GREATER_THAN_0: "19", //* 'The underlying balance needs to be greater than 0'
    VL_DEPOSIT_ALREADY_IN_USE: "20", //* 'User deposit is already being used as collateral'
    VL_INCONSISTENT_FLASHLOAN_PARAMS: "73",

    LP_NOT_ENOUGH_STABLE_BORROW_BALANCE: "21", // 'User does not have any stable rate loan for this reserve'
    LP_INTEREST_RATE_REBALANCE_CONDITIONS_NOT_MET: "22", // 'Interest rate rebalance conditions were not met'
    LP_LIQUIDATION_CALL_FAILED: "23", // 'Liquidation call failed'
    LP_NOT_ENOUGH_LIQUIDITY_TO_BORROW: "24", //* 'There is not enough liquidity available to borrow'
    LP_REQUESTED_AMOUNT_TOO_SMALL: "25", // 'The requested amount is too small for a FlashLoan.'
    LP_INCONSISTENT_PROTOCOL_ACTUAL_BALANCE: "26", // 'The actual balance of the protocol is inconsistent'
    LP_CALLER_NOT_LENDING_POOL_CONFIGURATOR: "27", // 'The caller of the function is not the lending pool configurator'
    LP_INCONSISTENT_FLASHLOAN_PARAMS: "28",
    LP_FAILED_REPAY_WITH_COLLATERAL: "57",
    LP_FAILED_COLLATERAL_SWAP: "60",
    LP_INVALID_EQUAL_ASSETS_TO_SWAP: "61",
    LP_REENTRANCY_NOT_ALLOWED: "62",
    LP_CALLER_MUST_BE_AN_ATOKEN: "63", // *
    LP_IS_PAUSED: "64", // 'Pool is paused'
    LP_NO_MORE_RESERVES_ALLOWED: "65", // *
    LP_INVALID_FLASH_LOAN_EXECUTOR_RETURN: "66",
    LP_NOT_CONTRACT: "78", // *
    LP_INCONSISTENT_PARAMS_LENGTH: "74",
    LP_NOT_ADDRESSESPROVIDER: "75", // 'Created by us'
    // LPCM -> LP
    LP_HEALTH_FACTOR_NOT_BELOW_THRESHOLD: "42", //* 'Health factor is not below the threshold'
    LP_COLLATERAL_CANNOT_BE_LIQUIDATED: "43", //* 'The collateral chosen cannot be liquidated'
    LP_SPECIFIED_CURRENCY_NOT_BORROWED_BY_USER: "44", //* 'User did not borrow the specified currency'
    LP_NOT_ENOUGH_LIQUIDITY_TO_LIQUIDATE: "45", // "There isn't enough liquidity available to liquidate"
    LP_NO_ERRORS: "46", // 'No errors'

    CT_CALLER_MUST_BE_LENDING_POOL: "29", //* 'The caller of this function must be a lending pool'
    CT_CANNOT_GIVE_ALLOWANCE_TO_HIMSELF: "30", // 'User cannot give allowance to himself'
    CT_TRANSFER_AMOUNT_NOT_GT_0: "31", // 'Transferred amount needs to be greater than zero'
    CT_INVALID_MINT_AMOUNT: "56", //*invalid amount to mint
    CT_INVALID_BURN_AMOUNT: "58", //*invalid amount to burn

    MATH_MULTIPLICATION_OVERFLOW: "48", // *
    MATH_ADDITION_OVERFLOW: "49", // *
    MATH_DIVISION_BY_ZERO: "50", // *

    RL_RESERVE_ALREADY_INITIALIZED: "32", //* 'Reserve has already been initialized'
    RL_LIQUIDITY_INDEX_OVERFLOW: "51", //*  Liquidity index overflows uint128
    RL_VARIABLE_BORROW_INDEX_OVERFLOW: "52", //*  Variable borrow index overflows uint128
    RL_LIQUIDITY_RATE_OVERFLOW: "53", //*  Liquidity rate overflows uint128
    RL_VARIABLE_BORROW_RATE_OVERFLOW: "54", //*  Variable borrow rate overflows uint128
    RL_STABLE_BORROW_RATE_OVERFLOW: "55", //  Stable borrow rate overflows uint128

    RC_INVALID_LTV: "67", // *
    RC_INVALID_LIQ_THRESHOLD: "68", // *
    RC_INVALID_LIQ_BONUS: "69", // *
    RC_INVALID_DECIMALS: "70", // *
    RC_INVALID_RESERVE_FACTOR: "71",

    UC_INVALID_INDEX: "77", // *
    ET_AMOUNT_EXCEEDS_BALANCE: "ERC20: transfer amount exceeds balance",
}

module.exports = { ProtocolErrors };