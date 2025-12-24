# Blockchain Crowdfunding Platform

A decentralized crowdfunding platform built on Ethereum-compatible blockchains, allowing users to create fundraising campaigns, collect contributions in USDC, and ensure funds are released only when goals are met or refunded if campaigns fail. This project uses Hardhat for development and testing, and is configured to deploy on Base Sepolia testnet.

## Overview

This project implements a secure, non-custodial crowdfunding smart contract. Campaigns are created with a funding goal and deadline. Contributors send USDC tokens, and the creator can withdraw funds only if the goal is reached before the deadline. If the goal isn't met, contributors can claim refunds after the deadline.

The contract leverages OpenZeppelin's battle-tested libraries for ERC20 interactions and reentrancy protection.

## Features

- **Campaign Creation**: Anyone can create a campaign by specifying a goal (in USDC), duration, and metadata.
- **Secure Contributions**: Contributors approve and transfer USDC directly to the contract.
- **Goal-Based Withdrawals**: Creators can withdraw raised funds only if the goal is met before the deadline.
- **Automatic Refunds**: Contributors can refund their contributions if the campaign fails (goal not met by deadline).
- **Event Logging**: All key actions emit events for transparency and off-chain tracking.
- **Reentrancy Protection**: Uses OpenZeppelin's `ReentrancyGuard` to prevent attacks.
- **ERC20 Compatibility**: Works with any ERC20 token, but configured for USDC on Base testnet.

## Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js**: Version 16 or higher (recommended: 18.x). Download from [nodejs.org](https://nodejs.org/).
- **npm**: Comes with Node.js, or use Yarn if preferred.
- **Git**: For cloning the repository.
- **A Wallet with Testnet Funds**: For deployment and interaction on Base Sepolia (e.g., MetaMask with some ETH for gas).
- **USDC on Base Sepolia**: Obtain test USDC from the [Circle Faucet](https://faucet.circle.com/) or other sources.

## Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd web3
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```
   This installs Hardhat, OpenZeppelin contracts, and other testing tools.

3. **Verify Installation**:
   ```bash
   npx hardhat --version
   ```
   You should see the Hardhat version.

## Environment Setup

1. **Create Environment File**:
   Copy the example environment file and fill in your details:

   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`**:
   Open `.env` and add the following variables:
   ```
   SEPOLIA_RPC_URL=https://your-sepolia-rpc-url.com  # Optional, for Ethereum Sepolia
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org      # RPC URL for Base Sepolia
   PRIVATE_KEY=your-private-key-without-0x-prefix     # Private key of your wallet
   ```
   - **RPC URLs**: Use free providers like Alchemy, Infura, or the default Base Sepolia URL.
   - **Private Key**: Never commit this to version control. Use a test wallet with minimal funds.
   - **Security Note**: Consider using a hardware wallet or encrypted key management for production.

## Project Structure

```
├── contracts/
│   ├── Crowdfunding.sol    # Main crowdfunding contract
│   └── MockToken.sol       # ERC20 mock for local testing
├── scripts/
│   └── deploy.js           # Deployment script
├── test/
│   └── Crowdfunding.js     # Test suite
├── hardhat.config.js       # Hardhat configuration
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Testing

The project includes a comprehensive test suite using Hardhat and Chai.

1. **Run Local Tests**:

   ```bash
   npm test
   ```
   This runs tests on a forked Base Sepolia network, simulating real USDC interactions.

2. **Test Coverage**:
   - Campaign creation and contribution tracking.
   - Successful withdrawals when goals are met.
   - Refunds for failed campaigns.
   - Error handling (e.g., invalid goals, past deadlines).

3. **Debugging Tests**:
   If tests fail, check gas limits or network issues. Use `npx hardhat test --verbose` for more details.

## Deployment

Deploy the contract to Base Sepolia testnet.

1. **Compile Contracts**:

   ```bash
   npx hardhat compile
   ```

2. **Deploy to Base Sepolia**:

   ```bash
   npx hardhat run scripts/deploy.js --network baseSepolia
   ```
   - This deploys `Crowdfunding` with the USDC address for Base Sepolia.
   - Note the deployed contract address in the console output.

3. **Verify Deployment**:

   Use [Base Sepolia Explorer](https://sepolia.basescan.org/) to verify the contract.

## Usage

### Interacting with the Contract

After deployment, use tools like Hardhat console, Remix, or a frontend to interact:

1. **Create a Campaign**:

   - Call `createCampaign(uint256 goal, uint256 duration, string metadata)`.
   - `goal`: Amount in USDC (e.g., 100 * 10^6 for 100 USDC).
   - `duration`: Seconds until deadline.
   - `metadata`: Description string.

2. **Contribute**:

   - Approve USDC spending: `usdc.approve(crowdfundingAddress, amount)`.
   - Contribute: `contribute(campaignId, amount)`.

3. **Withdraw (Creator)**:

   - After goal is met: `withdraw(campaignId)`.

4. **Refund (Contributor)**:

   - After deadline if goal not met: `refund(campaignId)`.

### Frontend Integration

To build a frontend:
- Use Web3.js or Ethers.js to connect to Base Sepolia.
- Listen for events like `CampaignCreated`, `ContributionReceived`, etc.
- Example: Integrate with MetaMask for wallet connections.

## Contract Details

- **USDC Address on Base Sepolia**: `0x036CbD53842c5426634e7929541eC2318f3dCF7e`
- **Key Functions**:
  - `createCampaign`: Creates a new campaign.
  - `contribute`: Adds funds to a campaign.
  - `withdraw`: Releases funds to creator.
  - `refund`: Returns funds to contributor.
  - `getCampaign`: Retrieves campaign details.
  - `contributionOf`: Checks individual contributions.
- **Events**: `CampaignCreated`, `ContributionReceived`, `Withdrawal`, `Refund`.
- **Errors**: Custom errors for invalid inputs, unauthorized actions, etc.

## Troubleshooting

- **Compilation Errors**: Ensure Solidity version matches (0.8.20).
- **Deployment Fails**: Check RPC URL, private key, and wallet balance.
- **Tests Fail**: Verify forking is enabled; ensure internet for network fork.
- **USDC Issues**: Confirm you have test USDC; use faucets if needed.

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/your-feature`.
3. Make changes, add tests, and ensure `npm test` passes.
4. Submit a pull request.

## License

This project is licensed under the MIT License. See `LICENSE` for details.

## Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts/)
- [Base Documentation](https://docs.base.org/)
- [Circle USDC Docs](https://developers.circle.com/stablecoins/usdc-contract-addresses)

For questions, open an issue or contact the maintainers.
