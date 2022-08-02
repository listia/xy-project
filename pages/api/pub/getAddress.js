import { query as q } from 'faunadb';
import { faunaClient } from '../../../lib/fauna';

export default async (req, res) => {
  console.log("getAddress: " + JSON.stringify(req.query, null, 2))
  if (faunaClient && req.method == 'GET' && req.query.key == process.env.XY_WORLD_API_KEY) {

    let unique_index_name = 'address_by_code';

    let query = await faunaClient.query(
      q.Paginate(q.Match(q.Index(unique_index_name), req.query.code), null)
    ).catch(error => {
      console.log('getAddress Index Error: %s', JSON.stringify(error, null, 2));
    })

    if (query && query.data) {
      console.log("getAddress result: " + JSON.stringify(query.data))
      res.status(200).json({ address: query.data[0] });
    } else {
      res.status(404).json({ address: "" });
    }
  } else {
    res.status((500)).json({ address: "" });
  }
};
