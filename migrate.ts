const MIGRATIONS_DIR = new URL("./src/migrations/", import.meta.url);
const REGISTRY_FILE = new URL("./src/migrations/migrations.ts", import.meta.url);
const IMPORT_MARKER = "// add-migration-imports-above";
const ENTRY_MARKER = "  // add-migration-entries-above";

function formatTimestamp(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    "_",
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

function slugify(title: string) {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "migration"
  );
}

function toImportName(moduleName: string) {
  const pascal = moduleName
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
  return `migration${pascal}`;
}

const title = Bun.argv.slice(2).join(" ").trim();
if (!title) {
  console.error("Usage: bun migrations.ts [title]");
  process.exit(1);
}

const timestamp = formatTimestamp(new Date());
const slug = slugify(title);
const moduleName = `${timestamp}_${slug}`;
const importName = toImportName(moduleName);
const migrationFile = new URL(`${moduleName}.ts`, MIGRATIONS_DIR);

if (await Bun.file(migrationFile).exists()) {
  console.error(`Migration already exists: ${migrationFile.pathname}`);
  process.exit(1);
}

const migrationSource = `import type { SaveMigration } from "./types";

export default {
  migration_id: "${moduleName}",
  renamed_action_ids: [],
  renamed_knowledge_ids: [],
  renamed_locations: [],
  renamed_sublocations: [],
  renamed_item_ids: [],
  renamed_flags: [],
} satisfies SaveMigration;
`;

let registrySource = await Bun.file(REGISTRY_FILE).text();
if (
  !registrySource.includes(IMPORT_MARKER) ||
  !registrySource.includes(ENTRY_MARKER)
) {
  console.error("Migration registry markers are missing.");
  process.exit(1);
}

registrySource = registrySource
  .replace(
    IMPORT_MARKER,
    `import ${importName} from "./${moduleName}";\n${IMPORT_MARKER}`,
  )
  .replace(ENTRY_MARKER, `  ${importName},\n${ENTRY_MARKER}`);

await Bun.write(migrationFile, migrationSource);
await Bun.write(REGISTRY_FILE, registrySource);

console.log(`Created ${migrationFile.pathname}`);
console.log(`Registered ${moduleName}`);
