import { Db, MongoClient } from "mongodb";

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://kinoton:patata@mongomake.3ta2r.mongodb.net/";

const client = new MongoClient(MONGO_URI);

export const connectMongo = (): Promise<Db> => {
    return client.connect().then(() => {
        console.log("Conectado al Monguito");
        return client.db("ColeccionTebeos");
    }).catch((error) => {
        console.log("Error al conectar con Mongo");
        throw error;
    });
};
