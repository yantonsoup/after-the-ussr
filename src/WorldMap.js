import d3 from "d3";
import { createChromaData } from "./utils";

import {
  sovietCountryIsoCodes,
  populationsIn1989millions,
  primaryReceivingIsoCodes,
  colors,
  sovietLabelShift
} from "./constants";

const rotate = -20;
const maxlat = 83;

export default class WorldMap {
  constructor(opts) {
    this.data = opts.data;
    this.sovietDataPoints = opts.data.filter(country =>
      sovietCountryIsoCodes.includes(country.id)
    );
    this.element = opts.element;
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

    this.width = boundingBox.width;
    this.height = boundingBox.height;

    // define width, height and margin
    this.projection = d3.geo
      .mercator()
      .rotate([rotate, 0])
      .scale(1) // we'll scale up to match viewport shortly.
      .translate([this.width / 2, this.height / 2]);

    this.initialScale = this.getInitialScale();
    this.projection.scale(this.initialScale);
    this.path = d3.geo.path().projection(this.projection);

    const svg = d3
      .select(this.element)
      .append("svg")
      .attr("width", this.width)
      .attr("height", this.height);

    this.mapGraphic = svg.append("g").attr("id", "map");

    // TODO: give russia a seperate handle from others
    this.mapGraphic
      .selectAll("path")
      .data(this.data)
      .enter()
      .append("path")
      .attr("d", this.path)
      .style("stroke-width", 0.35 + "px")
      .attr("class", "country")
      .attr("id", function(d, i) {
        return d.id;
      })
      .attr("class", function(datapoint, i) {
        if (datapoint.id === "RUS") {
          return "soviet-country"
        } if (sovietCountryIsoCodes.includes(datapoint.id)) {
          return "soviet-country fsu-state";
        } else {
          return "non-soviet-country";
        }
      })
      .style("display", function(datum) {
        if (datum.id === "ATA") {
          console.warn("ATA");
          return "none";
        }
      });

    this.applyInitialHighlight()
  }

  applyInitialHighlight() {
    // this.mapGraphic.selectAll(".soviet-country").style("fill", "#d0d0d0");
    // this.mapGraphic.selectAll(".soviet-country").style("fill", "lightgoldenrodyellow");
    // this.mapGraphic.selectAll(".soviet-country").style("fill", "#fcd116");

    this.animateSectionStyles({
      duration: 500,
      section: ".soviet-country",
      styles: {
        opacity: "1",
        fill: "#BAB4AC",
      }
    });

    this.animateSectionStyles({
      duration: 500,
      section: ".non-soviet-country",
      styles: {
        opacity: "0.5",
        fill: "#d0d0d0",
      }
    });

  }

  getInitialScale() {
    const b = this.getMercatorBounds(this.projection);
    const s = this.width / (b[1][0] - b[0][0]);
    const scaleExtent = [s, 10 * s];
    return scaleExtent[0];
  }

  animateSectionStyles({ duration, section, styles, delay = 0 } = {}) {
    d3.select(this.element)
      .selectAll(section)
      .transition()
      .delay(delay)
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
      .attr("class", 'place-label')
      // .attr("class", d => `${d.id}-place-label` )
      .attr("transform", d => {
        const [x, y] = this.path.centroid(d);
        return `translate(${x},${y})`;
      })
      .attr("x", function({ id }) {
        const { x } = sovietLabelShift[id];

        return `${x}px`;
      })
      .attr("y", function({ id }) {
        const { y } = sovietLabelShift[id];

        return `${y}px`;
      })
      .text(function(d) {
        return d.properties.name;
      })
      .style("font-size", 3.5 + "px")
      // .style("color", 'lightgoldenrodyellow');
    // .style("fill", "white")
  }

