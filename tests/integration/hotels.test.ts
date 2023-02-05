import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import httpStatus from "http-status";
import faker from "@faker-js/faker";
import { prisma } from "@/config";
import { HotelCreate, RoomCreate } from "@/protocols";
import { createEnrollmentWithAddress, createTicket, createTicketTypeWithCredentials, createUser } from "../factories/index";

beforeAll( async () => {
  await init();
});

beforeEach( async () => {
  await cleanDb();
});

afterAll( async () => {
  await cleanDb();
});

const server = supertest(app);

describe("GET /hotels", () => {
  it("should respond with status 401 if no token in given", async () => {
    const response = await server.get("/hotels");
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if token is invalid", async () => {
    const token = faker.lorem.word();
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 404 if there`s no enrollment, ticket or hotel", async () => {
    const token = await generateValidToken();
    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should return 402 if ticket is not paid", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithCredentials(false, true);
    await createTicket(enrollment.id, ticketType.id, "RESERVED");

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should return 402 if ticket is remote", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithCredentials(true, false);
    await createTicket(enrollment.id, ticketType.id, "PAID");

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should return 402 if ticket don`t includes hostel", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithCredentials(false, false);
    await createTicket(enrollment.id, ticketType.id, "PAID");

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 200 and array of hotels", async () => {
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithCredentials(false, true);
    await createTicket(enrollment.id, ticketType.id, "PAID");

    const hotel = generateHotel();
    await createHotelOrRoom(hotel);

    const response = await server.get("/hotels").set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.OK);
    expect(response.body).toEqual(expect.arrayContaining([
      expect.objectContaining(
        {
          id: expect.any(Number),
          name: expect.any(String),
          image: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String)
        })
    ]));
  });
});

describe("GET /hotels/:hotelId", () => {
  it("should respond with status 401 if no token in given", async () => {
    const num = faker.random.numeric();
    const response = await server.get(`/hotels/${num}`);
    
    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 401 if token is invalid", async () => {
    const hotel: HotelCreate = generateHotel();
    await createHotelOrRoom(hotel);
    const { id } = await prisma.hotel.findFirst(); 
    const response = await server.get(`/hotels/${id}`).set("Authorization", "Bearer XXXX");

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it("should respond with status 404 if there`s no enrollment, ticket or hotel", async () => {
    const token = await generateValidToken();
    const hotel: HotelCreate = generateHotel();
    await createHotelOrRoom(hotel);
    const { id } = await prisma.hotel.findFirst();
    const response = await server.get(`/hotels/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should return 402 if ticket is not paid", async () => {
    const user = await createUser();
    const hotel: HotelCreate = generateHotel();
    await createHotelOrRoom(hotel);
    const { id } = await prisma.hotel.findFirst();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithCredentials(false, true);
    await createTicket(enrollment.id, ticketType.id, "RESERVED");

    const response = await server.get(`/hotels/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should return 402 if ticket is remote", async () => {
    const user = await createUser();
    const hotel: HotelCreate = generateHotel();
    await createHotelOrRoom(hotel);
    const { id } = await prisma.hotel.findFirst();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithCredentials(true, false);
    await createTicket(enrollment.id, ticketType.id, "PAID");

    const response = await server.get(`/hotels/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should return 402 if ticket don`t includes hostel", async () => {
    const user = await createUser();
    const hotel: HotelCreate = generateHotel();
    await createHotelOrRoom(hotel);
    const { id } = await prisma.hotel.findFirst();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithCredentials(false, false);
    await createTicket(enrollment.id, ticketType.id, "PAID");

    const response = await server.get(`/hotels/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
  });

  it("should respond with status 404 if are no hotels with this id", async () => {
    const token = await generateValidToken();
    const response = await server.get(`/hotels/${faker.random.numeric(11)}`).set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.NOT_FOUND);
  });

  it("should respond with status 200 with the hotel with rooms included", async () => {
    const hotel: HotelCreate = generateHotel();
    await createHotelOrRoom(hotel);
    const { id } = await prisma.hotel.findFirst();
    const user = await createUser();
    const token = await generateValidToken(user);
    const enrollment = await createEnrollmentWithAddress(user);
    const ticketType = await createTicketTypeWithCredentials(false, true);
    await createTicket(enrollment.id, ticketType.id, "PAID");
    const room: RoomCreate = generateRoom(id);

    await createHotelOrRoom(hotel, room);
    const response = await server.get(`/hotels/${id}`).set("Authorization", `Bearer ${token}`);

    expect(response.body).toEqual((
      {
        id: expect.any(Number),
        name: expect.any(String),
        image: expect.any(String),
        createdAt: expect.any(String),
        updatedAt: expect.any(String),
        Rooms: expect.arrayContaining([
          {
            id: expect.any(Number),
            name: expect.any(String),
            capacity: expect.any(Number),
            hotelId: expect.any(Number),
            createdAt: expect.any(String),
            updatedAt: expect.any(String)
          }
        ])
      }));
  });
});

function generateHotel(): HotelCreate {
  return {
    image: faker.image.avatar(),
    name: faker.name.jobArea()
  };
}

function generateRoom(hotelId: number): RoomCreate {
  return {
    capacity: Number(faker.random.numeric(3)),
    name: `${faker.random.word().split("")[0]} - ${faker.random.numeric(2)}`,
    hotelId
  };
}

async function createHotelOrRoom(hotel: HotelCreate, room?: RoomCreate) {
  if (room) { 
    await prisma.room.create({ data: room });
    return await prisma.hotel.create({ data: hotel });
  } 
  return await prisma.hotel.create({ data: hotel });
}
