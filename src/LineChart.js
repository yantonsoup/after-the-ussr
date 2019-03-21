import d3 from "d3";
import chroma from "chroma-js";

import { sovietCountryIsoCodes, colors } from "./constants";
import { createChromaData } from "./utils";
export default class LineChart {
  constructor(opts) {
    this.data = opts.data;
    // load in arguments from config object
    this.element = opts.element;
    this.headerElement = opts.headerElement;
    this.margins = {
      top: 15,
      right: 40,
      bottom: 100,
      left: 64
    };

    // create the chart
    this.draw();
  }

  draw() {
    const halfPageHeight = Math.floor(window.innerHeight) / 2;

    const boundingBox = d3
      .select(this.element)
      .node()
      .getBoundingClientRect();

    const { width } = boundingBox;

    this.width = width - this.margins.left - this.margins.right;
    this.height = halfPageHeight - this.margins.top - this.margins.bottom;

    this.setXScale();
    this.setYScale();
    this.setXAxis();
    this.setYAxis();

    this.makeLine();
    this.appendContainer();

    this.paintIt();
    this.hideIt();
  }

  hideIt() {
    d3.select(this.element).style("opacity", 0);
    d3.select(this.headerElement).style("opacity", 0);
  }

  revealIt() {
    d3.select(this.element)
      .transition()
      .duration(500)
      .style("opacity", 1);
    d3.select(this.headerElement)
      .transition()
      .duration(500)
      .style("opacity", 1);
  }

  setYScale() {
    this.yScale = d3.scale.linear().range([this.height, 0]);
  }

  setXScale() {
    this.xScale = d3.time.scale().range([0, this.width]);
  }

  setXAxis() {
    this.xAxis = d3.svg
      .axis()
      .scale(this.xScale)
      .ticks(5)
      .innerTickSize(15)
      .outerTickSize(0)
      .orient("bottom");
  }

  setYAxis() {
    this.yAxis = d3.svg
      .axis()
      .scale(this.yScale)
      // .tickFormat(function(population) {
      //   console.warn({ population });
      //   const millionsDigits = Math.floor(population / 1000000).toString();
      //   return millionsDigits;
      // })
      .ticks(10)
      // .innerTickSize(15)
      .outerTickSize(0)
      .orient("left");
  }

  makeLine(property) {
    this.line = d3.svg
      .line()
      .interpolate("basis")
      .x(function(d) {
        return this.xScale(d.date);
      })
      .y(function(d) {
        console.warn("makeLine d", d[property]);
        return this.yScale(d[property]);
      });
  }

  appendContainer() {
    this.svg = d3
      .select(".line-graphic")
      .append("svg")
      .attr("width", this.width + this.margins.left + this.margins.right)
      .attr("height", this.height + this.margins.top + this.margins.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.margins.left + "," + this.margins.top + ")"
      );
  }

  paintIt() {
    const color = d3.scale.category10();
    const parseDate = d3.time.format("%Y").parse;

    console.warn("this.data", this.data);

    this.data.forEach(function(d) {
      d.date = parseDate(d.date);
      d.population = +d.pop;
      d.fertility = +d.fertility;
      d.mortality = +d.mortality;
    });

    color.domain(
      d3.keys(this.data[0]).filter(function(key) {
        return key !== "date";
      })
    );

    this.propertyLines = color.domain().map(name => {
      console.warn("name", name);
      return {
        name,
        values: this.data
      };
    });

    console.warn("propertyLines", this.propertyLines);

    // set scales according to data
    this.xScale.domain(
      d3.extent(this.data, function(d) {
        return d.date;
      })
    );

    this.svg
      .append("g")
      .attr("class", "x axis")
      .attr("fill", "lightgoldenrodyellow")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);

    this.svg
      .selectAll(".property-line")
      .data(this.propertyLines)
      .enter()
      .append("g")
      .attr("class", "property-line");

    // this.drawLine('mortality', [0, 20])
    // this.drawLine('fertility', [0, 20])
  }

  fadeOutPreviousLine() {
    this.svg
      .select(".y-axis")
      .transition()
      .duration(500)
      .style("opacity", "0");

    this.svg
      .select(".property-line")
      .remove()
    
    this.path.remove()
      // .transition()
      // .duration(500)
      // .style("opacity", "0");
  }

  drawLine(property, domain) {
    this.yScale.domain(domain);

    this.svg
      .append("g")
      .attr("class", "y-axis")
      .attr("fill", "lightgoldenrodyellow")
      .call(this.yAxis)
      .transition()
      .duration(500)
      .style("opacity", "1");

    this.svg.append("line").attr({
      class: "horizontalGrid",
      x1: 0,
      x2: this.width,
      y1: this.yScale(0),
      y2: this.yScale(0)
    });

    this.path = this.svg
      .selectAll(".property-line")
      .append("path")
      .attr("class", "line")
      .attr("d", d => {
        console.warn("making line path d", d);
        this.makeLine(property);
        return this.line(d.values);
      })
      .attr({
        fill: "none",
        stroke: "#BAB4AC",
        "stroke-width": "3px",
        "stroke-dasharray": "3, 3",
        "shape-rendering": "crispEdges"
      });
      // .transition()
      // .duration(500)
      // .style("opacity", "1");
  }
}
