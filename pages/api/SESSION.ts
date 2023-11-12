// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'



import  { currentHash, init, signIn, startSessionJSON } from '../../modules/session'


let config = null;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log("SESSION.handler "+JSON.stringify(req.query));

  let bucket = init(process.argv) as String
  let jConfig = { 'bucket':bucket } as any;

  if(req && req.query && req.socket) {       
      
      const { client, year, auth } = req.query;
      const query:JSON = <JSON><unknown> { "client":client, "year":year, "auth":auth  };
      console.log("    SESSION.handler "+JSON.stringify(query));
    
      // NO sign-in login authenticat
      //if(auth==currentHash())
        signIn(jConfig,query,req.socket.remoteAddress,res,startSessionJSON); 
      //else  res.json({ id: '0666', code : "NO VALID AUTH"})
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


