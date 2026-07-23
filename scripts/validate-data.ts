import fs from 'fs';
import path from 'path';
import { CityConfigSchema } from '../src/types/schemas';

const configPath = path.join(process.cwd(), 'src/data/config.json');

try {
  const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const parsed = CityConfigSchema.parse(data);
  console.log("Validation successful! Config is valid.");
} catch (e) {
  console.error("Validation failed:", e);
  process.exit(1);
}
