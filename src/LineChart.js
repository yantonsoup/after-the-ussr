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

    // create the other stuff
    this.setXScale();
    this.setYScale();
    this.setXAxis();
    this.setYAxis();

    this.makeLine();
    this.appendContainer();

    this.paintIt();
    this.hideIt();
    // this.hideAllElements();
  }

  hideIt() {
    d3.select(this.element).style('opacity', 0)
    d3.select(this.headerElement).style('opacity', 0)
  }

  revealIt() {
    d3.select(this.element).transition().duration(500).style('opacity', 1)
    d3.select(this.headerElement).transition().duration(500).style('opacity', 1)
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
      .tickFormat(function(population) {
        console.warn({population})
        const millionsDigits = Math.floor(population/1000000).toString()
        return millionsDigits;
      })
      .ticks(10)
      // .innerTickSize(15)
      .outerTickSize(0)
      .orient("left");
  }

  makeLine() {
    this.line = d3.svg
      .line()
      .interpolate("basis")
      .x(function(d) {
        return this.xScale(d.date);
      })
      .y(function(d) {
        return this.yScale(d.population);
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
    const data = this.data
      console.warn("data", data);

      const parseDate = d3.time.format("%Y").parse;

      data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.population = +d.pop
        d.fertility = +d.fertility;
        d.mortality = +d.mortality;
      });

      const color = d3.scale.category10();

      color.domain(
        d3.keys(data[0]).filter(function(key) {
          return key !== "date";
        })
      );
      
      const propertyLines = color.domain().map(function(name) {
        console.warn('name', name)
        return {
          name,
          values: data
        }
      });

      console.warn("propertyLines", propertyLines);

      // set scales according to data
      this.xScale.domain(
        d3.extent(data, function(d) {
          return d.date;
        })
      );

      this.yScale.domain([130000000, 150000000]);

      this.svg
        .append("g")
        .attr("class", "x axis")
        .attr("fill", 'lightgoldenrodyellow')
        .attr("transform", "translate(0," + this.height + ")")
        .call(this.xAxis);

      this.svg
        .append("g")
        .attr("class", "y axis")
        .attr("fill", 'lightgoldenrodyellow')
        .call(this.yAxis);

      this.svg.append("line").attr({
        class: "horizontalGrid",
        x1: 0,
        x2: this.width,
        y1: this.yScale(0),
        y2: this.yScale(0)
      });

      this.svg
        .selectAll(".population")
        .data(propertyLines)
        .enter()
        .append("g")
        .attr("class", "population");

      this.path = this.svg
        .selectAll(".population")
        .append("path")
        .attr("class", "line")
        .attr("d", d => {
          console.warn('making line path d', d)
          return this.line(d.values);
        })
        .attr({
          fill: "none",
          "shape-rendering" : "crispEdges",
          stroke: "#BAB4AC",
          "stroke-width" : "3px",
          "stroke-dasharray": ("3, 3")
        })
  }
}
