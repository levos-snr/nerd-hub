import { toNodeHandler } from "better-auth/node";
import { auth } from "../../src/features/auth/auth.server";

const handler = toNodeHandler(auth);
export default handler;
export const config = { api: { bodyParser: false } };
