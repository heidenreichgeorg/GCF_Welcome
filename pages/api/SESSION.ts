// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'


import { currentHash } from '../../modules/login'
import {  init, signIn, startSessionJSON } from '../../modules/serverSession'


let config = null;

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  console.log("SESSION.handler "+JSON.stringify(req.query));

  let jConfig =  init(process.argv) as any; // GH20221003 need to init for each module
  
  if(req && req.query && req.socket) {       
      
      const { client, year, auth } = req.query;
      const query:JSON = <JSON><unknown> { "client":client, "year":year, "auth":auth  };
      console.log("SESSION.ts handler "+JSON.stringify(query)+" jConfig="+JSON.stringify(jConfig));
    
      // NO sign-in login authenticat
      if(auth==currentHash(client,year))
        signIn(jConfig,query,req.socket.remoteAddress,res,startSessionJSON); 
      else  res.json({ id: '0666', code : "NO VALID AUTH"})
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


