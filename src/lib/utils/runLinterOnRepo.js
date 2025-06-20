import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { parseXml } from './xmlParser.js';
import Linter from '../objects/Linter.js';

async function findMetadataFiles(baseDir, patterns = ['**/*.*-meta.xml']) {
  const allMatches = await Promise.all(
    patterns.map((pattern) =>
      glob(pattern, {
        cwd: baseDir, // relative to baseDir
        absolute: true, // return absolute paths
      })
    )
  );
  return allMatches.flat();
}

async function parseMetadataFile(filePath) {
  const rawContent = await fs.readFile(filePath, 'utf8');

  let parsedXml = null;
  try {
    parsedXml = parseXml(rawContent);
  } catch (err) {
    console.warn(`⚠️ Failed to parse XML: ${filePath}`, err.message);
  }

  return {
    path: filePath,
    name: path.basename(filePath),
    raw: rawContent,
    parsedXml, // ⬅️ key part!
  };
}

function extractFakeDescription(content) {
  const match = content.match(/<description>(.*?)<\/description>/);
  return match ? match[1] : '';
}

async function runLinterOnRepo(paths, rules) {
  const linter = new Linter(rules);
  const resolvedFiles = [];

  for (const p of paths) {
    const stats = await fs.stat(p);

    if (stats.isDirectory()) {
      const filesInDir = await findMetadataFiles(p);
      resolvedFiles.push(...filesInDir);
    } else if (stats.isFile()) {
      resolvedFiles.push(p);
    } else {
      console.warn(`⚠️ Skipping unsupported path: ${p}`);
    }
  }
  console.log('✅ Number of files to lint: ', resolvedFiles.length);

  const results = await Promise.all(
    resolvedFiles.map(async (file) => {
      const metadata = await parseMetadataFile(file);
      const messages = await linter.runOnFile(metadata);
      return messages;
    })
  );

  return results.flat();
}

export default runLinterOnRepo;
