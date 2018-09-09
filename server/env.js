const i_path = require('path');

const base = __dirname;

const env = {
   base: base,
   debug: !!process.env.MAPLESTORY_DEBUG,
   auth_internal: false,
   ldap_server: process.env.MAPLESTORY_LDAP_SERVER,
   keyval: {
      // store key value into file;
      // if null, only in memory
      filename: process.env.MAPLESTORY_KEYVAL_FILENAME || null
   },
   admins: process.env.MAPLESTORY_ADMINS?process.env.MAPLESTORY_ADMINS.split(','):[]
};

module.exports = env;