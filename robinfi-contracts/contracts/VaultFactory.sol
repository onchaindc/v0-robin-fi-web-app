// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { RobinFiVault } from "./RobinFiVault.sol";

/**
 * @title RobinFiFactory
 * @notice Permissionless factory for tokenized-stock index vaults. Anyone can
 *         create a vault, seed it, and have it listed in the marketplace.
 */
contract RobinFiFactory {
    address[] private _allVaults;
    mapping(address => address[]) private _vaultsByCreator;

    event VaultCreated(
        address indexed vault,
        address indexed creator,
        string name,
        string symbol,
        uint256 seededWith
    );

    error InvalidBasket();
    error EmptyName();
    error CreationFailed();

    function createVault(
        string calldata name_,
        string calldata symbol_,
        string calldata description_,
        address[] calldata stockTokens,
        uint256[] calldata allocationsBps
    ) external payable returns (address vaultAddress) {
        if (bytes(name_).length == 0 || bytes(symbol_).length == 0) revert EmptyName();
        if (stockTokens.length == 0 || stockTokens.length != allocationsBps.length) {
            revert InvalidBasket();
        }
        if (stockTokens.length > 12) revert InvalidBasket();

        uint256 total;
        for (uint256 i = 0; i < allocationsBps.length; i++) {
            if (stockTokens[i] == address(0) || allocationsBps[i] == 0) revert InvalidBasket();
            total += allocationsBps[i];
        }
        if (total != 10_000) revert InvalidBasket();

        RobinFiVault vault = new RobinFiVault(
            name_,
            symbol_,
            description_,
            msg.sender,
            stockTokens,
            allocationsBps
        );
        vaultAddress = address(vault);

        _allVaults.push(vaultAddress);
        _vaultsByCreator[msg.sender].push(vaultAddress);

        if (msg.value > 0) {
            vault.deposit{ value: msg.value }(msg.value, msg.sender);
        }

        emit VaultCreated(vaultAddress, msg.sender, name_, symbol_, msg.value);
    }

    function getAllVaults() external view returns (address[] memory) {
        return _allVaults;
    }

    function getVaultsByCreator(address creator) external view returns (address[] memory) {
        return _vaultsByCreator[creator];
    }

    function vaultCount() external view returns (uint256) {
        return _allVaults.length;
    }

    function vaultAt(uint256 index) external view returns (address) {
        return _allVaults[index];
    }
}
