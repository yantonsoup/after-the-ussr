var container = d3.select(".scroll__graphic");
var containerSize = container.node().getBoundingClientRect()
var width = containerSize.width
var height = containerSize.height


// var zoom = d3.behavior.zoom()
//     .size([width, height])
//     .on("zoom", zoomed);

// var simplify = d3.geo.transform({
//   point: function(x, y, z) {
//     if (z < visibleArea) return;
//     x = x * scale + translate[0];
//     y = y * scale + translate[1];
//     if (x >= -10 && x <= width + 10 && y >= -10 && y <= height + 10 || z >= invisibleArea) this.stream.point(x, y);
//   }
// });
  
var projection = d3.geo.mercator()
  .scale(80)
  .center([0, 45]) // set centre to further North
  .translate([width / 2, height / 2]);
  // .translate([0, 0])
  // .scale(4000);


// .scale([w / (2 * Math.PI)]) // scale to fit group width
// .translate([w / 2, h / 2]); // ensure centred in group

var path = d3.geo.path().projection(projection);



var svg = d3
  .select(".scroll__graphic")
  .append("svg")
  // set to the same size as the "map-holder" div
  .attr("width", width)
  .attr("height", height);

// get map data
d3.json("world.json", function(json) {
  var countriesGroup = svg.append("g").attr("id", "map");
  // add a background rectangle
  countriesGroup
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", width)
    .attr("height", height);

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
