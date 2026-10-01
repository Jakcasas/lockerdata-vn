import assert from 'node:assert/strict';
import http from 'node:http';
import {server} from '../server.mjs';
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const port=server.address().port;
const request=(path,method='GET')=>new Promise((resolve,reject)=>{const req=http.request({host:'127.0.0.1',port,path,method},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body}));});req.on('error',reject);req.end();});
try{
  const main=await request('/');assert.equal(main.status,200);assert(main.body.includes('market-model.js'));
  assert.equal((await request('/%ZZ')).status,400);
  assert.equal((await request('/%2e%2e%5cpackage.json')).status,403);
  assert.equal((await request('/missing.js')).status,404);
  assert.equal((await request('/','POST')).status,405);
  assert.equal((await request('/','HEAD')).body,'');
  assert.equal((await request('/event-engine.js')).headers['x-content-type-options'],'nosniff');
  assert.equal((await request('/')).status,200);
  console.log('PASS: static files; HEAD; malformed URL; traversal; 404/405; server remains healthy.');
}finally{server.close();}
