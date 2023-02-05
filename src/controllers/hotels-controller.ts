import { AuthenticatedRequest } from "@/middlewares";
import hotelsService from "@/services/hotels-service";
import { Response } from "express";
import httpStatus from "http-status";

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const hotels = await hotelsService.getHotels();
    return res.send(hotels).status(httpStatus.OK);
  } catch (err) {
    return res.send(err.message).status(httpStatus.NOT_FOUND);
  }
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  try {
    const { hotelId } = req.params;
  
    const hotelById = await hotelsService.getHotelById(Number(hotelId));

    return res.status(httpStatus.OK).send(hotelById);
  } catch (err) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
