import { Router } from "express";
import { createMatch, getAllMatches } from "../controllers/matchController";
import authenticate from "../middleware/authenticate";

const router = Router();

router.post("/create", authenticate, createMatch);

router.get("/all", authenticate, getAllMatches);

export default router;
