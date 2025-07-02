import fs from 'fs/promises';
import path from 'path';
import { glob } from 'glob';
import { parseXml } from './xmlParser.js';
import Linter from '../objects/Linter.js'; // eslint-disable-line import/order

/**
 * Finds metadata files in a directory using glob patterns
 * @param {string} baseDir - The base directory to search in
 * @param {string[]} patterns - Array of glob patterns to match files
 * @returns {Promise<string[]>} Array of relative file paths from current working directory
 */
async function findMetadataFiles(baseDir, patterns = ['**/*.*-meta.xml']) {
  const allMatches = await Promise.all(
    patterns.map((pattern) =>
      glob(pattern, {
        cwd: baseDir, // relative to baseDir
        absolute: true, // return absolute paths
      })
    )
  );
  // Convert absolute paths to relative paths from current working directory
  return allMatches.flat().map((filePath) => path.relative(process.cwd(), filePath));
}

/**
 * Parses a single metadata file and extracts its content and XML structure
 * @param {string} filePath - Path to the metadata file to parse
 * @returns {Promise<Object>} Object containing path, name, raw content, and parsed XML
 * @returns {Promise<Object>} return.path - The file path
 * @returns {Promise<Object>} return.name - The basename of the file
 * @returns {Promise<Object>} return.raw - Raw file content as string
 * @returns {Promise<Object>} return.parsedXml - Parsed XML object (null if parsing failed)
 */
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
    parsedXml,
  };
}

/**
 * Runs the linter on multiple file paths or directories
 * @param {string[]} paths - Array of file paths or directory paths to lint
 * @param {Object} rules - Linting rules configuration object
 * @returns {Promise<Array>} Array of linting results with issues found
 */
async function runLinterOnRepo(paths, rules) {
  const linter = new Linter(rules);
  const resolvedFiles = [];

  for (const p of paths) {
    // eslint-disable-next-line no-await-in-loop
    const stats = await fs.stat(p);

    if (stats.isDirectory()) {
      // eslint-disable-next-line no-await-in-loop
      const filesInDir = await findMetadataFiles(p);
      resolvedFiles.push(...filesInDir);
    } else if (stats.isFile()) {
      // Convert individual files to relative paths too
      resolvedFiles.push(path.relative(process.cwd(), p));
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
