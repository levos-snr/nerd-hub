import { writeFile } from "node:fs/promises";
import { curriculumModules } from "../../features/curriculum/modules";

const output = {
  generatedAt: new Date().toISOString(),
  moduleCount: curriculumModules.length,
  modules: curriculumModules,
};

await writeFile("curriculum.seed.json", JSON.stringify(output, null, 2), "utf-8");
console.log(`Seeded ${curriculumModules.length} modules to curriculum.seed.json`);
