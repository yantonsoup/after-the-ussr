

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
var graphicContainer = d3.select(".scroll__graphic");
var graphicContainerSize = graphicContainer.node().getBoundingClientRect()
var width = graphicContainerSize.width
var height = graphicContainerSize.height
var centered

var sovietCountryIsoCodes = [ 'ARM', 'AZE', 'BLR', 'EST', 'GEO', 'KAZ', 'KGZ', 'LVA', 'LTU', 'MDA', 'RUS', 'TJK', 'TKM', 'UKR', 'UZB']
var rotate = -20,        // so that [-60, 0] becomes initial center of projection
maxlat = 83;

function mercatorBounds(projection, maxlat) {
  var yaw = projection.rotate()[0],
      xymax = projection([-yaw+180-1e-6,-maxlat]),
      xymin = projection([-yaw-180+1e-6, maxlat]);
  
  return [xymin,xymax];
}

var projection = d3.geo.mercator()
  .rotate([rotate,0])
  .scale(1)           // we'll scale up to match viewport shortly.
  .translate([width/2, height/2])
  // .center([0, 25])
  // .scale(80)
  // .translate([width / 2, height / 2]);
  // .translate([0, 0])
  // .scale(4000);

// find the top left and bottom right of current projection
// set up the scale extent and initial scale for the projection
var b = mercatorBounds(projection, maxlat)
console.warn('b, mercurator bound', b)
var  s = width/(b[1][0]-b[0][0])
var scaleExtent = [s, 10*s];

projection.scale(scaleExtent[0]);
// .scale([w / (2 * Math.PI)]) // scale to fit group width
// .translate([w / 2, h / 2]); // ensure centred in group

var path = d3.geo.path().projection(projection);



var worldGeoJson;
var svg

d3.json("world.json", function(json) {
  worldGeoJson = json

  console.warn({worldGeoJson})
  svg = d3
    .select(".scroll__graphic")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

  var map = svg
    .append("g")
    .attr("id", "map");

  map
    .selectAll("path")
    .data(json.features)
    .enter()
    .append("path")
    .attr("d", path)
    .attr("id", function(d, i) {
      return "country" + d.properties.ISO_A3;
    })
    .attr('class', function(datapoint, i){
      // console.warn('d.properties', d.properties)
      if (sovietCountryIsoCodes.includes(datapoint.properties.ISO_A3)) {
        //  console.warn('soviet datapoint', datapoint)
        return "country soviet-country"
      } else {
        return "country non-soviet-country"
      }
    })
    .style("stroke-width", 0.5 + "px");
    
});

