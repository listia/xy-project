import { query as q } from 'faunadb';
import axios from "axios";
import { faunaClient } from '../../lib/fauna';

async function addOrUpdateAssets(owner, assets) {
  console.log("addOrUpdateAssets: " + owner);
  if (faunaClient) {
    let data = { owner: owner, assets: assets }

    let query = await faunaClient.query(
      // update OR create a new row based on the owner
      q.Let({
          match: q.Match(q.Index('assets_by_owner'), owner),
          data: data
        },
        q.If(
          q.Exists(q.Var('match')),
          q.Update(q.Select(['ref'], q.Get(q.Var('match'))), { data: q.Var('data') }),
          q.Create(q.Collection('assets'), { data: q.Var('data') })
        )
      )
    );
    console.log("addOrUpdateAssets result: " + JSON.stringify(query.data, null, 2))
  }
}

export default async (req, res) => {
  const MAX_ASSETS = 50;
  const openseaAssetURL = "https://api.opensea.io/api/v1/assets"

  console.log("updateAssets: " + JSON.stringify(req.body, null, 2))

  if (req.method == 'POST' && req.body.owner) {
    console.log("getting Assets from opensea...");
    let flag = true;
    let offset = 0;
    let assets = [];
    while (flag) {
      let response = await axios({
        method: 'GET',
        url: openseaAssetURL,
        params: { owner: req.body.owner,
                  limit: MAX_ASSETS,
                  offset: offset },
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
    if (assets.length > 0) {
      console.log("Received ASSETS for " + req.body.owner + ": writing to db");
      addOrUpdateAssets(req.body.owner, assets)
    }
    else {
      console.log("No ASSETS Found for: " + req.body.owner);
    }
    res.status(200).json({ assets: assets });
  } else {
    res.status(500).json({ error: "Could not GET owner." });
  }
};
