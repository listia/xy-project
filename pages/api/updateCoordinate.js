import {query as q} from 'faunadb';
import { faunaClient } from '../../lib/fauna';

export default async (req, res) => {
  console.log("updateCoordinate: " + JSON.stringify(req.body, null, 2));
  if (faunaClient && req.method == 'POST') {
    let collection_name = 'coordinates';
    let index_name = 'unique_token_id';
    if (req.body.contract) {
      collection_name = req.body.contract.toLowerCase();
      index_name = index_name + "_" + collection_name;
    }
    console.log("updating Coordinate in Collection: " + collection_name)

    let data = { token_id: req.body.token_id, image_uri: req.body.image_uri, contract_token_id: req.body.contract_token_id, token_owner: req.body.token_owner }
    if (!req.body.contract) {
      data = { token_id: req.body.token_id, owner: req.body.owner, color: req.body.color, image_uri: req.body.image_uri }
    }

    let query = await faunaClient.query(
      // update OR create a coordinate based on the token_id
      q.Let({
          match: q.Match(q.Index(index_name), req.body.token_id),
          data: data
        },
        q.If(
          q.Exists(q.Var('match')),
          q.Update(q.Select(['ref'], q.Get(q.Var('match'))), { data: q.Var('data') }),
          q.Create(q.Collection(collection_name), { data: q.Var('data') })
        )
      )
    );
    console.log("updateCoordinate result: " + JSON.stringify(query.data, null, 2))
    res.status(200).json({ data: query });
  }
  else {
    res.status(500).json({ data: null });
  }
};
