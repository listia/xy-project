import { query as q } from 'faunadb';
import axios from "axios";
import { faunaClient } from '../../../lib/fauna';
import { MAX_SIZE } from "../../../util";
import * as rax from 'retry-axios';

// TODO: move this to custom AWS lambda since it runs too long for Vercel

const updateAssetsURL = 'https://xyproject.io/api/updateAssets';

const updateAssets = async (owner) => {
  const interceptorId = rax.attach(); // retry logic for axios
  await axios({
    method: 'POST',
    url: updateAssetsURL,
    data: {
      owner: owner
    },
    raxConfig: {
      retry: 2
    }
  }).then((response) => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  })
};

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

export default async (req, res) => {
  console.log("syncAssets: " + JSON.stringify(req.query, null, 2))

  if (req.method == 'GET') {
    let coordinates = [];
    let updated = [];

    console.log("getting coordinates...")
    let query = await faunaClient.query(
      q.Paginate(q.Match(q.Index('all_coordinates')), { size: MAX_SIZE * MAX_SIZE })
    ).catch(error => {
      console.log('get coordinates Index Error: %s', error.requestResult);
    })
    if (query && query.data) {
      coordinates = query.data
      console.log("getBoard result length: " + query.data.length)
    }
    for (const coordinate of coordinates) {
      console.log("checking: " + coordinate[1])

      if (updated.find(x=>x===coordinate[1])) {
        console.log("already processed, skipping: " + coordinate[1])
        continue;
      }

      let exists = await faunaClient.query(
        q.Paginate(q.Match(q.Index('assets_by_owner'), coordinate[1]))
      ).catch(error => {
        console.log('get assets_by_owner Index Error: %s', error.requestResult);
      })
      if (!exists || !exists.data || exists.data.length == 0) {
        console.log("not found in DB: " + coordinate[1])
        // 0: token_id
        // 1: owner
        // 2: color
        // 3: image_uri
        console.log("syncing: " + coordinate[1])
        await updateAssets(coordinate[1]);
        updated.push(coordinate[1]);
        await sleep(1000);
      }
      else {
        updated.push(coordinate[1]);
        console.log("found in DB, skipping: " + coordinate[1])
      }
    }

    res.status(200).json({ count: updated.length });
  } else {
    res.status(500).json({ error: "Not a GET request." });
  }
};
