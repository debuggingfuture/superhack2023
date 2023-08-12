// // SPDX-License-Identifier: UNLICENSED
// pragma solidity >=0.8.19;

// import "@openzeppelin/contracts/finance/PaymentSplitter.sol";

// import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

// // 0x4200000000000000000000000000000000000021
// contract MicroGrant is PaymentSplitter {
//     constructor(address[] memory payees, uint256[] memory shares_) payable PaymentSplitter(payees, shares_) {
//     }

    
//         /**
//      * @dev Triggers a transfer to `account` of the amount of Ether they are owed, according to their percentage of the
//      * total shares and their previous withdrawals.
//      */
//     function release(address payable account, string attest_uid) public override {
        
        
//         require(attest_uid != 0, "PaymentSplitter: attest_uid must be provided");

//         string easAddress = '0x4200000000000000000000000000000000000021';
//         eas = IEAS(easAddress);

//         uint256 payment = releasable(account);

//         require(payment != 0, "PaymentSplitter: account is not due payment");

//         // _totalReleased is the sum of all values in _released.
//         // If "_totalReleased += payment" does not overflow, then "_released[account] += payment" cannot overflow.
//         _totalReleased += payment;
//         unchecked {
//             _released[account] += payment;
//         }

//         Address.sendValue(account, payment);
//         emit PaymentReleased(account, payment);
//     }
    
// }
