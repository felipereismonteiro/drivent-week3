import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "./authentication-middleware";
import httpStatus from "http-status";
import ticketService from "@/services/tickets-service";

export async function validateProcess(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { userId } = req;

    const userTicket = await ticketService.getTicketByUserId(userId);

    if (userTicket.status !== "PAID" || userTicket.TicketType.isRemote || !userTicket.TicketType.includesHotel) {
      return res.sendStatus(httpStatus.PAYMENT_REQUIRED); 
    }

    next();
  } catch (err) {
    return res.sendStatus(httpStatus.NOT_FOUND);
  }
}
