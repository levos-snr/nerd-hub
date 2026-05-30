import { buildMixedModules, defaultModules } from "./buildModules";

export { buildMixedModules, defaultModules as curriculumModules };

export const moduleCountByTrack = {
  javascript: defaultModules.filter((m) => m.track === "javascript").length,
  typescript: defaultModules.filter((m) => m.track === "typescript").length,
  total: defaultModules.length,
};
