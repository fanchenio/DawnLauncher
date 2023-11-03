import { join, dirname } from "node:path";
import Database from "better-sqlite3-multiple-ciphers";
import { getUserDataPath } from "../main/commons";

let database: Database.Database;
let cacheDatabase: Database.Database;

function getDataSqlite3() {
  let filename = join(getUserDataPath(), "Data.db");
  database ??= new Database(filename, {
    nativeBinding: join(
      process.env.NODE_ENV !== "development" ? dirname(process.execPath) : "",
      import.meta.env.VITE_BETTER_SQLITE3_BINDING
    ),
  });
  return database;
}

function getCacheDataSqlite3() {
  let filename = join(getUserDataPath(), "CacheData.db");
  cacheDatabase ??= new Database(filename, {
    nativeBinding: join(
      process.env.NODE_ENV !== "development" ? dirname(process.execPath) : "",
      import.meta.env.VITE_BETTER_SQLITE3_BINDING
    ),
  });
  return cacheDatabase;
}

function getCustomDataSqlite3(filePath: string) {
  let db = new Database(filePath, {
    nativeBinding: join(
      process.env.NODE_ENV !== "development" ? dirname(process.execPath) : "",
      import.meta.env.VITE_BETTER_SQLITE3_BINDING
    ),
  });
  return db;
}

export { getDataSqlite3, getCacheDataSqlite3, getCustomDataSqlite3 };
