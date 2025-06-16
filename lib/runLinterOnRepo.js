const fs = require('fs').promises
const path = require('path')
const {glob} = require('glob')
const libxmljs = require('libxmljs')
const Linter = require('./Linter')


async function findMetadataFiles(baseDir, patterns = ['**/*.*-meta.xml']) {
 const allMatches = await Promise.all(
    patterns.map(pattern =>
      glob(pattern, {
        cwd: baseDir,        // relative to baseDir
        absolute: true       // return absolute paths
      })
    )
  )
  return allMatches.flat()
}

// Utility: remove xmlns declaration from raw XML
function removeNamespaces(xmlString) {
  return xmlString
    .replace(/xmlns(:\w+)?="[^"]*"/g, '') // removes all xmlns declarations
    .replace(/<\/?(\w+):/g, '</$1_')      // e.g. <m:tag> → <m_tag>
}

async function parseMetadataFile(filePath) {
  const rawContent = await fs.readFile(filePath, 'utf8')
  const cleanedContent = removeNamespaces(rawContent)

  let parsedXml = null
  try {
    parsedXml = libxmljs.parseXml(cleanedContent);
  } catch (err) {
    console.warn(`⚠️ Failed to parse XML: ${filePath}`, err.message)
  }

  return {
    path: filePath,
    name: path.basename(filePath),
    raw: rawContent,
    parsedXml // ⬅️ key part!
  }
}

function extractFakeDescription(content) {
  const match = content.match(/<description>(.*?)<\/description>/)
  return match ? match[1] : ''
}

async function runLinterOnRepo(baseDir, rules) {
  const linter = new Linter(rules)
  const files = await findMetadataFiles(baseDir)

  const results = await Promise.all(
    files.map(async file => {
      const metadata = await parseMetadataFile(file)
      const messages = await linter.runOnFile(metadata)
      return messages
    })
  )

  return results.flat()
}

module.exports = runLinterOnRepo
