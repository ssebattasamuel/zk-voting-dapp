pragma circom 2.1.9;

include "../node_modules/circomlib/circuits/poseidon.circom"; // For secure hashing

template VoteProof() {
    signal input voterSecret; // Private: Voter's secret key (e.g., derived from wallet)
    signal input eligibilityHash; // Public: Pre-computed hash proving eligibility (e.g., token holder)
    signal input vote; // Private: Vote value (1 for yes, 0 for no)

    signal output proofHash; // Public: Hashed proof output

    // Hash the secret and vote for the proof
    component hasher = Poseidon(2);
    hasher.inputs[0] <== voterSecret;
    hasher.inputs[1] <== vote;
    proofHash <== hasher.out;

    // Constraint: Vote must be binary (0 or 1)
    vote * (vote - 1) === 0;

    // Constraint: Ensure eligibility (simple check; expand for real use)
    // In production, this could integrate Merkle proofs for token ownership
}

component main {public [eligibilityHash]} = VoteProof();