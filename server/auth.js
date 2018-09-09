const i_ldap = require('ldapjs');
const i_uuid = require('uuid');
const i_keyval = require('./keyval');
const i_env = require('./env');

const api = {
   authenticate: (username, password) => {
      return new Promise((resolve, reject) => {
         return resolve(keyval_setauth(username));
         let client = i_ldap.createClient({
            url: i_env.ldap_server
         });
         client.bind(username, password, (error) => {
            client.unbind();
            if (error) {
               reject({username, error});
            } else {
               resolve(keyval_setauth(username));
            }
         });
      });
   },
   check_login: (username, uuid) => {
      let meta = i_keyval.get(keyval_authkey(username, uuid));
      if (!meta) return null;
      return meta;
   },
   clear: (username, uuid) => {
      return i_keyval.set(keyval_authkey(username, uuid));
   }
};

function keyval_authkey(username, uuid) {
   return `auth.${username}.${uuid}`;
}

function keyval_setauth(username) {
   let keys = i_keyval.keys(`auth.${username}.*`);
   keys.forEach((key) => {
      i_keyval.set(key, null);
   });
   let meta = {
      login: new Date().getTime()
   };
   let uuid = i_uuid.v4();
   i_keyval.set(keyval_authkey(username, uuid), meta);
   return {username, uuid};
}

module.exports = api;
