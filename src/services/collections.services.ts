import { Collection, Db } from "mongodb";
import mongoDB from "./mongoDB.services";
import User from "~/models/user.schema";

const collectionName = {
  users: 'users',
} as const

class CollectionManager {
  private static db: Db = mongoDB.Db;

  private static getCollection<T>(name: typeof collectionName[keyof typeof collectionName]) {
    //@ts-ignore
    return this.db.collection<T>(name);
  }

  static get users() {
    return this.getCollection<User>(collectionName.users)
  }

}

const collections = CollectionManager

export default collections
