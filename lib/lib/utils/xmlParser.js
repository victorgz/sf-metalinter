"use strict";
const { XMLParser } = require('fast-xml-parser');
class XMLElement {
    constructor(data, tagName, lineNumber = 0) {
        this.data = data;
        this.tagName = tagName;
        this.lineNumber = lineNumber;
    }
    text() {
        // Handle both simple values and nested objects
        if (typeof this.data === 'string' || typeof this.data === 'number') {
            return String(this.data);
        }
        // If it's an object, try to get the text content
        if (typeof this.data === 'object' && this.data !== null) {
            // Check for common text property names
            if (this.data['#text'])
                return String(this.data['#text']);
            if (typeof this.data === 'object' && Object.keys(this.data).length === 0)
                return '';
            // If it's a simple object with one property, return its value
            const keys = Object.keys(this.data);
            if (keys.length === 1 && typeof this.data[keys[0]] === 'string') {
                return String(this.data[keys[0]]);
            }
        }
        return this.data ? String(this.data) : '';
    }
    line() {
        return this.lineNumber;
    }
}
class ParsedXMLDocument {
    constructor(xmlObj) {
        this.xmlObj = xmlObj;
    }
    // Simple XPath-like functionality to replace libxmljs .get() method
    get(xpath) {
        // Handle simple XPath expressions like //tagName
        if (xpath.startsWith('//') && !xpath.includes('//', 2)) {
            const tagName = xpath.substring(2);
            return this._findElement(this.xmlObj, tagName);
        }
        // Handle more complex XPath like //start//object or //start//filterFormula
        if (xpath.includes('//') && xpath.indexOf('//', 2) !== -1) {
            return this._findNestedPath(xpath);
        }
        return null;
    }
    _findNestedPath(xpath) {
        // Split by // and filter out empty parts
        const parts = xpath.split('//').filter(p => p);
        // Start with the full document
        let currentContext = this.xmlObj;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const found = this._findElementInContext(currentContext, part);
            if (!found)
                return null;
            // If this is the last part, return the XMLElement
            if (i === parts.length - 1) {
                return new XMLElement(found, part);
            }
            // Otherwise, set the context for the next search
            currentContext = found;
        }
        return null;
    }
    _findElementInContext(context, tagName) {
        if (typeof context !== 'object' || context === null) {
            return null;
        }
        // Direct match
        if (context.hasOwnProperty(tagName)) {
            return context[tagName];
        }
        // Recursive search in all properties
        for (const key in context) {
            if (typeof context[key] === 'object' && context[key] !== null) {
                const found = this._findElementInContext(context[key], tagName);
                if (found !== null)
                    return found;
            }
        }
        return null;
    }
    _findElement(obj, tagName, lineNumber = 0) {
        if (typeof obj !== 'object' || obj === null) {
            return null;
        }
        // Check if the current object has the tag we're looking for
        if (obj.hasOwnProperty(tagName)) {
            return new XMLElement(obj[tagName], tagName, lineNumber);
        }
        // Recursively search in nested objects
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                const found = this._findElement(obj[key], tagName, lineNumber);
                if (found)
                    return found;
            }
        }
        return null;
    }
    _findElementInObject(obj, tagName) {
        if (typeof obj !== 'object' || obj === null) {
            return null;
        }
        if (obj.hasOwnProperty(tagName)) {
            return { data: obj[tagName], tagName };
        }
        for (const key in obj) {
            if (typeof obj[key] === 'object') {
                const found = this._findElementInObject(obj[key], tagName);
                if (found)
                    return found;
            }
        }
        return null;
    }
}
function parseXml(xmlString) {
    const parser = new XMLParser({
        ignoreAttributes: false,
        attributeNamePrefix: '@_',
        textNodeName: '#text',
        parseAttributeValue: true,
        trimValues: true,
        parseTrueNumberOnly: false,
        parseTagValue: true,
        ignoreNameSpace: true, // This helps with namespace issues
        removeNSPrefix: true, // Remove namespace prefixes
        allowBooleanAttributes: true,
    });
    try {
        const xmlObj = parser.parse(xmlString);
        return new ParsedXMLDocument(xmlObj);
    }
    catch (error) {
        throw new Error(`XML parsing failed: ${error.message}`);
    }
}
module.exports = {
    parseXml,
    XMLElement,
    ParsedXMLDocument
};
//# sourceMappingURL=xmlParser.js.map