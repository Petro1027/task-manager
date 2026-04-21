import dotenv from "dotenv";

dotenv.config();

const portValue = process.env.PORT ?? "3001";
const parsedPort = Number(portValue);

if (Number.isNaN(parsedPort)) {
  throw new Error("PORT environment variable must be a valid number.");
}

export const env = {
  port: parsedPort,
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:5173",
};
