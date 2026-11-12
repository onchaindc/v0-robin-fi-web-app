// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RobinFiVault
 * @notice A single-asset (ETH) index vault with ERC-4626 style accounting and a
 *         tokenized-stock basket definition. Shares are a transferable ERC-20,
 *         so positions are composable with the rest of DeFi.
 *
 *         Deposits are denominated in ETH. The basket (stock token addresses and
 *         target weights in basis points) is stored on-chain so any frontend,
 *         indexer or future execution adapter can read the strategy and mirror it.
 */
contract RobinFiVault {
    // --- ERC-20 metadata -----------------------------------------------------
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    // --- Vault metadata ------------------------------------------------------
    address public immutable factory;
    address public immutable creator;
    string public description;
    uint64 public immutable createdAt;

    address[] private _basketTokens;
    uint256[] private _basketWeightsBps;

    uint256 public constant BPS_DENOMINATOR = 10_000;

    // --- ERC-20 state --------------------------------------------------------
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // --- Events --------------------------------------------------------------
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Deposit(address indexed caller, address indexed owner, uint256 assets, uint256 shares);
    event Withdraw(
        address indexed caller,
        address indexed receiver,
        address indexed owner,
        uint256 assets,
        uint256 shares
    );
    event Rebalanced(address indexed caller, address[] tokens, uint256[] weightsBps);

    // --- Errors --------------------------------------------------------------
    error ZeroAmount();
    error ZeroAddress();
    error InsufficientBalance();
    error InsufficientAllowance();
    error InsufficientLiquidity();
    error NotManager();
    error InvalidBasket();
    error Reentrancy();

    uint256 private _locked = 1;
    modifier nonReentrant() {
        if (_locked != 1) revert Reentrancy();
        _locked = 2;
        _;
        _locked = 1;
    }

    modifier onlyManager() {
        if (msg.sender != creator && msg.sender != factory) revert NotManager();
        _;
    }

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _description,
        address _creator,
        address[] memory tokens_,
        uint256[] memory weightsBps_
    ) {
        if (_creator == address(0)) revert ZeroAddress();
        if (tokens_.length == 0 || tokens_.length != weightsBps_.length) revert InvalidBasket();

        name = _name;
        symbol = _symbol;
        description = _description;
        factory = msg.sender;
        creator = _creator;
        createdAt = uint64(block.timestamp);

        uint256 total;
        for (uint256 i = 0; i < weightsBps_.length; i++) {
            if (tokens_[i] == address(0)) revert ZeroAddress();
            if (weightsBps_[i] == 0) revert InvalidBasket();
            total += weightsBps_[i];
        }
        if (total != BPS_DENOMINATOR) revert InvalidBasket();

        _basketTokens = tokens_;
        _basketWeightsBps = weightsBps_;
    }

    receive() external payable {}

    // --- ERC-20 --------------------------------------------------------------

    function totalSupply() public view returns (uint256) {
        return _totalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        return _balances[account];
    }

    function allowance(address owner, address spender) public view returns (uint256) {
        return _allowances[owner][spender];
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        _allowances[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = _allowances[from][msg.sender];
        if (allowed != type(uint256).max) {
            if (allowed < value) revert InsufficientAllowance();
            _allowances[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) private {
        if (to == address(0)) revert ZeroAddress();
        uint256 balance = _balances[from];
        if (balance < value) revert InsufficientBalance();
        unchecked {
            _balances[from] = balance - value;
            _balances[to] += value;
        }
        emit Transfer(from, to, value);
    }

    // --- ERC-4626 style accounting ------------------------------------------

    /// @notice ETH held by the vault, i.e. total assets under management.
    function totalAssets() public view returns (uint256) {
        return address(this).balance;
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 supply = _totalSupply;
        uint256 managed = totalAssets();
        if (supply == 0 || managed == 0) return assets;
        return (assets * supply) / managed;
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 supply = _totalSupply;
        if (supply == 0) return shares;
        return (shares * totalAssets()) / supply;
    }

    function previewDeposit(uint256 assets) external view returns (uint256) {
        return convertToShares(assets);
    }

    function previewRedeem(uint256 shares) external view returns (uint256) {
        return convertToAssets(shares);
    }

    function maxDeposit(address) public pure returns (uint256) {
        return type(uint256).max;
    }

    function maxRedeem(address owner) public view returns (uint256) {
        return _balances[owner];
    }

    /**
     * @notice Deposit ETH and receive vault shares.
     * @dev First deposit is 1:1; later deposits mint pro-rata to current NAV.
     */
    function deposit(uint256 assets, address receiver) external payable nonReentrant returns (uint256 shares) {
        if (assets == 0) revert ZeroAmount();
        if (msg.value != assets) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();

        uint256 supply = _totalSupply;
        uint256 managed = totalAssets() - assets;

        shares = (supply == 0 || managed == 0) ? assets : (assets * supply) / managed;
        if (shares == 0) revert ZeroAmount();

        _totalSupply = supply + shares;
        _balances[receiver] += shares;

        emit Transfer(address(0), receiver, shares);
        emit Deposit(msg.sender, receiver, assets, shares);
    }

    /**
     * @notice Burn shares and receive the proportional share of the vault's ETH.
     */
    function redeem(
        uint256 shares,
        address receiver,
        address owner
    ) external nonReentrant returns (uint256 assets) {
        if (shares == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();
        if (_balances[owner] < shares) revert InsufficientBalance();

        if (msg.sender != owner) {
            uint256 allowed = _allowances[owner][msg.sender];
            if (allowed != type(uint256).max) {
                if (allowed < shares) revert InsufficientAllowance();
                _allowances[owner][msg.sender] = allowed - shares;
            }
        }

        uint256 supply = _totalSupply;
        assets = (shares * totalAssets()) / supply;
        if (assets == 0) revert ZeroAmount();
        if (address(this).balance < assets) revert InsufficientLiquidity();

        unchecked {
            _balances[owner] -= shares;
            _totalSupply = supply - shares;
        }

        emit Transfer(owner, address(0), shares);
        emit Withdraw(msg.sender, receiver, owner, assets, shares);

        (bool ok, ) = payable(receiver).call{ value: assets }("");
        if (!ok) revert InsufficientLiquidity();
    }

    /// @notice Same as redeem, but denominated in assets.
    function withdraw(
        uint256 assets,
        address receiver,
        address owner
    ) external nonReentrant returns (uint256 shares) {
        if (assets == 0) revert ZeroAmount();
        if (receiver == address(0)) revert ZeroAddress();

        uint256 managed = totalAssets();
        shares = managed == 0 ? assets : (assets * _totalSupply) / managed;
        if (shares == 0) revert ZeroAmount();
        if (_balances[owner] < shares) revert InsufficientBalance();

        if (msg.sender != owner) {
            uint256 allowed = _allowances[owner][msg.sender];
            if (allowed != type(uint256).max) {
                if (allowed < shares) revert InsufficientAllowance();
                _allowances[owner][msg.sender] = allowed - shares;
            }
        }

        unchecked {
            _balances[owner] -= shares;
            _totalSupply -= shares;
        }

        emit Transfer(owner, address(0), shares);
        emit Withdraw(msg.sender, receiver, owner, assets, shares);

        (bool ok, ) = payable(receiver).call{ value: assets }("");
        if (!ok) revert InsufficientLiquidity();
    }

    // --- Strategy ------------------------------------------------------------

    function basket() external view returns (address[] memory tokens, uint256[] memory weightsBps) {
        return (_basketTokens, _basketWeightsBps);
    }

    function basketSize() external view returns (uint256) {
        return _basketTokens.length;
    }

    /**
     * @notice Update the basket's target weights. Only the vault creator (or the
     *         factory, as a governance path) can call this.
     * @dev Weights are in basis points and must sum to 10_000.
     */
    function rebalance(
        address[] calldata tokens_,
        uint256[] calldata weightsBps_
    ) external onlyManager {
        if (tokens_.length == 0 || tokens_.length != weightsBps_.length) revert InvalidBasket();

        uint256 total;
        for (uint256 i = 0; i < weightsBps_.length; i++) {
            if (tokens_[i] == address(0)) revert ZeroAddress();
            if (weightsBps_[i] == 0) revert InvalidBasket();
            total += weightsBps_[i];
        }
        if (total != BPS_DENOMINATOR) revert InvalidBasket();

        _basketTokens = tokens_;
        _basketWeightsBps = weightsBps_;

        emit Rebalanced(msg.sender, tokens_, weightsBps_);
    }
}
