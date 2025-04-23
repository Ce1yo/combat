const { JsonDB } = require('node-json-db');
const { Config } = require('node-json-db/dist/lib/JsonDBConfig');

let db;

exports.getDB = async () => {
  if (!db) {
    db = new JsonDB(new Config("db", true, true, '/'));
    try {
      await db.load();
    } catch (error) {
      await db.save();
    }
  }
  return db;
};
