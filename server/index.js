const http = require('http');
const url = require('url');

const i_worker = require('./worker');
const i_ws = require('./websocket');
const i_api = require('./api');

function route(req, res) {
   let r = url.parse(req.url);
   let f = router;
   let path = r.pathname.split('/');
   let query = {};
   r.query && r.query.split('&').forEach((one) => {
      let key, val;
      let i = one.indexOf('=');
      if (i < 0) {
         key = one;
         val = '';
      } else {
         key = one.substring(0, i);
         val = one.substring(i+1);
      }
      if (key in query) {
         if(Array.isArray(query[key])) {
            query[key].push(val);
         } else {
            query[key] = [query[key], val];
         }
      } else {
         query[key] = val;
      }
   });
   path.shift();
   while (path.length > 0) {
      let key = path.shift();
      f = f[key];
      if (!f) break;
      if (typeof(f) === 'function') {
         return f(req, res, {
            path: path,
            query: query
         });
      }
   }
   router.code(req, res, 404, 'Not Found');
}

const static_cache = {};
const router = {
   api: i_api,
   test: (req, res, options) => {
      res.end('hello');
   },
   code: (req, res, code, text) => {
      res.writeHead(code || 404, text || '');
      res.end();
   }
};

const server = http.createServer((req, res) => {
   route(req, res);
});

i_worker.cronCleanAuthToken();

i_ws.init(server, '/ws');

const server_port = 20180;
const server_host = '127.0.0.1';

const instance = server.listen(server_port, server_host, () => {
   console.log(`MapleStory is listening at ${server_host}:${server_port}`);
});
