import { rmSync } from 'node:fs';
import { fileURLToPath, URL } from 'node:url';

const buildDirectory = fileURLToPath(new URL('../build/', import.meta.url));

rmSync(buildDirectory, { recursive: true, force: true });
