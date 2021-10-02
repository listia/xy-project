import {query as q} from 'faunadb';
import { faunaClient } from '../../lib/fauna';

export default async (req, res) => {
  console.log("updateCoordinate: " + JSON.stringify(req.body, null, 2));
  if (req.method == 'POST') {
    console.log("updating Coordinate...")
    let query = await faunaClient.query(
      // update OR create a coordinate based on the token_id
      q.Let({
          match: q.Match(q.Index('unique_token_id'), req.body.token_id),
          data: { token_id: req.body.token_id, owner: req.body.owner }
        },
        q.If(
          q.Exists(q.Var('match')),
          q.Update(q.Select(['ref'], q.Get(q.Var('match'))), { data: q.Var('data') }),
          q.Create(q.Collection('coordinates'), { data: q.Var('data') })
        )
      )
    );
    console.log("updateCoordinate result: " + JSON.stringify(query.data, null, 2))
    res.status(200).json({ data: query });
  }
};
