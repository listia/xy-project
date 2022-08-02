import { query as q } from 'faunadb';
import { faunaClient } from '../../lib/fauna';
import Web3 from 'web3';
import { XY_WORLD_SIGNATURE_MSG } from "../../util";

async function updateLoginCode(address, code) {
  console.log("updateLoginCode: " + address + ":" + code);
  let collection_name = 'login_codes';
  let index_name = 'address_by_code';

  let data = { code: code, address: address }

  let query = await faunaClient.query(
    // update OR create a coordinate based on the code
    q.Let({
        match: q.Match(q.Index(index_name), code),
        data: data
      },
      q.If(
        q.Exists(q.Var('match')),
        q.Update(q.Select(['ref'], q.Get(q.Var('match'))), { data: q.Var('data') }),
        q.Create(q.Collection(collection_name), { data: q.Var('data') })
      )
    )
  );
  console.log("updateLoginCode result: " + JSON.stringify(query.data, null, 2))
};

export default async (req, res) => {
  console.log("logging in: " + JSON.stringify(req.body, null, 2))
  if (faunaClient && req.method == 'POST') {
    const { address, signature } = req.body
    
    // Check the signature
    const web3 = new Web3()
    const signatureMatches = address == web3.eth.accounts.recover(XY_WORLD_SIGNATURE_MSG, signature)
    if (!signatureMatches) {
      return res.status(401).json({ error: 'Signature is incorrect' })
    }

    const code = signature.substring(2,12)
    updateLoginCode(address, code)

    res.status(200).json({ code: code })
  }
}
