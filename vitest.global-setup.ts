import { execSync } from "node:child_process";
import { existsSync, unlinkSync } from "node:fs";
import path from "node:path";

const TEST_DB_PATH = path.resolve(__dirname, "prisma/test.db");
const TEST_DATABASE_URL = `file:${TEST_DB_PATH}`;

// Base de données SQLite dédiée aux tests, isolée de dev.db, recréée à
// chaque lancement de la suite pour repartir d'un état propre.
export default function setup() {
  if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH);

  execSync("npx prisma migrate deploy", {
    cwd: __dirname,
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });

  return () => {
    if (existsSync(TEST_DB_PATH)) unlinkSync(TEST_DB_PATH);
  };
}