  createPopulationChoropleth(populationData) {
    const chromaDataCodes = createChromaData(populationData);

    console.warn('WORLDMAP', { chromaDataCodes });
    Object.values(chromaDataCodes).forEach(color => console.log('%ccolor code',  `background: ${color}; color: ${color}`))

    d3.selectAll(".fsu-state")
      .transition()
      .duration(1000)
      .style("fill", function(d, i) {
        return chromaDataCodes[d.id];
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
    const centroidsWithValues = this.sovietDataPoints
      .filter(({ id }) => id !== "RUS")
      .map(country => this.path.centroid(country));

    // console.warn("centroidsWithValues", centroidsWithValues);
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
        // console.warn({datum})

        const curveoffset = 15;
        const origin = [datum[0], datum[1]];
        const dest = russiaCoordinates;
        const mid = [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2];

        //define handle points for Bezier curves. Higher values for curveoffset will generate more pronounced curves.
        const midcurve = [mid[0], mid[1] - curveoffset];

        // move cursor to origin
        // define the arrowpoint: the destination, minus a scaled tangent vector, minus an orthogonal vector scaled to the datum.trade variable

        // move cursor to origin
        return (
          "M" +
          origin[0] +
          "," +
          origin[1] +
          // smooth curve to offset midpoint
          "S" +
          midcurve[0] +
          "," +
          midcurve[1] +
          //smooth curve to destination
          "," +
          dest[0] +
          "," +
          dest[1]
        );
      })
      .style("fill", "none")
      .style("stroke-width", "0.5px")
      .style("stroke", "#7772a8")
      .style("opacity", "0")
      .transition()
      .duration(1000)
      .style("opacity", "1");
  }
  
  highlightInternationalCountries(migrationAbroadDestination1995to2002) {
    const chromaDataCodes = createChromaData(migrationAbroadDestination1995to2002);
    console.warn('highlightInternationalCountries, chromaDataCodes', chromaDataCodes)
    this.mapGraphic
      .select("#ISR")
      .style("opacity", "1")
      .style("fill", `${chromaDataCodes['ISR']}`);

    this.mapGraphic
      .select("#DEU")
      .style("opacity", "1")
      .style("fill", `${chromaDataCodes['DEU']}`);

    this.mapGraphic
      .select("#USA")
      .style("opacity", "1")
      .style("fill", `${chromaDataCodes['USA']}`);
  }

  highlightInternationalLines() {
    const russiaCoordinates = [215, 110];

    const receivingCentroids = this.data
      .filter(({ id }) => primaryReceivingIsoCodes.includes(id))
      .map(country => {
        return {
          id: country.id,
          centroid: this.path.centroid(country)
        };
      });

    const receivingArcs = this.mapGraphic
      .append("g")
      .selectAll("path.datamaps-arc")
      .data(receivingCentroids);

    const curveOffsets = [50, 25, 15];
    // 0 => usa
    // 1 => israel
    // 2 => germany

    receivingArcs
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("id", fulldatum => {
        return "arc-" + fulldatum.id;
      })
      .attr("d", (fulldatum, index) => {
        const datum = fulldatum.centroid;
        console.warn("arc datum", datum);
        console.warn("arc fulldatum", fulldatum);

        const curveoffset = 45;
        const origin = [datum[0], datum[1]];
        const dest = russiaCoordinates;
        const mid = [(origin[0] + dest[0]) / 2, (origin[1] + dest[1]) / 2];

        //define handle points for Bezier curves. Higher values for curveoffset will generate more pronounced curves.
        const midcurve = [mid[0], mid[1] - curveOffsets[index]];

        // move cursor to origin
        // define the arrowpoint: the destination, minus a scaled tangent vector, minus an orthogonal vector scaled to the datum.trade variable

        // move cursor to origin
        return (
          "M" +
          origin[0] +
          "," +
          origin[1] +
          // smooth curve to offset midpoint
          "S" +
          midcurve[0] +
          "," +
          midcurve[1] +
          //smooth curve to destination
          "," +
          dest[0] +
          "," +
          dest[1]
        );
      })
      .style("fill", "none")
      .style("stroke-width", "0.5px")
      .style("stroke", "#7772a8")
      .style("opacity", "0")
      .transition()
      .duration(1000)
      .style("opacity", "1");
  }
}
