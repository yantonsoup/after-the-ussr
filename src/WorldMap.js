import { sovietCountryIsoCodes, colors, sovietLabelShift } from "./constants";

const rotate = -20; // so that [-60, 0] becomes initial center of projection
const maxlat = 83;

export default class WorldMap {
  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data;
    this.sovietDataPoints = opts.data.filter(country =>
      sovietCountryIsoCodes.includes(country.id)
    );
    this.element = opts.element;

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
    const boundingBox = d3
      .select(this.element)
      .node()
      .getBoundingClientRect();

    this.height = boundingBox.height;
    this.width = boundingBox.width;

    // define width, height and margin
    this.projection = d3.geo
      .mercator()
      .rotate([rotate, 0])
      .scale(1) // we'll scale up to match viewport shortly.
      .translate([this.width / 2, this.height / 2]);

    this.initialScale = this.getInitialScale();
    console.warn('this.initialScale', this.initialScale)
    this.projection.scale(this.initialScale);
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
        } else {
          return "country non-soviet-country";
        }
      });
  }

  getInitialScale() {
    const b = this.getMercatorBounds(this.projection);
    const s = this.width / (b[1][0] - b[0][0]);
    const scaleExtent = [s, 10 * s];
    return scaleExtent[0]
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

  // TODO: find a better way to shift labels
  createLabels() {
    this.mapGraphic
      .selectAll(".place-label")
      .data(this.sovietDataPoints)
      .enter()
      .append("text")
      .attr("class", "place-label")
      .attr("transform", d => {
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

  // TODO: makethis an actual cloropleth funk
  createPopulationChoropleth() {
    d3.selectAll(".soviet-country")
      .transition()
      .duration(1000)
      .style("fill", function(d, i) {
        // console.warn('i', i)
        return colors[i];
      })
      .style("stroke-width", 0.25 + "px");
  }

  moveMapContainer({ top, duration }) {
    d3.select(this.element)
      .transition()
      .duration(duration)
      .style("top", top + "px");
  }

  addPointsToMap() {
    const centroids = this.sovietDataPoints.map(country => {
      return this.path.centroid(country);
    });

    this.mapGraphic
      .selectAll(".centroid")
      .data(centroids)
      .enter()
      .append("circle")
      .attr("class", ".centroid")
      .attr("fill", "black")
      .attr("r", "0.45px")
      .attr("cx", function(d) {
        return d[0];
      })
      .attr("cy", function(d) {
        return d[1];
      });

    const russiaCoordinates = [235, 110];
    this.mapGraphic
      .selectAll(".russia-centroid")
      .data(russiaCoordinates)
      .enter()
      .append("circle")
      .attr("fill", "white")
      .attr("r", "0.25px")
      .attr("cx", function(d) {
        return d[0];
      })
      .attr("cy", function(d) {
        return d[1];
      });
  }

  drawLabelPointer() {
    const centroidsWithoutRussia = this.sovietDataPoints
      .filter(({ id }) => id !== "RUS")
      .map(country => {
        return this.path.centroid(country);
      });

    console.warn("ayyeee drawing an arrow");
    const russiaCoordinates = [235, 110];

    this.mapGraphic
      .selectAll(".centroid")
      .data(centroidsWithoutRussia)
      .enter()
      .append("line")
      .attr("x1", function(d) {
        return d[0];
      })
      .attr("y1", function(d) {
        return d[1];
      })
      .attr("x2", function(d) {
        return d[0] + 5;
      })
      .attr("y2", function(d) {
        return d[1] + 10;
      })
      .attr("stroke", "black")
      .attr("stroke-width", 0.1)
      .attr("marker-end", "url(#arrow)");
  }

  drawCurves() {
    const russiaCentroids = this.sovietDataPoints.filter(({id}) => id !== 'RUS').map(country => {
      return this.path.centroid(country);
    });
    const centroidsWithValues = russiaCentroids.map((centroid, index) => ({
      trade: index,
      ...centroid,
    }))
  
    console.warn("centroidsWithValues", centroidsWithValues);
    const russiaCoordinates = [235, 110];

    const arcs = this.mapGraphic
      .append("g")
      .selectAll("path.datamaps-arc")
      .data(centroidsWithValues);

    arcs
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("d", (datum, index) => {
        console.warn({datum})

        const curveoffset = 15;
        const origin = [datum[0], datum[1]]
        const dest = russiaCoordinates;
        const mid = [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2];

        //define handle points for Bezier curves. Higher values for curveoffset will generate more pronounced curves.
        const midcurve = [mid[0] , mid[1] - curveoffset];

        // move cursor to origin
        // define the arrowpoint: the destination, minus a scaled tangent vector, minus an orthogonal vector scaled to the datum.trade variable
     
  
        // move cursor to origin
        return "M" + origin[0] + ',' + origin[1] 
        // smooth curve to offset midpoint
          + "S" + midcurve[0] + "," + midcurve[1]
        //smooth curve to destination	
          + "," + dest[0] + "," + dest[1]
      })
      .style('fill', 'none')
      .style('stroke-width', '0.5px')
      .style('stroke', '#7772a8')
      .style('opacity', '0')
      .transition()
      .duration(1000)
      .style('opacity', '1')
  }

  animateWorldSections() {
    this.mapGraphic
      .select('#countryISR')
      .style('opacity', '1')

  }
}
