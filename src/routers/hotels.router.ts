import { getHotels, getHotelsById } from "@/controllers";
import { authenticateToken, validateProcess } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router();

hotelsRouter
  .all("/*", authenticateToken)
  .all("/*", validateProcess)
  .get("/", getHotels)
  .get("/:hotelId", getHotelsById);

export { hotelsRouter };
