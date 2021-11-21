import { query as q } from 'faunadb';
import { faunaClient } from '../../lib/fauna';
import { MAX_SIZE } from "../../util";

async function createNewCollection(all_index_name, unique_index_name, contract) {
  let collection_name = contract.toLowerCase();
  console.log("creating a new BoardAssets for collection: " + collection_name);

  faunaClient.query(
    q.CreateCollection({ name: collection_name })
  ).then((response) => {
    faunaClient.query(
      q.CreateIndex({
        name: all_index_name,
        source: q.Collection(collection_name),
        values: [{field: ["data", "token_id"]},
                 {field: ["data", "image_uri"]},
                 {field: ["data", "contract_token_id"]},
                 {field: ["data", "token_owner"]}]
      })
    ).then((ret) => console.log(ret))
    .catch((err) => console.error('CreateAllIndex Error: %s', err))
    faunaClient.query(
      q.CreateIndex({
        name: unique_index_name,
        source: q.Collection(collection_name),
        terms: [{field: ["data", "token_id"]}],
        unique: true
      })
    ).then((ret) => console.log(ret))
    .catch((err) => console.error('CreateUniqueIndex Error: %s', err))
  }).catch((err) => console.error('CreateCollection Error: %s', err));
}

export default async (req, res) => {
  console.log("getBoardAssets: " + JSON.stringify(req.method, null, 2))
  if (faunaClient && req.method == 'GET') {

    let all_index_name = 'all_coordinates';
    let unique_index_name = 'unique_token_id';
    if (req.query.contract) {
      all_index_name = all_index_name + "_" + req.query.contract.toLowerCase();
      unique_index_name = unique_index_name + "_" + req.query.contract.toLowerCase();
      console.log("setting index name: " + all_index_name);
    }

    console.log("getting BoardAssets...")

    let query = await faunaClient.query(
      q.Paginate(q.Match(q.Index(all_index_name)), { size: MAX_SIZE * MAX_SIZE })
    ).catch(error => {
      console.log('getBoardAssets Index Error: %s', JSON.stringify(error, null, 2));

      if ( error.requestResult && error.requestResult.statusCode == 400 ) { //not found
        if (req.query.contract) {
          createNewCollection(all_index_name, unique_index_name, req.query.contract);
        }
      }
    })

    if (query && query.data) {
      console.log("getBoardAssets result length: " + query.data.length)
      res.status(200).json({ coordinates: query.data });
    } else {
      res.status(500).json({ coordinates: [] });
    }
  } else {
    res.status(200).json({ coordinates: [] });
  }
};
