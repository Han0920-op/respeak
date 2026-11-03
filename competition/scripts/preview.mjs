import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, dirname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../dist');
try { await stat(resolve(root,'index.html')); } catch { console.error('请先运行 npm run build'); process.exit(1); }
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.json':'application/json'};
const port=Number(process.env.PORT||4173);
http.createServer(async(req,res)=>{
 try {
 const url=new URL(req.url,'http://localhost');
 const path=resolve(root,'.'+decodeURIComponent(url.pathname==='/'?'/index.html':url.pathname));
 if(!path.startsWith(root+sep)) {res.writeHead(403);res.end();return;}
 const body=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream','X-Content-Type-Options':'nosniff'});res.end(body);
 } catch {res.writeHead(404);res.end('Not found');}
}).listen(port,'0.0.0.0',async()=>{
 console.log(`预览已启动，端口 ${port}。按 Ctrl+C 停止。`);
 if(process.argv.includes('--open')) {
  const {spawn}=await import('node:child_process');
  const target=`http://127.0.0.1:${port}`;
  const command=process.platform==='win32'?'cmd':process.platform==='darwin'?'open':'xdg-open';
  const args=process.platform==='win32'?['/c','start','',target]:[target];
  const child=spawn(command,args,{stdio:'ignore'});
  child.on('error',()=>console.log('无法自动打开浏览器，请手动访问本机预览端口。'));
 }
});
