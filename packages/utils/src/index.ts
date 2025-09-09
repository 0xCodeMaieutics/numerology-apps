import crypto from "crypto";
export const createRandomId = (bytes = 12) =>
  crypto.randomBytes(bytes).toString("hex");

import { numerology } from "./numerology";
export { numerology };
