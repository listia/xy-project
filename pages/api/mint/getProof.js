let allowlistAddresses=[
  "0xB9675B9eDa541642e325dcd5150Fe82311343F4F",
  "0x54671e76d26cE395406Cb3BF25b71727a8197AfC",
  "0x44B8bc0bDB49b740228aa0BeabeEdBd20459e669",
];

export default async (req, res) => {
  console.log("getProof: " + JSON.stringify(req.query, null, 2))
  if (req.method == 'GET' && req.query.address) {
    const leafNodes = allowlistAddresses.map(addr => keccak256(addr.trim()));
    const merkleTree = new MerkleTree(leafNodes, keccak256, { sortPairs: true });
    const merkleRoot = merkleTree.getHexRoot();
    const ownerProof = merkleTree.getHexProof(keccak256(req.query.address.trim()));

    console.log("leafNodes: " + leafNodes);
    console.log("merkleRoot: " + merkleRoot);
    console.log("ownerProof: " + ownerProof);
    res.status(200).json({ proof: ownerProof });
  } else {
    res.status((500)).json({ proof: "" });
  }
};
