import d3 from "d3";
import { createChromaData } from "./utils";

import {
  sovietCountryIsoCodes,
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

    
      this.animateSectionStyles({
        duration: 500,
        section: ".soviet-country",
        styles: {
          opacity: "1",
          fill: "#d0d0d0",
          stroke: "#d0d0d0",
          'stroke-opacity': "0.7"
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

  removeLabels() {
    this.mapGraphic.selectAll(".place-label").remove();
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

  clearArrows() {
    this.mapGraphic.selectAll(".centroid").remove();
    this.mapGraphic.selectAll(".arc").remove();
    this.mapGraphic.selectAll(".arrow-head").remove();
  }

  animateArrowFromTo(
    originId = "USA",
    destinationId = "RUS",
    arrowColor = "#000",
    arrowWidth = 0.3,
    arrowHeadSize = 3,
    curveoffset = 15,
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

    if (originId === "USA") {
      origin[0] += 15;
      origin[1] += 15;
    } else if (destinationId === "USA") {
      destination[0] += 15;
      destination[1] += 15;
    }

    console.warn("from", originId, "at", origin);
    console.warn("to", destinationId, "at", destination);
    const arcData = [
      {
        origin,
        destination
      }
    ];

    // create circle
      this.mapGraphic
        .selectAll("centroid")
        .data(arcData)
        .enter()
        .append("circle")
        .attr("class", "centroid")
        .attr("fill", "#000")
        .attr("r", "0.3px")
        .attr("cx", function({origin}) {
          return origin[0];
        })
        .attr("cy", function({origin}) {
          return origin[1];
        });
    //

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
      .style({
        fill: "none",
        "stroke-width": arrowWidth + "px",
        stroke: arrowColor,
        opacity: "1"
      });

    const arcPath = arc.node();
    const totalLength = arcPath.getTotalLength();

    arc
      .transition()
      .duration(2000)
      .ease("linear")
      .attrTween("stroke-dasharray", function() {
        return d3.interpolateString(
          "0," + totalLength,
          totalLength + "," + totalLength
        );
      });

    this.animateArrowHead(arc, arrowColor, arrowHeadSize);
  }

  animateArrowHead(path, arrowColor, arrowHeadSize) {
    var arrow = this.mapGraphic
      .append("svg:path")
      .attr('class', 'arrow-head')
      .attr(
        "d",
        d3.svg
          .symbol()
          .type("triangle-down")
          .size(arrowHeadSize)
      )
      .attr("fill", arrowColor);

    arrow
      .transition()
      .duration(2000)
      .ease("linear")
      .attrTween("transform", this.translateAlong(path.node()));
    //.each("end", transition);
  }

  translateAlong(path) {
    var l = path.getTotalLength();
    var ps = path.getPointAtLength(0);
    var pe = path.getPointAtLength(l);
    var angl = Math.atan2(pe.y - ps.y, pe.x - ps.x) * (180 / Math.PI) - 90;
    var rot_tran = "rotate(" + angl + ")";
    return function(d, i, a) {
      console.log(d);

      return function(t) {
        var p = path.getPointAtLength(t * l);
        return "translate(" + p.x + "," + p.y + ") " + rot_tran;
      };
    };
  }
}
