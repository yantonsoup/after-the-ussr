// DEFINE VARIABLES
// Define size of map group
// Full world map is 2:1 ratio
// Using 12:5 because we will crop top and bottom of map

var container = d3.select(".scroll__graphic");
var containerSize = container.node().getBoundingClientRect()
var mapWidth = containerSize.width
var mapHeight = containerSize.height

w = mapWidth;
h = mapHeight;
// variables for catching min and max zoom factors
var minZoom;
var maxZoom;

var projection = d3
  .geoMercator()
  .scale(110)
  .center([100, 45]) // set centre to further North
  .translate([mapWidth / 2, mapHeight / 2]);

// .scale([w / (2 * Math.PI)]) // scale to fit group width
// .translate([w / 2, h / 2]); // ensure centred in group

var path = d3.geoPath().projection(projection);

function getTextBox(selection) {
  selection.each(function(d) {
    d.bbox = this.getBBox();
  });
}

var svg = d3
  .select(".scroll__graphic")
  .append("svg")
  // set to the same size as the "map-holder" div
  .attr("width", mapWidth)
  .attr("height", mapHeight);

// get map data
d3.json("soviet.json", function(json) {
  var countriesGroup = svg.append("g").attr("id", "map");
  // add a background rectangle
  countriesGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h);

  countriesGroup
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", function(d, i) {
      return "country" + d.properties.iso_a3;
    })
    .attr("class", "country")
    .on("click", function(d, i) {
      d3.selectAll(".country").classed("country-on", false);
      d3.select(this).classed("country-on", true);
      boxZoom(path.bounds(d), path.centroid(d), 20);
    });

  // on window resize
  $(window).resize(function() {
    // Resize SVG
    svg
      .attr("width", $("#scroll__graphic").width())
      .attr("height", $("scroll__graphic").height());
    // initiateZoom();
  });
});
