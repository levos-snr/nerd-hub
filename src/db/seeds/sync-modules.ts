import "../../lib/load-env.js";
import { syncModulesFromSource } from "../../server/modules/repository";

const result = await syncModulesFromSource();
console.log(`Synced ${result.upserted} modules from source.`);
