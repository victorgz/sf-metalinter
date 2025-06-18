export function parseXml(xmlString: any): ParsedXMLDocument;
export class XMLElement {
    constructor(data: any, tagName: any, lineNumber?: number);
    data: any;
    tagName: any;
    lineNumber: number;
    text(): string;
    line(): number;
}
export class ParsedXMLDocument {
    constructor(xmlObj: any);
    xmlObj: any;
    get(xpath: any): any;
    _findNestedPath(xpath: any): XMLElement | null;
    _findElementInContext(context: any, tagName: any): any;
    _findElement(obj: any, tagName: any, lineNumber?: number): any;
    _findElementInObject(obj: any, tagName: any): any;
}
