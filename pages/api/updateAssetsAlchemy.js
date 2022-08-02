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
  const alchemyGetNFTsURL = "https://eth-mainnet.alchemyapi.io/v2/" + process.env.ALCHEMY_API_KEY + "/getNFTs"

  console.log("updateAssets ALCHEMY: " + JSON.stringify(req.body, null, 2))

  if (req.method == 'POST' && req.body.owner) {
    console.log("getting Assets from ALCHEMY...");
    let flag = true;
    let pageKey = null;
    let assets = [];
    while (flag) {
      let response = await axios({
        method: 'GET',
        url: alchemyGetNFTsURL,
        params: { owner: req.body.owner,
                  pageKey: pageKey ? pageKey : null }
      }).then((response) => {
        console.log("getAssets pageKey:" + pageKey);
        if (response.data.ownedNfts.length === 0){
            flag = false;
        }
        else {
          response.data.ownedNfts.map((asset) => {
            if (asset.metadata) {
              assets.push({"image_uri": asset.metadata.image,
                           "token_id": asset.id.tokenId,
                           "address": asset.contract.address})
            }
          });
          if(!response.data.pageKey){
            flag = false;
          }
          else {
            pageKey = response.data.pageKey
          }
        }
      }).catch(error => {
        console.log(error);
      })
    }
    if (assets.length > 0) {
      console.log("Received ASSETS for " + req.body.owner + ": writing to db");
      //addOrUpdateAssets(req.body.owner, assets)
      console.log("ASSETS result: " + JSON.stringify(assets, null, 2))
    }
    else {
      console.log("No ASSETS Found for: " + req.body.owner);
    }
    res.status(200).json({ assets: assets });
  } else {
    res.status(500).json({ error: "Could not GET owner." });
  }
};
