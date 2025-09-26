import libxmljs from 'libxmljs';

// Wrapper class to provide a consistent interface for XML elements
class XMLElement {
  constructor(libxmlNode) {
    this.libxmlNode = libxmlNode;
  }

  text() {
    if (!this.libxmlNode) return '';
    // Get text content from the libxmljs node
    return this.libxmlNode.text().trim();
  }

  line() {
    // libxmljs provides line number information
    return this.libxmlNode.line();
  }
}

// Wrapper class to provide XPath functionality on parsed XML documents
class ParsedXMLDocument {
  constructor(xmlDoc) {
    this.xmlDoc = xmlDoc;
  }

  get(xpathExpression) {
    if (!this.xmlDoc) return null;

    try {
      // Use libxmljs find method for XPath queries
      const nodes = this.xmlDoc.find(xpathExpression);

      // Return the first match if found
      if (nodes && nodes.length > 0) {
        return new XMLElement(nodes[0]);
      }
    } catch (error) {
      console.warn(`XPath query failed for: ${xpathExpression}`, error.message);
    }

    return null;
  }

  getAll(xpathExpression) {
    if (!this.xmlDoc) return [];

    try {
      // Use libxmljs find method for XPath queries - returns all matches
      const nodes = this.xmlDoc.find(xpathExpression);
      return nodes.map((node) => new XMLElement(node));
    } catch (error) {
      console.warn(`XPath query failed for: ${xpathExpression}`, error.message);
      return [];
    }
  }
}

// Clean namespace prefixes from XML while preserving structure
function normalizeXmlNamespaces(xmlString) {
  return (
    xmlString
      // Remove namespace declarations
      .replace(/\s+xmlns(:\w+)?="[^"]*"/g, '')
      // Convert namespace prefixes to underscores (e.g., xsi:type -> xsi_type)
      .replace(/(\w+):/g, '$1_')
  );
}

// Main parsing function
function parseXml(xmlString) {
  try {
    // Normalize namespaces to avoid parsing issues
    const normalizedXml = normalizeXmlNamespaces(xmlString);

    // Parse with libxmljs
    const xmlDoc = libxmljs.parseXml(normalizedXml);

    return new ParsedXMLDocument(xmlDoc);
  } catch (error) {
    throw new Error(`XML parsing failed: ${error.message}`);
  }
}

export { parseXml, XMLElement, ParsedXMLDocument };
