import type { Request, Response } from "express";
import { ObjectId, type Collection } from "mongodb";
import type { Tebeo, TebeoDB, ErrorAPI } from "../models/tebeos.model.js";

let tebeosCollection: Collection<TebeoDB>;

export const configTebeoCollection = (collection: Collection<TebeoDB>) => {
    tebeosCollection = collection;
};

const isValidDate = (dateStr: string): boolean => {
    if (typeof dateStr !== "string") return false;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const parts = dateStr.split("-").map(Number);
    const year = parts[0];
    const month = parts[1];
    const day = parts[2];
    if (year === undefined || month === undefined || day === undefined) return false;
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year &&
           date.getMonth() === month - 1 &&
           date.getDate() === day;
};

const validarDatosTebeo = (data: any): string | null => {
    if (!data || typeof data !== "object") {
        return "El cuerpo de la petición debe ser un objeto JSON";
    }

    const { titulo, autor, editorial, numero, fechaPublicacion, precio, leido } = data;

    if (
        titulo === undefined ||
        autor === undefined ||
        editorial === undefined ||
        numero === undefined ||
        fechaPublicacion === undefined ||
        precio === undefined ||
        leido === undefined
    ) {
        return "Faltan campos obligatorios: titulo, autor, editorial, numero, fechaPublicacion, precio, leido";
    }

    if (typeof titulo !== "string" || titulo.trim() === "") {
        return "El título debe ser una cadena de texto no vacía";
    }

    if (typeof autor !== "string" || autor.trim() === "") {
        return "El autor debe ser una cadena de texto no vacía";
    }

    if (typeof editorial !== "string" || editorial.trim() === "") {
        return "La editorial debe ser una cadena de texto no vacía";
    }

    if (typeof numero !== "number" || !Number.isInteger(numero) || numero <= 0) {
        return "El número debe ser un número entero mayor que cero";
    }

    if (typeof fechaPublicacion !== "string" || !isValidDate(fechaPublicacion)) {
        return "La fecha de publicación debe tener un formato válido YYYY-MM-DD";
    }

    if (typeof precio !== "number" || isNaN(precio) || precio < 0) {
        return "El precio debe ser un número igual o superior a cero";
    }

    if (typeof leido !== "boolean") {
        return "El campo leído debe ser un booleano (true o false)";
    }

    return null;
};

const esIdValido = (id: string): boolean => {
    return ObjectId.isValid(id) && new ObjectId(id).toString() === id;
};

const mapearTebeo = (doc: any): Tebeo => {
    return {
        _id: doc._id.toString(),
        titulo: doc.titulo,
        autor: doc.autor,
        editorial: doc.editorial,
        numero: doc.numero,
        fechaPublicacion: doc.fechaPublicacion,
        precio: doc.precio,
        leido: doc.leido
    };
};

export const getTebeos = (
    req: Request,
    res: Response
) => {
    tebeosCollection.find().toArray().then((tebeos) => {
        const respuesta: Tebeo[] = tebeos.map(mapearTebeo);
        res.status(200).json(respuesta);
    }).catch(() => {
        const errorRes: ErrorAPI = {
            error: "Error interno del servidor al obtener los tebeos"
        };
        res.status(500).json(errorRes);
    });
};

export const getTebeoWithID = (
    req: Request,
    res: Response
) => {
    const id = String(req.params.id);

    if (!esIdValido(id)) {
        const errorRes: ErrorAPI = {
            error: "Identificador no válido"
        };
        res.status(400).json(errorRes);
        return;
    }

    tebeosCollection.findOne({
        _id: new ObjectId(id)
    }).then((result) => {
        if (!result) {
            const errorRes: ErrorAPI = {
                error: "Tebeo no encontrado"
            };
            res.status(404).json(errorRes);
            return;
        }

        const respuesta: Tebeo = mapearTebeo(result);
        res.status(200).json(respuesta);
    }).catch(() => {
        const errorRes: ErrorAPI = {
            error: "Error interno del servidor"
        };
        res.status(500).json(errorRes);
    });
};

export const createTebeo = (
    req: Request,
    res: Response
) => {
    const errorValidacion = validarDatosTebeo(req.body);
    if (errorValidacion) {
        const errorRes: ErrorAPI = {
            error: errorValidacion
        };
        res.status(400).json(errorRes);
        return;
    }

    const nuevoTebeo: TebeoDB = {
        titulo: req.body.titulo.trim(),
        autor: req.body.autor.trim(),
        editorial: req.body.editorial.trim(),
        numero: req.body.numero,
        fechaPublicacion: req.body.fechaPublicacion,
        precio: req.body.precio,
        leido: req.body.leido
    };

    tebeosCollection.insertOne(nuevoTebeo).then((result) => {
        const respuesta: Tebeo = {
            _id: result.insertedId.toString(),
            ...nuevoTebeo
        };
        res.status(201).json(respuesta);
    }).catch(() => {
        const errorRes: ErrorAPI = {
            error: "Error interno del servidor"
        };
        res.status(500).json(errorRes);
    });
};

export const updateTebeo = (
    req: Request,
    res: Response
) => {
    const id = String(req.params.id);

    if (!esIdValido(id)) {
        const errorRes: ErrorAPI = {
            error: "Identificador no válido"
        };
        res.status(400).json(errorRes);
        return;
    }

    const errorValidacion = validarDatosTebeo(req.body);
    if (errorValidacion) {
        const errorRes: ErrorAPI = {
            error: errorValidacion
        };
        res.status(400).json(errorRes);
        return;
    }

    const tebeoActualizado: TebeoDB = {
        titulo: req.body.titulo.trim(),
        autor: req.body.autor.trim(),
        editorial: req.body.editorial.trim(),
        numero: req.body.numero,
        fechaPublicacion: req.body.fechaPublicacion,
        precio: req.body.precio,
        leido: req.body.leido
    };

    tebeosCollection.replaceOne({
        _id: new ObjectId(id)
    }, tebeoActualizado).then((result) => {
        if (result.matchedCount === 0) {
            const errorRes: ErrorAPI = {
                error: "Tebeo no encontrado"
            };
            res.status(404).json(errorRes);
            return;
        }

        const respuesta: Tebeo = {
            _id: id,
            ...tebeoActualizado
        };
        res.status(200).json(respuesta);
    }).catch(() => {
        const errorRes: ErrorAPI = {
            error: "Error interno del servidor"
        };
        res.status(500).json(errorRes);
    });
};

export const deleteTebeo = (
    req: Request,
    res: Response
) => {
    const id = String(req.params.id);

    if (!esIdValido(id)) {
        const errorRes: ErrorAPI = {
            error: "Identificador no válido"
        };
        res.status(400).json(errorRes);
        return;
    }

    tebeosCollection.findOneAndDelete({
        _id: new ObjectId(id)
    }).then((result) => {
        const doc = (result && "value" in (result as any)) ? (result as any).value : result;
        if (!doc) {
            const errorRes: ErrorAPI = {
                error: "Tebeo no encontrado"
            };
            res.status(404).json(errorRes);
            return;
        }

        const respuesta: Tebeo = mapearTebeo(doc);
        res.status(200).json(respuesta);
    }).catch(() => {
        const errorRes: ErrorAPI = {
            error: "Error interno del servidor"
        };
        res.status(500).json(errorRes);
    });
};
