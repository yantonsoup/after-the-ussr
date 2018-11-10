

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
var container = d3.select(".scroll__graphic");
var containerSize = container.node().getBoundingClientRect()
var width = containerSize.width
var height = containerSize.height
var centered

var rotate = -20,        // so that [-60, 0] becomes initial center of projection
maxlat = 83;

var projection = d3.geo.mercator()
  .rotate([rotate,0])
  .scale(1)           // we'll scale up to match viewport shortly.
  .translate([width/2, height/2])
  // .center([0, 25])
  // .scale(80)
  // .center([0, 45]) // set centre to further North
  // .translate([width / 2, height / 2]);
  // .translate([0, 0])
  // .scale(4000);

// find the top left and bottom right of current projection
function mercatorBounds(projection, maxlat) {
  var yaw = projection.rotate()[0],
      xymax = projection([-yaw+180-1e-6,-maxlat]),
      xymin = projection([-yaw-180+1e-6, maxlat]);
  
  return [xymin,xymax];
}

// set up the scale extent and initial scale for the projection
var b = mercatorBounds(projection, maxlat)
  console.warn('b, mercurator bound', mercatorBounds)
  var  s = width/(b[1][0]-b[0][0])
  console.warn('s', s)
  var scaleExtent = [s, 10*s];
  console.warn('scaleExtent', scaleExtent)

projection
  .scale(scaleExtent[0]);
// .scale([w / (2 * Math.PI)]) // scale to fit group width
// .translate([w / 2, h / 2]); // ensure centred in group

var path = d3.geo.path().projection(projection);

var svg = d3
  .select(".scroll__graphic")
  .append("svg")
  // set to the same size as the "map-holder" div
  .attr("width", width)
  .attr("height", height);



var countriesGroup = svg.append("g").attr("id", "map");

// get map data
d3.json("world.json", function(json) {

  countriesGroup
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", function(d, i) {
      // console.warn('d', d)
      return "country" + d.properties.iso_a3;
    })
    .attr("class", "country")
    .on("click", clicked);

  // on window resize
  $(window).resize(function() {
    svg
      .attr("width", $("#scroll__graphic").width())
      .attr("height", $("scroll__graphic").height());
  });
});


function clicked(d) {
  var x, y, k;

  if (d && centered !== d) {
    var centroid = path.centroid(d);
    x = centroid[0];
    y = centroid[1];
    k = 4;
    centered = d;
  } else {
    x = width / 2;
    y = height / 2;
    k = 1;
    centered = null;
  }

  countriesGroup.selectAll("path")
      .classed("active", centered && function(d) { return d === centered; });

  countriesGroup.transition()
      .duration(750)
      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
      .style("stroke-width", 1.5 / k + "px");
}
