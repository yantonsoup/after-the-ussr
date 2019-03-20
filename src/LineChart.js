import d3 from "d3";
import chroma from "chroma-js";

import { sovietCountryIsoCodes, colors } from "./constants";
import { createChromaData } from "./utils";
export default class LineChart {
  constructor(opts) {
    // load in arguments from config object
    this.element = opts.element;
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
    const boundingBox = d3
      .select(this.element)
      .node()
      .getBoundingClientRect();

    const { width } = boundingBox;

    const halfPageHeight = Math.floor(window.innerHeight) / 2;

    this.width = width - this.margins.left - this.margins.right;
    this.height = halfPageHeight - this.margins.top - this.margins.bottom;

    // create the other stuff
    this.setXScale();
    this.setYScale();
    this.setXAxis();
    this.setYAxis();

    this.makeLine();
    this.appendContainer();

    this.paintIt(this.data);

    // this.hideAllElements();
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
    d3.tsv("./russia.tsv", (error, data) => {
      console.warn("data", data);

      const parseDate = d3.time.format("%Y").parse;

      data.forEach(function(d) {
        d.date = parseDate(d.date);
      });

      const color = d3.scale.category10();

      color.domain(
        d3.keys(data[0]).filter(function(key) {
          return key !== "date";
        })
      );
      
      const populations = color.domain().map(function(name) {
        console.warn('name', name)
        return {
          values: data.map(function(d) {
            return { date: d.date, population: +d[name] };
          })
        };
      });

      console.warn("populations", populations);

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

      const company = this.svg
        .selectAll(".company")
        .data(populations)
        .enter()
        .append("g")
        .attr("class", "company");

      this.path = this.svg
        .selectAll(".company")
        .append("path")
        .attr("class", "line")
        .attr("d", d => {
          return this.line(d.values);
        })
        .attr({
          fill: "none",
          "shape-rendering" : "crispEdges",
          stroke: "lightgoldenrodyellow",
          "stroke-width" : "3px",
          "stroke-dasharray": ("3, 3")
        })

    });
  }
}

/*


      var totalLength = this.path.node().getTotalLength();
      console.log(this.path);
      console.log(this.path.node());
      console.log(this.path[0][0]);
      console.log(this.path[0][1]);
      
      const totalLength = [
        this.path[0][0].getTotalLength(),
        this.path[0][1].getTotalLength()
      ];

      console.warn("totalLength", totalLength);

      d3.select(this.path[0][0])
        .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0])
        .attr("stroke-dashoffset", totalLength[0])
        .transition()
        .duration(5000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

      d3.select(this.path[0][1])
        .attr("stroke-dasharray", totalLength[1] + " " + totalLength[1])
        .attr("stroke-dashoffset", totalLength[1])
        .transition()
        .duration(5000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);
*/