import axios from "axios";

export default async (req, res) => {
  const MAX_ASSETS = 50;
  const openseaAssetURL = "https://api.opensea.io/api/v1/assets" + (req.query.contract ? "" : "?order_direction=desc&order_by=sale_count")
  console.log("getAssets from opensea: " + JSON.stringify(req.query, null, 2))
  if (req.method == 'GET' && req.query.owner) {
    console.log("getting Assets from opensea...");
    let flag = true;
    let offset = 0;
    let assets = [];
    while (flag) {
      let response = await axios({
        method: 'GET',
        url: openseaAssetURL,
        params: { owner: req.query.owner,
                  limit: MAX_ASSETS,
                  offset: offset,
                  asset_contract_address: req.query.contract ? req.query.contract : "" },
        headers: {'X-API-KEY': process.env.OPENSEA_API_KEY ? process.env.OPENSEA_API_KEY : ""}
      }).then((response) => {
        console.log("getAssets offset:" + offset);
        if(response.data.assets.length === 0){
            flag = false;
        }
        else {
          response.data.assets.map((asset) => {
            if (asset.image_thumbnail_url) {
              assets.push({"image_uri": asset.image_thumbnail_url,
                           "token_id": asset.token_id,
                           "address": asset.asset_contract.address})
            }
          });
          if(response.data.assets.length < MAX_ASSETS){
            flag = false;
          }
          else {
            offset += MAX_ASSETS
          }
        }
      }).catch(error => {
        console.log(error);
      })
    }
    res.status(200).json({ assets: assets });
  } else {
    res.status(500).json({ error: "Could not GET owner." });
  }
};
