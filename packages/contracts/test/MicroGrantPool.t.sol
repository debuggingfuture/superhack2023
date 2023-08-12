// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.19 <0.9.0;

import { PRBTest } from "@prb/test/PRBTest.sol";
import { console2 } from "forge-std/console2.sol";
import { StdCheats } from "forge-std/StdCheats.sol";


import "@ethereum-attestation-service/eas-contracts/contracts/IEAS.sol";

import { MicroGrantPool } from "../src/MicroGrantPool.sol";

interface IERC20 {
    function balanceOf(address account) external view returns (uint256);
}

/// @dev If this is your first time with Forge, read this tutorial in the Foundry Book:
/// https://book.getfoundry.sh/forge/writing-tests
contract MicroGrantPoolTest is PRBTest, StdCheats {
    MicroGrantPool internal microGrantPool;

     address constant easAddress = 0x4200000000000000000000000000000000000021;

    /// @dev A function invoked before each test case is run.
    function setUp() public virtual {
        // Instantiate the contract-under-test.

        address[] memory payees = new address[](2);

        payees[0] = 0x4513e09002228b6F9bfac47CFaA0c58D5227a0a3;
        payees[1] = 0xB2E3e8e62d5cb7edDAEb2B7956B6A908Fe9591F6;
        

        uint256[] memory shares = new uint256[](2);
        shares[0] = 70;
        shares[1] = 30;
        
        microGrantPool = new MicroGrantPool(payees, shares);
    }

    /// @dev Basic test. Run it with `forge test -vvv` to see the console log.
    function test_totalReleased() external {
        assertEq(microGrantPool.totalReleased(), 0, "value mismatch");
    }

    // /// @dev Basic test. Run it with `forge test -vvv` to see the console log.
    // function test_attestation_contract() external {

    //     bytes32 attest_uid = bytes32(0x8f7e677e14e0112b06f2717d290d69334c53d5fe4af1f1c63415c60f5d881a85);

    //     address payable payee1 = payable(0x4513e09002228b6F9bfac47CFaA0c58D5227a0a3);

    //     // vm.expectCall(
    //     //     address(tCallContract),
    //     //     abi.encodeWithSignature("foo(string, uint256)", "call foo", 123)
    //     // );
    //     IEAS eas = IEAS(easAddress);

    //     eas.getSchemaRegistry();

    //     // vm.expectRevert(bytes("error message"));
    //     // microGrantPool.release(payee1, attest_uid);

    // }

    // function test_attestation_direct() external {

    //     bytes32 attest_uid = bytes32(0x8f7e677e14e0112b06f2717d290d69334c53d5fe4af1f1c63415c60f5d881a85);

    //     // address payable payee1 = payable(0x4513e09002228b6F9bfac47CFaA0c58D5227a0a3);
    //     IEAS eas = IEAS(easAddress);
    //     vm.expectCall(
    //         address(eas),
    //         abi.encodeWithSignature("getSchemaRegistry()")
    //     );

    //     eas.getSchemaRegistry();


    // }
}
