import { query as q } from 'faunadb';
import { faunaClient } from '../../lib/fauna';
import { MAX_SIZE } from "../../util";

export default async (req, res) => {
  console.log("getBoard: " + JSON.stringify(req.query, null, 2))
  if (faunaClient && req.method == 'GET') {

    let all_index_name = 'all_coordinates';
    let unique_index_name = 'unique_token_id';

    console.log("getting Board...")

    let query = await faunaClient.query(
      q.Paginate(q.Match(q.Index(all_index_name)), { size: MAX_SIZE * MAX_SIZE })
    ).catch(error => {
      console.log('getBoard Index Error: %s', JSON.stringify(error, null, 2));
    })

    if (query && query.data) {
      console.log("getBoard result length: " + query.data.length)
      res.status(200).json({ coordinates: query.data });
    } else {
      res.status(500).json({ coordinates: [] });
    }
  } else {
    res.status(200).json({ coordinates: [] });
  }
};
