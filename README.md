# ZK-Private Voting dApp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Ethereum](https://img.shields.io/badge/Blockchain-Ethereum-orange.svg)](https://ethereum.org/) [![Zero-Knowledge](https://img.shields.io/badge/Tech-ZK%20Proofs-blue.svg)](https://iden3.io/)

A decentralized, privacy-preserving voting application built on Ethereum using Zero-Knowledge Proofs (ZKPs). Users can cast anonymous votes on proposals while proving eligibility (e.g., token holder) without revealing their identity or vote choice. Deployed on Holesky testnet for real-world testing.

This project demonstrates advanced blockchain concepts like zk-SNARKs for privacy, smart contract verification, and full-stack dApp development. It's designed for DAOs, governance systems, or any secure voting scenario.

## Live Demo

Try the app live: [https://zk-voting-dapp-theta.vercel.app/](https://zk-voting-dapp-theta.vercel.app/)  
(Connect MetaMask on Holesky testnet with test ETH. Note: This is a testnet deployment—use test accounts only.)

## Features

- **Privacy via ZKPs**: Votes are verified on-chain without exposing voter identity or choice (using Groth16 proofs).
- **Eligibility Checks**: Proves voter holds a qualifying asset (e.g., token) via hashed inputs.
- **Anti-Double-Voting**: Nullifiers prevent replay attacks.
- **Multi-Proposal Support**: Tally votes per proposal ID (extendable to full DAO).
- **Wallet Integration**: Connect via MetaMask, supports testnets like Holesky.
- **Responsive UI**: Modern React frontend with loading states, error handling, and Tailwind CSS styling.
- **Testnet Deployed**: Live on Holesky—interact at [your-deployed-link-if-hosted] (or scan contract on Holesky Etherscan).

## Tech Stack

- **Blockchain**: Solidity 0.8.24, Hardhat for development/testing/deployment.
- **ZKPs**: Circom 2.1.9 for circuits, snarkjs for proof generation/verification (Groth16).
- **Frontend**: React 18, ethers.js for contract interaction, Web3Modal for wallet connect.
- **Styling**: Tailwind CSS for responsive, modern UI.
- **Other**: dotenv for secure keys, OpenZeppelin for contract security (Ownable).

## Prerequisites

- Node.js (v18+ or v22 LTS recommended).
- MetaMask wallet with test ETH (from Holesky faucet, e.g., https://holesky-faucet.com).
- Git for cloning the repo.

## Installation & Setup

1. **Clone the Repository**:

   ```
   git clone https://github.com/ssebattasamuel/zk-voting-dapp.git
   cd zk-voting-dapp
   ```

2. **Install Dependencies** (Root Project):

   ```
   npm install
   ```

   - This installs Hardhat, ethers, OpenZeppelin, snarkjs, circomlib, etc.

3. **Frontend Setup** (Navigate to Subfolder):

   ```
   cd frontend
   npm install
   ```

   - Installs React, Tailwind, Web3Modal.

4. **Environment Variables**:

   - Create `.env` in root (add to .gitignore):
     ```
     PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE  # From MetaMask export (test account only!)
     ```
   - For deployment, update `hardhat.config.cjs` with your RPC URL (e.g., Alchemy Holesky).

5. **Compile ZK Circuit** (In Root):

   ```
   cd circuits
   circom vote.circom --r1cs --wasm --sym
   # Download ptau if needed: Invoke-WebRequest -Uri "https://storage.googleapis.com/zkevm/ptau/powersOfTau28_hez_final_12.ptau" -OutFile "powersOfTau28_hez_final_12.ptau"
   snarkjs groth16 setup vote.r1cs powersOfTau28_hez_final_12.ptau vote_0000.zkey
   snarkjs zkey contribute vote_0000.zkey vote_final.zkey --name="Contribution" -v
   snarkjs zkey export verificationkey vote_final.zkey verification_key.json
   snarkjs zkey export solidityverifier vote_final.zkey ../contracts/Verifier.sol
   cd ..
   ```

   - Generates Verifier.sol and keys for proofs.

6. **Compile Contracts**:

   ```
   npx hardhat compile
   ```

7. **Run Tests**:

   ```
   npx hardhat test
   ```

   - All should pass (10 tests: Lock sample + Voting proof).

8. **Start Local Development**:
   - Terminal 1 (Root): `npx hardhat node` (starts local blockchain).
   - Terminal 2 (Frontend): `cd frontend && npm start` (opens http://localhost:3000).

## Usage

1. **Local Testing**:

   - Deploy locally: `npx hardhat run scripts/deploy.js --network localhost`.
   - Update `frontend/src/App.js` VOTING_ADDRESS with deployed address.
   - In browser: Connect MetaMask (add local network: RPC http://127.0.0.1:8545, Chain ID 31337).
   - Click "Connect Wallet" > "Submit Private Vote"—generates ZK proof, submits tx, updates tally to 1.

2. **Testnet Interaction** (Holesky):

   - Deploy: `npx hardhat run scripts/deploy.js --network holesky`.
   - Update App.js with Holesky address.
   - Switch MetaMask to Holesky (RPC from Alchemy, Chain ID 17000).
   - Vote: Tally increments on-chain (view on https://holesky.etherscan.io).

3. **Key Interactions**:
   - **Connect Wallet**: Prompts MetaMask; shows truncated address.
   - **Submit Vote**: Generates off-chain ZK proof (proves eligibility/vote=1), submits to contract. Nullifier ensures uniqueness.
   - **View Votes**: Queries on-chain tally for Proposal 1 (extends to multiple via ID).

**Screenshots**:

- [Local UI Demo](link-to-screenshot-or-video-if-hosted): Card with connect button, vote spinner, tally update.
- [Tx on Holesky](https://holesky.etherscan.io/address/YOUR_VOTING_CONTRACT): Verified contract with events.

## Deployment

- **Local**: Use Hardhat node (as above).
- **Testnet (Holesky)**: Configured in hardhat.config.cjs (Alchemy RPC, .env key). Run deploy script.
- **Verification**: `npx hardhat verify --network holesky YOUR_ADDRESS "CONSTRUCTOR_ARGS"`.
- **Frontend Hosting**: Deploy to Vercel/Netlify: `npm run build` > Upload `build` folder. Update VOTING_ADDRESS for prod.

## Project Structure

```
zk-voting-dapp/
├── circuits/          # ZK circuit (vote.circom, keys, proofs)
├── contracts/         # Solidity (Voting.sol, Verifier.sol)
├── scripts/           # Deploy script (deploy.js)
├── test/              # Tests (Voting.test.cjs)
├── frontend/          # React app (src/App.js with UI, public/wasm files)
├── hardhat.config.cjs # Config (networks, solidity)
├── .env               # Secrets (gitignore'd)
└── README.md          # This file
```

## Contributing

1. Fork the repo.
2. Create branch: `git checkout -b feature/zk-improvement`.
3. Commit changes: `git commit -m "Add ZK feature"`.
4. Push: `git push origin feature/zk-improvement`.
5. Open PR—I'll review!

Issues/PRs welcome for extensions (e.g., multi-proposal UI, zk-Rollup integration).

## License

MIT License—feel free to use/fork for your projects or portfolio. See [LICENSE](LICENSE) for details.

## Acknowledgments

- Inspired by Ethereum.org ZK docs and iden3 Circom tutorials.
- Thanks to Hardhat, snarkjs, and Tailwind communities.

---

_This dApp is for educational purposes. For production, audit contracts and use mainnet with real assets. Questions? Open an issue! 🚀_
