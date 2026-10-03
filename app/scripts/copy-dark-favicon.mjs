import { copyFileSync, rmSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

copyFileSync(
  resolve(root, "temp-icons/favicon.ico"),
  resolve(root, "public/favicon-dark.ico")
);
rmSync(resolve(root, "temp-icons"), { recursive: true, force: true });
