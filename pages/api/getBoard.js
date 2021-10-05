import { query as q } from "faunadb";
import { faunaClient } from "../../lib/fauna";
import { MAX_SIZE } from "../../util";

const getBoard = async (req, res) => {
  console.log("getBoard: " + JSON.stringify(req.method, null, 2));
  if (req.method == "GET") {
    console.log("getting Board...");
    let query = await faunaClient.query(
      q.Paginate(q.Match(q.Index("all_coordinates")), {
        size: MAX_SIZE * MAX_SIZE,
      })
    );
    console.log("getBoard result length: " + query.data.length);
    res.status(200).json({ coordinates: query.data });
  }
};

export default getBoard;
