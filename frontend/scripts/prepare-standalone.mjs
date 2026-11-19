import { cpSync, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = process.cwd();
const standaloneRoot = resolve(projectRoot, ".next/standalone");
const staticSource = resolve(projectRoot, ".next/static");
const staticTarget = resolve(standaloneRoot, ".next/static");
const publicSource = resolve(projectRoot, "public");

mkdirSync(resolve(standaloneRoot, ".next"), { recursive: true });
if (existsSync(staticSource)) cpSync(staticSource, staticTarget, { recursive: true, force: true });
if (existsSync(publicSource)) cpSync(publicSource, resolve(standaloneRoot, "public"), { recursive: true, force: true });
