import setupScrollama from './setupScrollama.js';
import firstPaint from './firstPaint';
import loadMap from "./loadMap";

// even though Rollup is bundling all your files together, errors and
// logs will still point to your original source modules
console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

firstPaint();
setupScrollama();