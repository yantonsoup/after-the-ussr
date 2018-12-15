
export default function getSizes() {
	
	var graphic = d3.select(".scroll").select(".scroll__graphic");
  var text = d3.select(".scroll").select(".scroll__text");
  var body = d3.select("body");

	var step = text.selectAll(".step");
	
	var bodyWidth = body.node().offsetWidth;
	var textWidth = text.node().offsetWidth;
	
	var stepHeight = Math.floor(window.innerHeight * 0.75);
	
	var graphicMargin = 16 * 4; // 64px
	var graphicWidth = d3.select(".scroll").node().offsetWidth - graphicMargin;
	const mapwidth = graphic.node().offsetWidth;
	const graphicHeight = graphicWidth;
	// var graphicHeight = Math.floor(window.innerHeight / 2.4);
	console.warn({ graphicHeight });
	
	var graphicMarginTop = Math.floor(window.innerHeight * 0.25);
	
	step.style("height", window.innerHeight+"px");
	
	graphic
		.style("width", mapwidth + "px")
		.style("height", mapwidth + "px")
		.style("top", graphicMarginTop + "px");
	// -----------------------------------
	d3.select(".header-container").style("height", 850 + "px")
	d3.select(".ussr-svg-container").style("width", graphicWidth + "px")
	d3.select(".intro-block").style("width", graphicWidth + "px")
	d3.select(".name-block").style("width", graphicWidth + "px")
	d3.select(".ussr-svg").style("height", 200 + "px")
	d3.select(".ussr-svg").style("width", 200 + "px")
	// Animations 
	
	// initializeD3()
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

var projection = d3.geo.mercator()
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
var map
	
}
