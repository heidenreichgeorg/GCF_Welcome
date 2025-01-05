const debugAUTH=1;

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
  console.log("0002 SESSION.ts argv="+process.argv+"  jConfig="+JSON.stringify(jConfig));

  if(req && req.query && req.socket) {       
      
      const { partner, client, year, auth } = req.query;
      const query:JSON = <JSON><unknown> { "partner":partner, "client":client, "year":year, "auth":auth  };
      console.log("0004 SESSION.ts handler "+JSON.stringify(query)+" jConfig="+JSON.stringify(jConfig));
    
      // NO sign-in login authenticat
      if(auth==currentHash(""+client+(""+partner),year))
        signIn(jConfig,query,req.socket.remoteAddress,res,startSessionJSON); 
      else  {

        if(debugAUTH) console.log("0005 no match "+JSON.stringify(query));

        res.json({ id: '0666', code : "NO VALID AUTH"})
      }
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


