import d3 from 'd3';
import * as d3Fetch from 'd3-fetch'
import setupScrollama from './setupScrollama.js';
import firstPaint from './firstPaint';
import loadMap from "./loadMap";
import topojson from 'topojson';
import WorldMap from './WorldMap.js'
import BarChart from './BarChart.js'
import LineChart from './LineChart.js'
import {
  populationsIn1989millions,
} from "./constants";

window.onbeforeunload = function() {
  window.scrollTo(0, 0);
};

// async function loadMapTopography () {
//   let response = await d3.json("./json/110topoworld.json");

//   return response
// }
firstPaint();

async function initializeGraphics () {
  const response = await d3Fetch.json("./json/110topoworld.json")

  console.warn('dddd response', response)
}

initializeGraphics()

loadMap().then(json => {
  console.warn({json})

  const countries = topojson.feature(json, json.objects.subunits)
  const features = countries.features;

  const worldMap = new WorldMap({
    data: features,
    element: '.map-graphic-container'
  })

  const lineChart = new LineChart({
    data: populationsIn1989millions,
    element: '.line-graphic'
  })

  const barChart = new BarChart({
    element: '.bar-graphic',
    data: populationsIn1989millions
  })

  console.warn('features', features);

  setupScrollama(worldMap, barChart, lineChart);
});