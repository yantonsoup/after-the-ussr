var sovietCountryIsoCodes = [ 'ARM', 'AZE', 'BLR', 'EST', 'GEO', 'KAZ', 'KGZ', 'LVA', 'LTU', 'MDA', 'RUS', 'TJK', 'TKM', 'UKR', 'UZB']
var rotate = -20;        // so that [-60, 0] becomes initial center of projection
var maxlat = 83;
var centered;

var mercatorBounds = function (projection, maxlat) {
  var yaw = projection.rotate()[0],
      xymax = projection([-yaw+180-1e-6,-maxlat]),
      xymin = projection([-yaw-180+1e-6, maxlat]);
  
  return [xymin,xymax];
}

var graphicContainer = d3.select(".scroll__graphic");
var graphicContainerSize = graphicContainer.node().getBoundingClientRect()
var width = graphicContainerSize.width
var height = graphicContainerSize.height

projection = d3.geo.mercator()
  .rotate([rotate,0])
  .scale(1) // we'll scale up to match viewport shortly.
  .translate([width/2, height/2])
  // .center([0, 25])

// find the top left and bottom right of current projection
// set up the scale extent and initial scale for the projection
var b = mercatorBounds(projection, maxlat)
var s = width/(b[1][0]-b[0][0])
var scaleExtent = [s, 10*s];

projection.scale(scaleExtent[0]);

var path = d3.geo.path().projection(projection);

var worldGeoJson;
var svg

d3.json("110topoworld.json", function(json) {
  console.warn('loaded 110topoworld.json:', json)

  worldGeoJson = json

  var countrySubunits = topojson.feature(json, json.objects.subunits).features

  svg = d3
    .select(".scroll__graphic")
    .append("svg")
    .attr("width", width)
    .attr("height", height)

   map = svg
    .append("g")
    .attr("id", "map");

  map
    .selectAll("path")
    .data(topojson.feature(json, json.objects.subunits).features)
    .enter()
    .append("path")
    .attr("d", path)
    .style("stroke-width", 0.5 + "px")
    .attr("class", "country")
    .attr("id", function(d, i) {
      return "country" + d.id;
    })
    .attr('class', function(datapoint, i){
      if (sovietCountryIsoCodes.includes(datapoint.id)) {
        return "country soviet-country"
      } else {
        return "country non-soviet-country"
      }
    })
    
    // map.selectAll(".place-label")
    // .data(topojson.feature(json, json.objects.subunits).features)
    // .enter().append("text")
    // .each(function(d) {
    //   console.warn('hi', d)
    //   if (sovietCountryIsoCodes.includes(d.id)) {
    //        d.attr("class", "place-label")
    // .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
    // .attr("dy", ".35em")
    // .text(function(d) { return d.properties.name; });
    var translateX = -Math.floor(graphicWidth * 0.75);
    var translateY = -Math.floor(graphicHeight * 0.4);
  
    // console.warn({ scale });
    // console.warn({ width });
    // console.warn({ height });
    // console.warn({ translateX });
    // console.warn({ translateY });
  
    // d3.select("#map")
    //   .transition()
    //   .duration(1000)
    //   .attr(
    //     "transform",
    //     "translate(" +
    //       width / 2 +
    //       "," +
    //       height / 2 +
    //       ")scale(" +
    //       scale +
    //       ")translate(" +
    //       translateX +
    //       "," +
    //       translateY +
    //       ")"
    //   );
    // map.selectAll(".place-label")
    // .data(topojson.feature(json, json.objects.subunits).features)
    // .enter().append("text")
    // .attr("class", "place-label")
    // .attr("transform", function(d) { 
    //   console.warn('d.geometry.coordinates', d.geometry.coordinates)
    //   return `translate(${width/2},${height/2})`; 
    // })
    // .attr("dy", ".35em")
    // .text(function(d) { 
    //   console.warn('placing d label', d)
    //   // if (sovietCountryIsoCodes.includes(d.id)) {
    //   if (d.id === "EST") {
    //     // console.warn('d.id', d.id)
    //     console.warn('includes and pkacing lable:', d.properties.name)
    //     return d.properties.name; 
    //   }

    //   return null;
    // });

    // map.selectAll(".place-label")
    // .attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
    //   .attr("class", "place-label")
    // .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
    // .attr("dy", ".35em")
    // .text(function(d) { return d.properties.name; })
    // .style("text-anchor", function(d) {
    //   console.warn({d})
    //   return d.geometry.coordinates[0] > -1 ? "start" : "end";
    // });

    // })
  
    
    // d3.select('svg')
    // .selectAll("text")
    // .data(topojson.feature(worldGeoJson, json.objects.places).features)
    // .enter()
    // .append("text")
    // .each(function(d) {
    //   if (sovietCountryIsoCodes.includes(d.id)) {
    //     console.warn('datapoint of soviet', d)
    //     d3.select(this)
    //     .attr("x", function(d) {
    //       return path.centroid(d)[0];
    //     })
    //     .attr("y", function(d) {
    //       return path.centroid(d)[1];
    //     })
    //       .text(function(d) {
    //         return d.properties.ADMIN;
    //       });
    //   }
    // })
});

