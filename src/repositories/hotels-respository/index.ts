import { prisma } from "@/config";

async function getHotels() {
  return await prisma.hotel.findMany({});
}

async function getHotelById(id: number) {
  return await prisma.hotel.findUnique({ where: { id: id }, include: { Rooms: true } } );
}

const hotelsRepository = {
  getHotels,
  getHotelById
};

export default hotelsRepository;
