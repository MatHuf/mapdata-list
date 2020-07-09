const fs = require('fs');
const htmlParser = require('node-html-parser');
const codegrid = require('codegrid-js');
const grid = codegrid.CodeGrid();

console.log('Load test mapdata:');

const testSource = fs.readFileSync('./test/mapdata.js');
if (!testSource) {
  console.log('FAILED. Test mapdata file not find in ./test');
  return;
}
console.log('PASSED');
// This will put simplemaps_worldmap_mapdata in the global scope
eval(testSource.toString());

const mapDataLocationCount = Object.keys(simplemaps_worldmap_mapdata.locations).length;
let uniqueCountries = [];
let locationsRemaining = mapDataLocationCount;
for (let key in simplemaps_worldmap_mapdata.locations) {
  let location = simplemaps_worldmap_mapdata.locations[key];
  const getCountry = (error, code) => {
    if (error) {
      console.log(error);
      return;
    }
    if (!uniqueCountries.includes(code)) {
      uniqueCountries.push(code);
    }
    locationsRemaining--;
    if (!locationsRemaining) {
      runTests();
    }
  };
  grid.getCode(Number.parseFloat(location.lat), Number.parseFloat(location.lng), getCountry);
}

const runTests = () => {
  console.log('Output html file generated:');
  const testOutput = fs.readFileSync('./output/locationsByCountry.html');
  if (!testOutput) {
    console.log('FAILED. File not found in ./output');
  }
  console.log('PASSED');

  // Need to remove the doctype or the parser will not work correctly
  const html = testOutput.toString().replace('<!DOCTYPE html>', '');
  const root = htmlParser.parse(html);

  console.log('Navigation links match unique country count:');
  const navLinks = root.querySelector('nav').firstChild.childNodes.length;
  const navLinksMatch = navLinks === uniqueCountries.length;
  console.log(navLinksMatch ? 'PASSED' : `FAILED. ${navLinks} nav links, ${uniqueCountries.length} unique countries`);

  console.log('Location counts match:');
  let htmlLocationCount = 0;
  const bodyChildren = root.querySelector('body').childNodes;
  for (let div of bodyChildren) {
    const list = div.childNodes.filter(c => c.tagName === 'ul' && c.parentNode.tagName !== 'nav');
    if (list['0']) {
      const listItems = list['0'].childNodes.filter(c => c.tagName === 'li').length;
      htmlLocationCount += listItems;
    }
  }
  const locationsMatch = mapDataLocationCount === htmlLocationCount;
  console.log(locationsMatch ? 'PASSED' : `FAILED. ${mapDataLocationCount} mapdata locations, ${htmlLocationCount} html locations`);
};

