// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'



import  { currentHash, init, signIn, startSessionJSON } from '../../modules/session'


let config = null;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  //res.set('Access-Control-Allow-Origin', '*');
  console.log("SESSION.handler "+JSON.stringify(req.query));

  config =  init(/*app,*/ process.argv); // GH20221003 do that per module

  if(req && req.query && req.socket) {       
      
      const { client, year, auth } = req.query;
      const query:JSON = <JSON><unknown> { "client":client, "year":year, "auth":auth  };
      console.log("    SESSION.handler "+JSON.stringify(query));
    
      if(auth==currentHash())
        signIn(config,query,req.socket.remoteAddress,res,startSessionJSON); 
      else  res.json({ id: '0666', code : "NO VALID AUTH"})
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


