import {load} from "ts-dotenv"

const env = load({
   PORT: Number,
  DATABASE_URL: String,
  JWT_SECRET: String,
  NODE_ENV: String

})

export default env