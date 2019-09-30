import * as d3Fetch from "d3-fetch";
import setupScrollama from "./setupScrollama.js";
import applyContainerStyles from "./applyContainerStyles";
import createClickHandlers from "./createClickHandlers";
import topojson from "topojson";
import WorldMap from "./WorldMap.js";
import BarChart from "./BarChart.js";
import LineChart from "./LineChart.js";
import { populationsIn1989millions } from "./constants";

window.onbeforeunload = function() {
  window.scrollTo(0, 1);
};

applyContainerStyles();
createClickHandlers();
initializeGraphics();

async function initializeGraphics() {
  const worldTopo = await d3Fetch.json("./data/world-topo-110m.json");
  const countries = topojson.feature(worldTopo, worldTopo.objects.subunits);
  const features = countries.features;

  const worldMap = new WorldMap({
    data: features,
    element: ".map-graphic-container"
  });

  const barChart = new BarChart({
    element: ".bar-graphic",
    data: populationsIn1989millions
  });

  const russiaPopulationOverTime = await d3Fetch.tsv(
    "./data/soviet-immigration-over-time.tsv"
  );

  const lineChart = new LineChart({
    data: russiaPopulationOverTime,
    element: ".line-graphic",
    headerElement: ".line-graphic-header"
  });

  setupScrollama(worldMap, barChart, lineChart);
}
