/**
 * PdfReader: class that reads a PDF file, and calls a function on each item found while parsing that file.
 * @author Adrien Joly, http://github.com/adrienjoly
 * This content is released under the MIT License.
 *
 * An item object can match one of the following objects:
 * - null, when the parsing is over, or an error occured.
 * - {file:{path:string}}, when a PDF file is being opened.
 * - {page:integer}, when a new page is being parsed, provides the page number, starting at 1.
 * - {text:string, x:float, y:float, w:float, h:float...}, represents each text with its position.
 *
 **/

var LOG = require("./lib/LOG.js");
var PFParser = require("pdf2json/pdfparser"); // doc: https://github.com/modesty/pdf2json

function forEachItem(pdf, handler) {
  var pageNumber = 0;
  for (var p in pdf.formImage.Pages) {
    var page = pdf.formImage.Pages[p];
    var number = ++pageNumber;
    handler(null, {
      page: number,
      width: pdf.formImage.Width,
      height: pdf.formImage.Pages[number - 1].Height
    });
    for (var t in page.Texts) {
      var item = page.Texts[t];
      item.text = decodeURIComponent(item.R[0].T);
      handler(null, item);
    }
  }
  handler();
}

function PdfReader(options) {
  LOG("PdfReader"); // only displayed if LOG.js was first loaded with `true` as init parameter
  this.options = options || {};
}

/**
 * parseFileItems: calls itemHandler(error, item) on each item parsed from the pdf file
 **/
PdfReader.prototype.parseFileItems = function(pdfFilePath, itemHandler, password) {
  itemHandler(null, { file: { path: pdfFilePath } });
  var pdfParser = new PFParser();
  pdfParser.on("pdfParser_dataError", itemHandler);
  pdfParser.on("pdfParser_dataReady", function(pdfData) {
    forEachItem(pdfData, itemHandler);
  });
  var verbosity = this.options.debug ? 1 : 0;
  pdfParser.loadPDF(pdfFilePath, verbosity, password);
};

/**
 * parseBuffer: calls itemHandler(error, item) on each item parsed from the pdf file received as a buffer
 */
PdfReader.prototype.parseBuffer = function(pdfBuffer, itemHandler) {
  itemHandler(null, { file: { buffer: pdfBuffer } });
  var pdfParser = new PFParser();
  pdfParser.on("pdfParser_dataError", itemHandler);
  pdfParser.on("pdfParser_dataReady", function(pdfData) {
    forEachItem(pdfData, itemHandler);
  });
  var verbosity = this.options.debug ? 1 : 0;
  pdfParser.parseBuffer(pdfBuffer, verbosity);
};

module.exports = PdfReader;
