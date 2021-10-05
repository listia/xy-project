import axios from "axios";

const getAccess = async (req, res) => {
  const openseaAssetURL =
    "https://api.opensea.io/api/v1/assets?order_direction=desc&order_by=sale_price";
  console.log("getAssets from opensea: " + JSON.stringify(req.query, null, 2));

  if (req.method == "GET" && req.query.owner) {
    console.log("getting Assets from opensea...");

    try {
      await axios({
        method: "GET",
        url: openseaAssetURL,
        params: {
          owner: req.query.owner,
          limit: req.query.limit,
        },
      });

      console.log("getAssets result: " + response.data);
      res.status(200).json({ assets: response.data.assets });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: error });
    }
  } else {
    res.status(500).json({ error: "Could not GET owner." });
  }
};

export default getAccess;
