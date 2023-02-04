// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'


import  { signIn, startSessionJSON } from './server'


export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  //res.set('Access-Control-Allow-Origin', '*');
  console.log("SESSION.handler "+JSON.stringify(req.query));

  if(req && req.query && req.socket) {       
      
      const { client, year } = req.query;
      const query:JSON = <JSON><unknown> { "ext":"JSON", "client":client, "year":year  };
      console.log("    SESSION.handler "+JSON.stringify(query));
    
      signIn(query,req.socket.remoteAddress,res,startSessionJSON); 
  }
  else res.json({ id: '0123', code : "NO VALID QUERY"})
}


