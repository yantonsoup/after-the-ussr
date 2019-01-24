import { sovietCountryIsoCodes, colors, sovietLabelShift } from "./constants";

const rotate = -20; // so that [-60, 0] becomes initial center of projection
const maxlat = 83;

export default class WorldMap {
  constructor(opts) {
    console.warn("opts.data", opts);
    // load in arguments from config object
    this.data = opts.data;
    this.sovietDataPoints = opts.data.filter(country => sovietCountryIsoCodes.includes(country.id))
    this.element = opts.element;

    const boundingBox = d3
      .select(this.element)
      .node()
      .getBoundingClientRect();

    this.height = boundingBox.height;
    this.width = boundingBox.width;

    // create the chart
    this.draw();
  }

  getMercatorBounds(projection) {
    const yaw = projection.rotate()[0];
    const xymax = projection([-yaw + 180 - 1e-6, -maxlat]);
    const xymin = projection([-yaw - 180 + 1e-6, maxlat]);

    return [xymin, xymax];
  }

  draw() {
    // define width, height and margin
    this.projection = d3.geo
      .mercator()
      .rotate([rotate, 0])
      .scale(1) // we'll scale up to match viewport shortly.
      .translate([this.width / 2, this.height / 2]);

    const b = this.getMercatorBounds(this.projection);
    const s = this.width / (b[1][0] - b[0][0]);
    const scaleExtent = [s, 10 * s];

    this.projection.scale(scaleExtent[0]);
    this.path = d3.geo.path().projection(this.projection);

    const svg = d3
      .select(this.element)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.mapGraphic = svg.append("g").attr("id", "map");

    this.mapGraphic
      .selectAll("path")
      .data(this.data)
      .enter()
      .append("path")
      .attr("d", this.path)
      .style("stroke-width", 0.5 + "px")
      .attr("class", "country")
      .attr("id", function(d, i) {
        return "country" + d.id;
      })
      .attr("class", function(datapoint, i) {
        if (sovietCountryIsoCodes.includes(datapoint.id)) {
          return "country soviet-country";
        } else if (datapoint.id === "ATA") {
          return "transparent-ATA";
        } else {
          return "country non-soviet-country";
        }
      });
  }

  animateSectionStyles({ duration, section, styles }) {
    console.warn({ duration, section, styles });

    d3.select(this.element)
      .selectAll(section)
      .transition()
      .duration(duration)
      .style(styles);
  }

  animateMapZoom({ scale, translateX, translateY, duration }) {
    this.mapGraphic
      .transition()
      .duration(duration)
      .attr(
        "transform",
        `scale(${scale})translate(${translateX},${translateY})`
      );
  }

  placeLabels(){
    this.mapGraphic
      .selectAll(".place-label")
      .data(this.sovietDataPoints)
      .enter()
      .append("text")
      .attr("class", "place-label")
      .attr("transform", (d) => {
        const [x, y] = this.path.centroid(d);

        return `translate(${x},${y})`;
      })
      .attr("dx", function({ id }) {
          const { x } = sovietLabelShift[id];
  
          return `${x}px`;
      })
      .attr("dy", function({ id }) {
          const { y } = sovietLabelShift[id];

          return `${y}px`;
      })
      .text(function(d) {
          return d.properties.name;
      })
      .style("font-size", 3 + "px");
    }
  
}