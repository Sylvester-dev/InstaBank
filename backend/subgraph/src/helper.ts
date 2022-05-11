import { Address, Bytes, ethereum, log } from '@graphprotocol/graph-ts';
import { LendingPool } from "../generated/LendingPool/LendingPool"
import { User, UserReserve } from '../generated/schema';

// export function getUserReserveStatus(LPAddress: Address, onBehalfOf: Address, reserve: Address) {
//     let lendingPool = LendingPool.bind(LPAddress);
// 	let userReserveStatus = lendingPool.try_getUserReserveStatus(onBehalfOf, reserve);
// 	if (userReserveStatus.reverted) {
//     // console.info("getUserReserveStatus reverted")
//         return null
// 	} else {
// 		// userReserve.isBorrowing = userReserveStatus.value.value0;
// 		// userReserve.isUsingAsCollateral = userReserveStatus.value.value1;
//         return userReserveStatus.value;
// 	}
// }

export function getOrInitUser(address: Address): User {

	let user = User.load(address.toHexString())

	if(user == null) {
		user = new User(address.toHexString())
		user.isBorrowingAny = false
		user.user = address
	}

	return user as User
}

export function getOrInitUserReserve(_user: Address, _reserve: Address): UserReserve {
	let userReserve = UserReserve.load(_user.toHexString() + _reserve.toHexString())

	if (userReserve == null) {
		userReserve = new UserReserve(_user.toHexString() + _reserve.toHexString())
		userReserve.user = _user.toHexString()
		userReserve.reserve = _reserve
		userReserve.isBorrowing = false
		userReserve.isUsingAsCollateral = false
	}

	return userReserve as UserReserve
}