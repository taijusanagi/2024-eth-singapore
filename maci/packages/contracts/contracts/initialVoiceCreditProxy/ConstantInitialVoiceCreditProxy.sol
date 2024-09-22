// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { InitialVoiceCreditProxy } from "./InitialVoiceCreditProxy.sol";

struct Player {
  uint256 x;
  uint256 y;
  uint256 resources;
  uint256 energy;
}

interface Game {
  function getPlayerByAddress(address playerAddress) external view returns (Player memory);
}

/// @title ConstantInitialVoiceCreditProxy
/// @notice This contract allows to set a constant initial voice credit balance
/// for MACI's voters.
contract ConstantInitialVoiceCreditProxy is InitialVoiceCreditProxy {
  /// @notice the balance to be returned by getVoiceCredits
  uint256 internal immutable balance;

  /// @notice creates a new ConstantInitialVoiceCreditProxy
  /// @param _balance the balance to be returned by getVoiceCredits
  constructor(uint256 _balance) payable {
    balance = _balance;
  }

  // hardcode the deployed conract
  address public gameAddress = 0x73E5D195B5cf7EB46DE86901AD941986E74921CA;

  /// @notice Returns the constant balance for any new MACI's voter
  /// @return balance
  function getVoiceCredits(address sender, bytes memory) public view override returns (uint256) {
    Player memory player = Game(gameAddress).getPlayerByAddress(sender);
    return player.resources;
  }
}
