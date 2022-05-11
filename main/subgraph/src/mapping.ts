import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  LendingPool,
  Borrow,
  Deposit,
  LiquidationCall,
  Repay,
  ReserveDataUpdated,
  ReserveUsedAsCollateralDisabled,
  ReserveUsedAsCollateralEnabled,
  Withdraw
} from "../generated/LendingPool/LendingPool"
import { User, UserReserve } from "../generated/schema"
import { getOrInitUser, getOrInitUserReserve } from "./helper"

export function handleBorrow(event: Borrow): void {
  // let user = User.load(event.params.onBehalfOf.toHex())
  // let userReserve = UserReserve.load(event.params.onBehalfOf.toHex() + event.params.reserve.toHex())
  let user = getOrInitUser(event.params.onBehalfOf)
  user.isBorrowingAny = true
  let userReserve = getOrInitUserReserve(event.params.onBehalfOf, event.params.reserve)

  // Now fetch bools from LendingPool Contract
  let lendingPool = LendingPool.bind(event.address);
	let userReserveStatus = lendingPool.try_getUserReserveStatus(event.params.onBehalfOf, event.params.reserve);
	if (userReserveStatus.reverted) {
    log.info("getUserReserveStatus reverted", [])
	} else {
		userReserve.isBorrowing = userReserveStatus.value.value0;
		userReserve.isUsingAsCollateral = userReserveStatus.value.value1;
	}

  // Entities can be written to the store with `.save()`
  userReserve.save()
  user.save()

  // Note: If a handler doesn't require existing field values, it is faster
  // _not_ to load the entity from the store. Instead, create it fresh with
  // `new Entity(...)`, set the fields that should be updated and save the
  // entity back to the store. Fields that were not set or unset remain
  // unchanged, allowing for partial updates to be applied.
}

export function handleDeposit(event: Deposit): void {

  let user = getOrInitUser(event.params.onBehalfOf)
  let userReserve = getOrInitUserReserve(event.params.onBehalfOf, event.params.reserve)
  userReserve.user = user.id
  userReserve.reserve = event.params.reserve

  // Now fetch bools from LendingPool Contract
  let lendingPool = LendingPool.bind(event.address);
	let userReserveStatus = lendingPool.try_getUserReserveStatus(event.params.onBehalfOf, event.params.reserve);
	if (userReserveStatus.reverted) {
    log.info("getUserReserveStatus reverted", [])
	} else {
		userReserve.isBorrowing = userReserveStatus.value.value0;
		userReserve.isUsingAsCollateral = userReserveStatus.value.value1;
	}

  let userIsBorrowingAny = lendingPool.try_getUserIsBorrowingAny(event.params.onBehalfOf);
  if(userIsBorrowingAny.reverted) {
    log.info("getUserIsBorrowingAny reverted", [])
  } else {
    user.isBorrowingAny = userIsBorrowingAny.value
  }

  // Entities can be written to the store with `.save()`
  userReserve.save()
  user.save()
}

export function handleLiquidationCall(event: LiquidationCall): void {
  let user = getOrInitUser(event.params.user)
  let userReserve = getOrInitUserReserve(event.params.user, event.params.collateralAsset)
  let liquidator = getOrInitUser(event.params.liquidator)
  // let liquidatorReserve = getOrInitUserReserve(event.params.liquidator, event.params.collateralAsset)
  
  // Update user details
  let lendingPool = LendingPool.bind(event.address);
	let userReserveStatus = lendingPool.try_getUserReserveStatus(event.params.user, event.params.collateralAsset);
	if (userReserveStatus.reverted) {
    log.info("getUserReserveStatus reverted", [])
	} else {
		userReserve.isBorrowing = userReserveStatus.value.value0;
		userReserve.isUsingAsCollateral = userReserveStatus.value.value1;
	}

  let userIsBorrowingAny = lendingPool.try_getUserIsBorrowingAny(event.params.user);
  if(userIsBorrowingAny.reverted) {
    log.info("getUserIsBorrowingAny reverted", [])
  } else {
    user.isBorrowingAny = userIsBorrowingAny.value
  }

  // Update liquidator details
	let liquidatorReserveStatus = lendingPool.try_getUserReserveStatus(event.params.liquidator, event.params.collateralAsset);
	if (liquidatorReserveStatus.reverted) {
    log.info("getUserReserveStatus reverted", [])
	} else {
		userReserve.isBorrowing = liquidatorReserveStatus.value.value0;
		userReserve.isUsingAsCollateral = liquidatorReserveStatus.value.value1;
	}

  // let liquidatorIsBorrowingAny = lendingPool.try_getUserIsBorrowingAny(event.params.liquidator);
  // if(liquidatorIsBorrowingAny.reverted) {
  //   log.info("getUserIsBorrowingAny reverted", [])
  // } else {
  //   user.isBorrowingAny = liquidatorIsBorrowingAny.value
  // }
  userReserve.save()
  user.save()
  liquidator.save()

}

export function handleRepay(event: Repay): void {
  let user = getOrInitUser(event.params.user)
  let userReserve = getOrInitUserReserve(event.params.user, event.params.reserve)

  let lendingPool = LendingPool.bind(event.address);
	let userReserveStatus = lendingPool.try_getUserReserveStatus(event.params.user, event.params.reserve);
	if (userReserveStatus.reverted) {
    log.info("getUserReserveStatus reverted", [])
	} else {
		userReserve.isBorrowing = userReserveStatus.value.value0;
		userReserve.isUsingAsCollateral = userReserveStatus.value.value1;
	}

  let userIsBorrowingAny = lendingPool.try_getUserIsBorrowingAny(event.params.user);
  if(userIsBorrowingAny.reverted) {
    log.info("getUserIsBorrowingAny reverted", [])
  } else {
    user.isBorrowingAny = userIsBorrowingAny.value
  }

  userReserve.save()
  user.save()
}

export function handleReserveUsedAsCollateralDisabled(
  event: ReserveUsedAsCollateralDisabled
): void {
  let userReserve = getOrInitUserReserve(event.params.user, event.params.reserve)

  userReserve.isUsingAsCollateral = false

  userReserve.save()
}

export function handleReserveUsedAsCollateralEnabled(
  event: ReserveUsedAsCollateralEnabled
): void {
  let userReserve = getOrInitUserReserve(event.params.user, event.params.reserve)
  userReserve.isUsingAsCollateral = true
  userReserve.save()
}

export function handleWithdraw(event: Withdraw): void {
  let user = getOrInitUser(event.params.user)
  let userReserve = getOrInitUserReserve(event.params.user, event.params.reserve)

  let lendingPool = LendingPool.bind(event.address);
	let userReserveStatus = lendingPool.try_getUserReserveStatus(event.params.user, event.params.reserve);
	if (userReserveStatus.reverted) {
    log.info("getUserReserveStatus reverted", [])
	} else {
		userReserve.isBorrowing = userReserveStatus.value.value0;
		userReserve.isUsingAsCollateral = userReserveStatus.value.value1;
	}

  let userIsBorrowingAny = lendingPool.try_getUserIsBorrowingAny(event.params.user);
  if(userIsBorrowingAny.reverted) {
    log.info("getUserIsBorrowingAny reverted", [])
  } else {
    user.isBorrowingAny = userIsBorrowingAny.value
  }

  userReserve.save()
  user.save()
}
