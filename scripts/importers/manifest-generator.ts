import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { DatasetManifest } from '../../src/types/index.js';

export function calculateChecksum(content: string | Buffer): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

export function writeManifest(
  datasetDir: string,
  manifestData: Omit<DatasetManifest, 'importedAt' | 'checksum'>,
  dataFileContent: string
): DatasetManifest {
  const checksum = calculateChecksum(dataFileContent);
  const manifest: DatasetManifest = {
    ...manifestData,
    importedAt: new Date().toISOString(),
    checksum
  };

  const manifestPath = path.join(datasetDir, 'manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  return manifest;
}
