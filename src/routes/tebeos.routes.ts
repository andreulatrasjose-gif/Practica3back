import { Router } from "express";
import {
    getTebeos,
    getTebeoWithID,
    createTebeo,
    updateTebeo,
    deleteTebeo
} from "../controllers/tebeos.controller.js";

const router = Router();

router.get("/", getTebeos);
router.get("/:id", getTebeoWithID);
router.post("/", createTebeo);
router.put("/:id", updateTebeo);
router.delete("/:id", deleteTebeo);

export default router;
