const i_auth = require('./auth');
const i_keyval = require('./keyval');
const i_utils = require('./utils');

const i_env = require('./env');

const api = {
   internal: {
      keyval: {
         set: (req, res, options) => {
            let key = options.path[0];
            let val = options.path[1];
            i_keyval.set(key, val);
            res.end('ok');
         },
         get: (req, res, options) => {
            let key_query = options.path[0];
            let r = {};
            i_keyval.keys(key_query).forEach((key) => {
               r[key] = i_keyval.get(key);
            });
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(r));
         },
         save: (req, res, options) => {
            if (!i_keyval.filename) {
               return res.end('not supported');
            }
            i_keyval.save(i_keyval.filename);
            res.end('ok');
         },
         load: (req, res, options) => {
            if (!i_keyval.filename) {
               return res.end('not supported');
            }
            i_keyval.load(i_keyval.filename);
            res.end('ok');
         }
      }, // keyval
      auth: (req, res, options) => {
         i_utils.Web.read_request_json(req).then(
            (json) => {
               i_auth.authenticate(json.username, json.password).then(
                  (ctx) => res.end(ctx.uuid),
                  (ctx) => i_utils.Web.e401(res)
               );
            },
            (error) => i_utils.Web.e400(res)
         );
      } // auth
   }, // internal
   auth: {
      check: (req, res, options) => {
         if (req.method !== 'POST') return i_utils.Web.e405(res);
         i_utils.Web.read_request_json(req).then(
            (json) => {
               if (i_auth.check_login(json.username, json.uuid)) {
                  i_utils.Web.r200(res);
               } else {
                  i_utils.Web.e401(res);
               }
            },
            (error) => i_utils.Web.e400(res)
         );
      },
      login: (req, res, options) => {
         if (req.method !== 'POST') return i_utils.Web.e405(res);
         i_utils.Web.read_request_json(req).then(
            (json) => {
               i_auth.authenticate(json.username, json.password).then(
                  (ctx) => i_utils.Web.rjson(res, { uuid: ctx.uuid }),
                  (ctx) => i_utils.Web.e401(res)
               );
            },
            (error) => i_utils.Web.e400(res)
         );
      },
      logout: (req, res, options) => {
         if (req.method !== 'POST') return i_utils.Web.e405(res);
         i_utils.Web.read_request_json(req).then(
            (json) => {
               i_auth.clear(json.username, json.uuid);
               i_utils.Web.r200(res);
            },
            (error) => i_utils.Web.e400(res)
         );
      }
   } // auth
};

if (!i_env.debug && !i_env.auth_internal) {
   api.internal.keyval.set = i_utils.Web.require_admin_login(api.internal.keyval.set);
   api.internal.keyval.get = i_utils.Web.require_admin_login(api.internal.keyval.get);
   api.internal.keyval.save = i_utils.Web.require_admin_login(api.internal.keyval.save);
   api.internal.keyval.load = i_utils.Web.require_admin_login(api.internal.keyval.load);
   api.internal.auth = i_utils.Web.require_admin_login(api.internal.auth);
   i_env.auth_internal = true;
}

module.exports = api;
