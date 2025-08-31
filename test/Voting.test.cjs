const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PrivateVoting", function () {
  let verifier, voting;

  before(async function () {
    const Verifier = await ethers.getContractFactory("Groth16Verifier");
    verifier = await Verifier.deploy();
    await verifier.waitForDeployment();

    const Voting = await ethers.getContractFactory("PrivateVoting");
    voting = await Voting.deploy(await verifier.getAddress());
    await voting.waitForDeployment();
  });

  it("Should deploy and verify a mock proof", async function () {
    // Mock proof data (replace with real from snarkjs in production)
    const a = [
      "0x1f0ba714580d061e806c040418f5aa6a34f63d03c4be06f0ead4d239bb32b814",
      "0x03fd323ac67207b9d01e8504cb78908c2b4baf1716b607587bdd2c6dc012e84d",
    ];
    const b = [
      [
        "0x2324504c852d0fcf89a4f8319949ad702a1fc099b0234e7c01cdd72eefc02859",
        "0x102441f601251d5f96af854e676c9b7faac3d3b2d23a8b88462393dd7ba978f4",
      ],
      [
        "0x02f2ddde4cba872e6d3883be468947040fb0f95babff2fcffe08bc5b1bbc65cd",
        "0x1876fb5e340f554d1535ab720b38aa376e27620a2cb723ed8b0b91b3a887d18d",
      ],
    ];
    const c = [
      "0x03bc583ca5481f50fcbc0687123f17ab7323dc69d62836e3e54ab97dccd44139",
      "0x252b83f98cd753b972b63c878dd973791f819ac94d6a0491ff4490c5650ddb38",
    ];
    const input = [
      "0x15ff5f37f52326d1cea0983b154fecf00c2344e850a4620f5cdc58eb804e606c",
      "0x000000000000000000000000000000000000000000000000000000003ade68b1",
    ]; // Mock public inputs
    const nullifier = ethers.keccak256(ethers.toUtf8Bytes("mock-nullifier"));

    // Submit vote (will fail if verifier not set, but mock passes)
    await voting.submitVote(1, a, b, c, input, nullifier);
    expect(await voting.getProposalVotes(1)).to.equal(1);
  });
});
