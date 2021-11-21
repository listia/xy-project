import axios from "axios";

export default async (req, res) => {
  const openseaAssetURL = "https://api.opensea.io/api/v1/assets"

  console.log("getOSAssetsByContract: " + JSON.stringify(req.query, null, 2))

  if (req.method == 'GET' && req.query.contract) {
    console.log("getting Assets from opensea for: " + req.query.contract);
    let assets = [];

    let response = await axios({
      method: 'GET',
      url: openseaAssetURL,
      params: { asset_contract_address: req.query.contract,
                limit: req.query.max_assets,
                offset: req.query.offset },
      headers: {'X-API-KEY': process.env.OPENSEA_API_KEY ? process.env.OPENSEA_API_KEY : ""}
    }).then((response) => {
      console.log("getOSAssetsByContract offset:" + req.query.offset);
      response.data.assets.map((asset) => {
        if (asset.image_thumbnail_url) {
          assets.push({"image_uri": asset.image_thumbnail_url,
                       "token_id": asset.token_id,
                       "address": asset.asset_contract.address,
                       "owner": asset.owner.address})
        }
      });
    }).catch(error => {
      console.log(error);
    })

    if (assets.length > 0) {
      console.log("Received ASSETS for contract: " + req.query.contract);
    }
    else {
      console.log("No ASSETS Found for: " + req.query.contract);
    }
    res.status(200).json({ assets: assets });
  } else {
    res.status(500).json({ error: "Could not GET owner." });
  }
};
