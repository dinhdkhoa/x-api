import { CorsOptions } from "cors";
import { ServerOptions } from "socket.io";
import { rateLimit } from 'express-rate-limit'
import { DotenvConfigOptions } from "dotenv";

export const corsConfig : CorsOptions= {
  origin: process.env.CLIENT_DOMAIN_NAME
}

export const socketConfigOptions : Partial<ServerOptions> = {
  cors: corsConfig
}

export const rateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	// store: ... , // Redis, Memcached, etc. See below.
})

export const envConfig : DotenvConfigOptions = {
  path : process.env.NODE_ENV == 'production' ? '.env.production': '.env'
}

export const awsIAMConfig = {
  region: process.env.AWS_REGION,
  credentials: {
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID
  }
}