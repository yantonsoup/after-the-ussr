import setupScrollama from './setupScrollama.js';
import firstPaint from './firstPaint';
import loadMap from "./loadMap";
import topojson from 'topojson';
import WorldMap from './WorldMap.js'
import BarChart from './BarChart.js'
import {
  populationsIn1989millions,
} from "./constants";

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

loadMap().then(json => {

  firstPaint();

  const countries = topojson.feature(json, json.objects.subunits)
  const features = countries.features;

  const worldMap = new WorldMap({
    data: features,
    element: '.map-graphic-container'
  })

  const barChart = new BarChart({
    element: '.bar-graphic',
    data: populationsIn1989millions
  })

  console.warn('features', features);

  setupScrollama(worldMap, barChart);
});