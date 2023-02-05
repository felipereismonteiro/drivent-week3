import { notFoundError } from "@/errors";
import hotelsRepository from "@/repositories/hotels-respository";

async function getHotels() {
  return await hotelsRepository.getHotels();
}

async function getHotelById(id: number) {
  const result = await hotelsRepository.getHotelById(id);
  if (!result) throw notFoundError();
  return result;
}

const hotelsService = {
  getHotels,
  getHotelById
};

export default hotelsService;
