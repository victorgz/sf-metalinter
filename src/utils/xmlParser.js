import xpath from 'xpath';
import { DOMParser } from '@xmldom/xmldom';

// Wrapper class to provide a consistent interface for XML elements
class XMLElement {
  constructor(domNode) {
    this.domNode = domNode;
  }

  text() {
    if (!this.domNode) return '';
    // Get text content from the DOM node
    const text = this.domNode.textContent || this.domNode.nodeValue || '';
    return text.trim();
  }

  line() {
    // @xmldom/xmldom provides line number information
    return this.domNode?.lineNumber;
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
      // Use xpath.select to find nodes
      const nodes = xpath.select(xpathExpression, this.xmlDoc);

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
      // Use xpath.select to find nodes - returns all matches
      const nodes = xpath.select(xpathExpression, this.xmlDoc);
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

    // Parse with standard configuration
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(normalizedXml, 'application/xml');

    // Check for parsing errors - @xmldom/xmldom creates parsererror elements for invalid XML
    const parseError = xmlDoc.getElementsByTagName('parsererror');
    if (parseError.length > 0) {
      throw new Error('XML parsing failed: ' + parseError[0].textContent);
    }

    // Additional check for completely invalid XML - if root element is parsererror
    if (xmlDoc.documentElement && xmlDoc.documentElement.tagName === 'parsererror') {
      throw new Error('XML parsing failed: ' + xmlDoc.documentElement.textContent);
    }

    // Check if the document has any valid elements
    if (!xmlDoc.documentElement) {
      throw new Error('XML parsing failed: No valid XML elements found');
    }

    return new ParsedXMLDocument(xmlDoc);
  } catch (error) {
    // Re-throw with consistent error message format
    if (error.message.startsWith('XML parsing failed:')) {
      throw error;
    }
    throw new Error(`XML parsing failed: ${error.message}`);
  }
}

export { parseXml, XMLElement, ParsedXMLDocument };
