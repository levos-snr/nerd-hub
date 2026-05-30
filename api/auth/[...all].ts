import { toNodeHandler } from "better-auth/node";
import { auth } from "../../src/features/auth/auth.server";

export default toNodeHandler(auth);
