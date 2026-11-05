import express from "express";
import tebeosRoutes from "./routes/tebeos.routes.js";
import { connectMongo } from "./config/database.js";
import { configTebeoCollection } from "./controllers/tebeos.controller.js";
import type { Collection } from "mongodb";
import type { TebeoDB } from "./models/tebeos.model.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const startServer = () => {
    connectMongo().then((db) => {
        const tebeosCollection: Collection<TebeoDB> = db.collection("tebeos");
        configTebeoCollection(tebeosCollection);

        app.use("/tebeos", tebeosRoutes);

        app.listen(PORT, () => {
            console.log(`API funcionando en el puerto ${PORT}`);
        });
    }).catch(() => {
        console.log("No se ha podido conectar a Mongo, así que nada de API");
    });
};

startServer();
