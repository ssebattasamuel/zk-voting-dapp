// import React, { useState } from "react";
// import { ethers } from "ethers";
// import Web3Modal from "web3modal";
// import * as snarkjs from "snarkjs";

// const VOTING_ABI = [
//   {
//     inputs: [
//       {
//         internalType: "address",
//         name: "_verifier",
//         type: "address",
//       },
//     ],
//     stateMutability: "nonpayable",
//     type: "constructor",
//   },
//   {
//     inputs: [
//       {
//         internalType: "address",
//         name: "owner",
//         type: "address",
//       },
//     ],
//     name: "OwnableInvalidOwner",
//     type: "error",
//   },
//   {
//     inputs: [
//       {
//         internalType: "address",
//         name: "account",
//         type: "address",
//       },
//     ],
//     name: "OwnableUnauthorizedAccount",
//     type: "error",
//   },
//   {
//     anonymous: false,
//     inputs: [
//       {
//         indexed: true,
//         internalType: "address",
//         name: "previousOwner",
//         type: "address",
//       },
//       {
//         indexed: true,
//         internalType: "address",
//         name: "newOwner",
//         type: "address",
//       },
//     ],
//     name: "OwnershipTransferred",
//     type: "event",
//   },
//   {
//     inputs: [
//       {
//         internalType: "uint256",
//         name: "proposalId",
//         type: "uint256",
//       },
//     ],
//     name: "getProposalVotes",
//     outputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "owner",
//     outputs: [
//       {
//         internalType: "address",
//         name: "",
//         type: "address",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     name: "proposals",
//     outputs: [
//       {
//         internalType: "uint256",
//         name: "",
//         type: "uint256",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "renounceOwnership",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         internalType: "uint256",
//         name: "proposalId",
//         type: "uint256",
//       },
//       {
//         internalType: "uint256[2]",
//         name: "a",
//         type: "uint256[2]",
//       },
//       {
//         internalType: "uint256[2][2]",
//         name: "b",
//         type: "uint256[2][2]",
//       },
//       {
//         internalType: "uint256[2]",
//         name: "c",
//         type: "uint256[2]",
//       },
//       {
//         internalType: "uint256[2]",
//         name: "input",
//         type: "uint256[2]",
//       },
//       {
//         internalType: "bytes32",
//         name: "nullifier",
//         type: "bytes32",
//       },
//     ],
//     name: "submitVote",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         internalType: "address",
//         name: "newOwner",
//         type: "address",
//       },
//     ],
//     name: "transferOwnership",
//     outputs: [],
//     stateMutability: "nonpayable",
//     type: "function",
//   },
//   {
//     inputs: [
//       {
//         internalType: "bytes32",
//         name: "",
//         type: "bytes32",
//       },
//     ],
//     name: "usedNullifiers",
//     outputs: [
//       {
//         internalType: "bool",
//         name: "",
//         type: "bool",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
//   {
//     inputs: [],
//     name: "verifier",
//     outputs: [
//       {
//         internalType: "contract Groth16Verifier",
//         name: "",
//         type: "address",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
// ];
// const VOTING_ADDRESS = "0x571065A0D3E89791602eC65d513DdA713d445b72";

// function App() {
//   const [account, setAccount] = useState(null);
//   const [votes, setVotes] = useState(0);

//   async function connectWallet() {
//     const web3Modal = new Web3Modal();
//     const instance = await web3Modal.connect();
//     const provider = new ethers.BrowserProvider(instance);
//     const signer = await provider.getSigner();
//     setAccount(await signer.getAddress());
//     return signer;
//   }

//   async function submitVote() {
//     const signer = await connectWallet();

//     // Switch to Holesky network (add this block here)
//     await window.ethereum.request({
//       method: "wallet_switchEthereumChain",
//       params: [{ chainId: "0x4268" }], // Holesky chain ID hex
//     });

//     const contract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);

//     // Generate proof off-chain (unchanged)
//     const { proof, publicSignals } = await snarkjs.groth16.fullProve(
//       { voterSecret: "123456789", eligibilityHash: "987654321", vote: "1" },
//       "/vote.wasm",
//       "/vote_final.zkey"
//     );

//     const calldata = await snarkjs.groth16.exportSolidityCallData(
//       proof,
//       publicSignals
//     );
//     const argv = calldata
//       .replace(/["[\]\s]/g, "")
//       .split(",")
//       .map((x) => BigInt(x));

//     const a = [argv[0], argv[1]];
//     const b = [
//       [argv[2], argv[3]],
//       [argv[4], argv[5]],
//     ];
//     const c = [argv[6], argv[7]];
//     const input = [argv[8], argv[9]]; // Adjust based on your signals

//     // Make nullifier dynamic: hash account + proposalId + secret to make unique
//     const proposalId = 1; // Hardcoded for now; make dynamic if multiple proposals
//     const nullifier = ethers.keccak256(
//       ethers.toUtf8Bytes(account + proposalId.toString() + "secret-salt")
//     ); // Unique per user/proposal

//     // Submit and wait for tx confirmation
//     const tx = await contract.submitVote(proposalId, a, b, c, input, nullifier);
//     console.log("Transaction hash:", tx.hash); // Debug: Check in console
//     await tx.wait(); // Wait for mining
//     console.log("Transaction confirmed!");

//     // Fetch updated votes
//     const newVotes = await contract.getProposalVotes(proposalId);
//     setVotes(newVotes.toString());
//   }
//   return (
//     <div>
//       <h1>ZK Private Voting dApp</h1>
//       <button onClick={submitVote}>Connect & Submit Vote</button>
//       <p>Current Votes for Proposal 1: {votes}</p>
//       <p>Account: {account || "Not connected"}</p>
//     </div>
//   );
// }

// export default App;
