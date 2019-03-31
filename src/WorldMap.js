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

const internationalOriginIdList = ["DEU", "ISR", "USA"];

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
        if (internationalOriginIdList.includes(datapoint.id)) {
          return "intl-country country";
        }
        if (datapoint.id === "RUS") {
          return "soviet-country country";
        }
        if (sovietCountryIsoCodes.includes(datapoint.id)) {
          return "soviet-country fsu-state country";
        }
        return "non-soviet-country country";
      })
      .style("display", function(datum) {
        if (datum.id === "ATA") {
          console.warn("ATA");
          return "none";
        }
      });

    this.applyInitialHighlight();
  }

  applyInitialHighlight() {
    this.animateSectionStyles({
      duration: 500,
      section: ".soviet-country",
      styles: {
        opacity: "1",
        fill: "#d0d0d0",
        stroke: "none"
      }
    });

    this.animateSectionStyles({
      duration: 500,
      section: ".non-soviet-country,.intl-country",
      styles: {
        opacity: "0.5",
        fill: "#d0d0d0",
        stroke: "none"
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

  hideLabels() {
    this.animateSectionStyles({
      duration: 500,
      section: ".place-label",
      styles: {
        opacity: 0
      }
    });
  }

  // revealLabels() {
  //   this.animateSectionStyles({
  //     duration: 500,
  //     section: ".place-label",
  //     styles: {
  //   });
  // }

  removeLabels() {
    this.mapGraphic.selectAll(".place-label").remove();
  }

  // TODO: find a better way to shift labels
  createLabels() {
    this.mapGraphic
      .selectAll(".place-label")
      .data(this.sovietDataPoints)
      .enter()
      .append("text")
      .attr("class", d => `place-label ${d.id}-place-label`)
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
      .style("font-size", 3.5 + "px");
    // .style("color", 'lightgoldenrodyellow');
    // .style("fill", "white")
  }

  createCountryLabel(countryId, labelShift = [0, 0], fontSize = 3.5) {
    const countryData = this.data.filter(country => country.id === countryId);

    console.warn("///creating country label///");
    console.warn({ countryId });
    console.warn({ countryData });
    console.warn("///----------------------///");

    this.mapGraphic
      .selectAll(`${countryId}-place-label`)
      .data(countryData)
      .enter()
      .append("text")
      .attr("class", `place-label ${countryId}-place-label`)
      .attr("transform", d => {
        console.warn("transform", d);
        const [x, y] = this.path.centroid(d);
        return `translate(${x},${y})`;
      })
      .attr("x", labelShift[0])
      .attr("y", labelShift[1])
      .text(d => {
        console.warn("d", d);
        return d.properties.name;
      })
      .style("font-size", fontSize + "px");
    // .style("color", 'lightgoldenrodyellow');
    // .style("fill", "white")
  }

  createPopulationChoropleth(populationData, selection, colorRangeOverride) {
    const chromaDataCodes = createChromaData(
      populationData,
      colorRangeOverride
    );

    d3.selectAll(selection)
      .transition()
      .duration(1000)
      .style("opacity", "1")
      .style("fill", d => chromaDataCodes[d.id])
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

  clearArrows() {
    this.animateSectionStyles({
      duration: 100,
      section: "circle",
      styles: {
        opacity: "0"
      }
    });

    this.mapGraphic.selectAll(".arc").remove();
  }

  animateArrowFromTo(
    originId = "USA",
    destinationId = "RUS",
    arrowColor = "#7772a8",
    arrowWidth = 0.5
  ) {
    const originDataPoint = this.data.find(country => country.id === originId);
    const destinationDataPoint = this.data.find(
      country => country.id === destinationId
    );

    let origin = this.path.centroid(originDataPoint);
    let destination = this.path.centroid(destinationDataPoint);

    if (originId === "RUS") {
      origin[0] -= 40;
      origin[1] += 11;
    } else if (destinationId === "RUS") {
      destination[0] -= 40;
      destination[1] += 11;
    }

    // console.warn("from", originId, "at", origin);
    // console.warn("to", destinationId, "at", destination);
    const arcData = [
      {
        origin,
        destination
      }
    ];

    const arcStyles = {
      fill: "none",
      "stroke-width": arrowWidth + "px",
      stroke: arrowColor,
      opacity: "1"
    };

    const arc = this.mapGraphic
      .append("g")
      .selectAll("path.datamaps-arc")
      .data(arcData);

    arc
      .enter()
      .append("path")
      .attr("class", "arc")
      .attr("id", origin => `arc-${origin.id}`)
      .attr("d", ({ origin, destination }) => {
        const mid = [
          (origin[0] + destination[0]) / 2,
          (origin[1] + destination[1]) / 2
        ];

        // define handle points for Bezier curves. Higher values for curveoffset will generate more pronounced curves.
        const curveoffset = 15;
        const midcurve = [mid[0], mid[1] - curveoffset];

        const linePath =
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
          destination[0] +
          "," +
          destination[1];

        return linePath;
      })
      .style(arcStyles);

    const arcPath = arc.node();
    const totalLength = arcPath.getTotalLength();

    arc.transition(5000).attrTween("stroke-dasharray", function() {
      return d3.interpolateString(
        "0," + totalLength,
        totalLength + "," + totalLength
      );
    });
  }
}
