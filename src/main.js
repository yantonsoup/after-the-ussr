import setupScrollama from './setupScrollama.js';
import firstPaint from './firstPaint';
import loadMap from "./loadMap";
import paintMap from './paintMap';
// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

firstPaint();

loadMap().then(json => {
  const countries = topojson.feature(json, json.objects.subunits)
  .features;
  console.warn({ countries });
  paintMap(countries);
  setupScrollama(countries);
});