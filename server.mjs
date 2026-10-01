import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('./dist/',import.meta.url)).replace(/[\\\/]$/,'');
export const server=http.createServer((req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{'Allow':'GET, HEAD'});res.end();return;}
  let name;
  try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400);res.end('Invalid URL');return;}
  if(name==='/')name='/index.html';
  const file=path.resolve(root,'.'+name);
  if(!file.startsWith(root+path.sep)){res.writeHead(403);res.end();return;}
  fs.readFile(file,(err,data)=>{
    if(err){res.writeHead(404);res.end('Not found');return;}
    res.writeHead(200,{'Content-Type':{'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml'}[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});
    res.end(req.method==='HEAD'?undefined:data);
  });
});
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))server.listen(4173,'127.0.0.1',()=>console.log('Local: http://127.0.0.1:4173'));
