
var container = d3.select(".scroll");
var graphicMargin = 16 * 4;
var mapWidth = container.node().offsetWidth - graphicMargin;
var mapHeight = Math.floor(window.innerHeight / 2.4);

var svg = d3.select(".scroll__graphic").append("svg")
  .attr("width", mapWidth)
  .attr("height", mapHeight);

console.warn('svg', svg)
  
d3.json("world.json", function (error, world) {
  console.warn('loaded world', world)
  if (error) return console.error(error);
  var projection = d3.geo.mercator()
  .scale(50)
  .translate([mapWidth / 2, mapHeight / 2]);

  var pathGenerator = d3.geo.path().projection(projection);
  svg.append("path")
    .datum(world)
    .attr("d", pathGenerator);
});