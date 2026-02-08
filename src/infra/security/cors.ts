import cors from "cors";
import { env } from "@/config/env";

const allowedOrigins =
  env.NODE_ENV === "production" ?
    ["https://your-app.vercel.app"] // Update with actual production URL
  : ["http://localhost:3002"];

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-request-id"],
});
