import axios from "axios";

export default async (req, res) => {
  const openseaAssetURL = "https://api.opensea.io/api/v1/assets" + (req.query.contract ? "" : "?order_direction=desc&order_by=sale_count")
  console.log("getAssets from opensea: " + JSON.stringify(req.query, null, 2))
  if (req.method == 'GET' && req.query.owner) {
    console.log("getting Assets from opensea...");
    let response = await axios({
      method: 'GET',
      url: openseaAssetURL,
      params: { owner: req.query.owner,
                limit: req.query.limit,
                asset_contract_address: req.query.contract ? req.query.contract : "" },
      headers: {'X-API-KEY': process.env.OPENSEA_API_KEY ? process.env.OPENSEA_API_KEY : ""}
    }).then((response) => {
      console.log("getAssets result: " + JSON.stringify(response.data, null, 2));
      res.status(200).json({ assets: response.data.assets });
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error: error });
    })
  } else {
    res.status(500).json({ error: "Could not GET owner." });
  }
};
