// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Verifier.sol"; 

contract PrivateVoting is Ownable {
    Groth16Verifier public verifier; 
    mapping(uint256 => uint256) public proposals; 
    mapping(bytes32 => bool) public usedNullifiers;

    constructor(address _verifier) Ownable(msg.sender) {
        verifier = Groth16Verifier(_verifier);
    }

    function submitVote(
        uint256 proposalId,
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[2] memory input, // Public inputs (e.g., eligibilityHash)
        bytes32 nullifier // Hashed unique identifier to prevent replays
    ) external {
        require(!usedNullifiers[nullifier], "Vote already submitted");
        require(verifier.verifyProof(a, b, c, input), "Invalid proof");

        // Assume proof includes vote=1 for simplicity; extend for yes/no
        proposals[proposalId] += 1;
        usedNullifiers[nullifier] = true;
    }

    function getProposalVotes(uint256 proposalId) external view returns (uint256) {
        return proposals[proposalId];
    }
}