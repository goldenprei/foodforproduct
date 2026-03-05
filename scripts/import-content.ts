import "dotenv/config";

import { importContentDirectory } from "../lib/content/importer";
import { prisma } from "../lib/db/prisma";

async function main() {
  const dirArg = process.argv.find((arg) => arg.startsWith("--dir="));
  const publishFlag = process.argv.includes("--publish");

  const directory = dirArg ? dirArg.replace("--dir=", "") : "content/import";

  const summary = await importContentDirectory(directory, {
    publish: publishFlag
  });

  console.log("Import summary:");
  console.table(summary);

  if (summary.errors.length) {
    console.log("Errors:");
    for (const error of summary.errors) {
      console.log(`- ${error.file}: ${error.message}`);
    }
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
