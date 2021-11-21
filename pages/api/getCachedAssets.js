import { query as q } from 'faunadb';
import { faunaClient } from '../../lib/fauna';
import { MAX_SIZE } from "../../util";

export default async (req, res) => {
  console.log("getCachedAssets: " + JSON.stringify(req.query, null, 2))
  if (faunaClient && req.method == 'GET') {
    let query = await faunaClient.query(
      q.Map(
        q.Paginate(q.Match(q.Index('assets_by_owner'), req.query.owner)),
        q.Lambda(
          "asset",
          q.Get(q.Var("asset"))
        )
      )
    ).catch(error => {
      console.log('getCachedAssets Index Error: %s', JSON.stringify(error, null, 2));
    })

    if (query && query.data) {
      if (query.data[0] && query.data[0].data && query.data[0].data.assets) {
        console.log("getCachedAssets result length: " + query.data[0].data.assets.length)
        if (req.query.contract) {
          let assets = []
          query.data[0].data.assets.map((asset) => {
            if (asset.address.toLowerCase() === req.query.contract.toLowerCase()) {
              assets.push(asset)
            }
          });
          res.status(200).json({ assets: assets });
        }
        else {
          res.status(200).json({ assets: query.data[0].data.assets });
        }
      }
      else {
        console.log("getCachedAssets not found: " + JSON.stringify(query, null, 2))
        res.status(200).json({ assets: [] });
      }
    } else {
      console.log("getCachedAssets error: " + JSON.stringify(query, null, 2))
      res.status(500).json({ assets: [] });
    }
  } else {
    console.log("getCachedAssets not GET request or DB not found")
    res.status(200).json({ assets: [] });
  }
};
