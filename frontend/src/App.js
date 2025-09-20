import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import * as snarkjs from "snarkjs";

const VOTING_ABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_verifier",
        type: "address",
      },
    ],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "owner",
        type: "address",
      },
    ],
    name: "OwnableInvalidOwner",
    type: "error",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "OwnableUnauthorizedAccount",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
    ],
    name: "getProposalVotes",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "proposals",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "proposalId",
        type: "uint256",
      },
      {
        internalType: "uint256[2]",
        name: "a",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2][2]",
        name: "b",
        type: "uint256[2][2]",
      },
      {
        internalType: "uint256[2]",
        name: "c",
        type: "uint256[2]",
      },
      {
        internalType: "uint256[2]",
        name: "input",
        type: "uint256[2]",
      },
      {
        internalType: "bytes32",
        name: "nullifier",
        type: "bytes32",
      },
    ],
    name: "submitVote",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    name: "usedNullifiers",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "verifier",
    outputs: [
      {
        internalType: "contract Groth16Verifier",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
const VOTING_ADDRESS = "0xe5D7667dADe082a6Ed392ae951Ec9D17905C6397";

function App() {
  const [account, setAccount] = useState(null);
  const [votes, setVotes] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchInitialVotes() {
      if (account) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            VOTING_ADDRESS,
            VOTING_ABI,
            signer
          );
          const proposalId = 1;
          const initialVotes = await contract.getProposalVotes(proposalId);
          setVotes(initialVotes.toString());
        } catch (err) {
          console.error("Failed to fetch initial votes:", err);
        }
      }
    }
    fetchInitialVotes();
  }, [account]);

  async function connectWallet() {
    if (!account) {
      const web3Modal = new Web3Modal();
      const instance = await web3Modal.connect();
      const provider = new ethers.BrowserProvider(instance);
      const signer = await provider.getSigner();
      setAccount(await signer.getAddress());
      setError("");
      return signer;
    } else {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      return signer;
    }
  }

  async function submitVote() {
    setLoading(true);
    setError("");
    try {
      const signer = await connectWallet();

      // Switch to Holesky network
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x4268" }], // Holesky chain ID hex
      });

      const contract = new ethers.Contract(VOTING_ADDRESS, VOTING_ABI, signer);

      // Generate proof off-chain
      const { proof, publicSignals } = await snarkjs.groth16.fullProve(
        { voterSecret: "123456789", eligibilityHash: "987654321", vote: "1" },
        "/vote.wasm",
        "/vote_final.zkey"
      );

      const calldata = await snarkjs.groth16.exportSolidityCallData(
        proof,
        publicSignals
      );
      const argv = calldata
        .replace(/["[\]\s]/g, "")
        .split(",")
        .map((x) => BigInt(x));

      const a = [argv[0], argv[1]];
      const b = [
        [argv[2], argv[3]],
        [argv[4], argv[5]],
      ];
      const c = [argv[6], argv[7]];
      const input = [argv[8], argv[9]];

      // Dynamic nullifier
      const proposalId = 1;
      const nullifier = ethers.keccak256(
        ethers.toUtf8Bytes(account + proposalId.toString() + "secret-salt")
      );

      // Submit tx
      const tx = await contract.submitVote(
        proposalId,
        a,
        b,
        c,
        input,
        nullifier
      );
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("Transaction confirmed!");

      // Update UI
      const newVotes = await contract.getProposalVotes(proposalId);
      setVotes(newVotes.toString());
    } catch (err) {
      console.error(err);
      setError(err.message || "Transaction failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 max-w-md w-full border border-white/20">
        <h1 className="text-3xl font-bold text-center text-white mb-6">
          ZK Private Voting
        </h1>

        <div className="space-y-4">
          <button
            onClick={connectWallet}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300"
          >
            {account
              ? `Connected: ${account.slice(0, 6)}...${account.slice(-4)}`
              : "Connect Wallet"}
          </button>

          <button
            onClick={submitVote}
            disabled={!account || loading}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition duration-300 ${
              !account || loading
                ? "bg-gray-500 cursor-not-allowed text-gray-300"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Generating Proof & Voting...
              </div>
            ) : (
              "Submit Private Vote"
            )}
          </button>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg text-sm">
              Error: {error}
            </div>
          )}

          <div className="text-center space-y-2">
            <p className="text-lg font-semibold text-white">
              Votes for Proposal 1:{" "}
              <span className="text-green-400">{votes}</span>
            </p>
            <p className="text-sm text-gray-300">
              Proposal ID: 1 | Network: Holesky
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
