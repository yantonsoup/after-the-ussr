import d3 from "d3";
import chroma from "chroma-js";

import { sovietCountryIsoCodes, colors } from "./constants";
import { createChromaData } from "./utils";
export default class LineChart {
  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data;
    this.sovietDataPoints = opts.data.filter(country =>
      sovietCountryIsoCodes.includes(country.id)
    );
    this.element = opts.element;
    this.margins = {
      top: 15,
      right: 40,
      bottom: 60,
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
    this.yScale = d3.scale.linear()
    .range([this.height, 0]);
  }

  setXScale() {
    this.xScale = d3.time.scale()
      .range([0, this.width]);
  }


  setXAxis() {
    this.xAxis = d3.svg.axis()
    .scale(this.xScale)
    .ticks(5)
    .innerTickSize(15)
    .outerTickSize(0)
    .orient("bottom");
  }

  setYAxis() {
    this.yAxis = d3.svg.axis()
    .scale(this.yScale)
    .tickFormat(function(d) { return d + "%";})
    .ticks(5)
    .innerTickSize(15)
    .outerTickSize(0)
    .orient("left");
  }

  makeLine() {
    this.line = d3.svg.line()
      .interpolate("basis")
      .x(function(d) { return this.xScale(d.date); })
      .y(function(d) { return this.yScale(d.population); })
  }

  appendContainer() {
    this.svg = d3
      .select(".line-graphic")
      .append("svg")
      .attr("width", this.width + this.margins.left + this.margins.right)
      .attr("height", this.height + this.margins.top + this.margins.bottom)
      .append("g")
      .attr("transform", "translate(" + this.margins.left + "," + this.margins.top + ")");
  }


  paintIt() {
    const parseDate = d3.time.format("%Y").parse;

    // "%Y-%m-%d" 
    const color = d3.scale.category10();
    console.warn({color})
  
    d3.tsv("./data.tsv", (error, data) => {
      console.warn('data', data)
      color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));
    
      data.forEach(function(d) {
        d.date = parseDate(d.date);
        console.warn('parsed data', d.date)
      });
    
      const companies = color.domain().map(function(name) {
        console.warn('name', name)
        return {
          values: data.map(function(d) {
            // console.warn('d', d)
            return {date: d.date, population: +d[name]};
          })
        };
      });
      console.warn('companies', companies)
    
      this.xScale.domain(d3.extent(data, function(d) { return d.date; }));
    
      this.yScale.domain([
        d3.min(companies, function(c) { return d3.min(c.values, function(v) { return v.population; }); }),
        d3.max(companies, function(c) { return d3.max(c.values, function(v) { return v.population; }); })
      ]);
    
      this.svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + this.height + ")")
          .call(this.xAxis);
    
      this.svg.append("g")
          .attr("class", "y axis")
          .call(this.yAxis);
    
    
      this.svg.append("line")
            .attr(
            {
                "class":"horizontalGrid",
                "x1" : 0,
                "x2" : this.width,
                "y1" : this.yScale(0),
                "y2" : this.yScale(0),
            })
    
    
      const company = this.svg.selectAll(".company")
          .data(companies)
          .enter().append("g")
          .attr("class", "company");
    
    
      this.path = this.svg.selectAll(".company").append("path")
          .attr("class", "line")
          .attr("d", (d) => { return this.line(d.values); })
          .attr( {
            "fill" : "none",
            // "shape-rendering" : "crispEdges",
            "stroke" : "white",
            // "stroke-width" : "2px",
            // "stroke-dasharray": ("3, 3")
        })
        .style("stroke", function(d) { return "rgb(000,255,000)" })

    
    
    
      //var totalLength = path.node().getTotalLength();
    /*
    console.log(path);
    console.log(path.node());
    console.log(path[0][0]);
    console.log(path[0][1]);
    */
    const totalLength = [this.path[0][0].getTotalLength(), this.path[0][1].getTotalLength()];
    
    console.warn('totalLength', totalLength);
    
    
       d3.select(this.path[0][0])
          .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0] ) 
          .attr("stroke-dashoffset", totalLength[0])
          .transition()
            .duration(5000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);
    
       d3.select(this.path[0][1])
          .attr("stroke-dasharray", totalLength[1] + " " + totalLength[1] )
          .attr("stroke-dashoffset", totalLength[1])
          .transition()
            .duration(5000)
            .ease("linear")
            .attr("stroke-dashoffset", 0);
    
    });
  }


















//////////////////////////////////////////////////
//////////////////////////////////////////////////

  drawTitle(text, units) {
    this.textHeader = d3.select(".bar-graphic-header-text");
    this.textHeader.text(text);

    this.textHeaderUnits = d3.select(".bar-graphic-header-units");
    this.textHeaderUnits.text(units);
  }

  redrawYAxes() {
    const yAxisStuff = d3.svg
      .axis()
      .scale(this.yScale)
      .tickSize(0)
      .orient("left");

    this.plot.select(".y-axis").call(yAxisStuff);
  }




  repaintChart(data) {
    this.setXScale(data);
    this.setYScale(data);
    this.bindDataToBars(data);
    this.redrawBars(data);
    this.redrawLabels(data);
    this.redrawYAxes(data);
  }

  paintHiddenBars(data) {
    const chromaDataCodes = createChromaData(data);

    this.bars
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => {
        return this.yScale(d.name);
      })
      .attr("height", () => this.yScale.rangeBand())
      .attr("fill", (d, i) => chromaDataCodes[d.name]);
  }


  clearBars() {
    this.plot
      .selectAll("rect")
      .remove()
  }


  redrawBarsWith3DataPoints(data) {
    this.clearBars()

    this.bindDataToBars(data);

    this.xScale = d3.scale
      .linear()
      .range([0, this.width])
      .domain([0, 100]);


    this.yScale = d3.scale
      .ordinal()
      .rangeRoundBands([this.height/4, 0], 0.1)
      .domain(
        data.map(function(d) {
          return d.name;
        })
      );

    const chromaDataCodes = createChromaData(data);

    this.bars
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => {
        return this.yScale(d.name);
      })
      .attr("height", () => this.yScale.rangeBand())
      .attr("width", d => {
        return this.xScale(d.population);
      })
      .attr("fill", (d, i) => chromaDataCodes[d.name]);
    
    this.redrawYAxes(data);

    this.redrawPercentLabels(data);
  }

  bindDataToBars(data) {
    this.bars = this.plot
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("g");
  }

  redrawBars(data) {
    const chromaDataCodes = createChromaData(data);

    d3.selectAll("rect")
      .data(data)
      .transition()
      .delay(function(d, i) {
        return i * 50;
      })
      .attr("width", d => {
        return this.xScale(d.population);
      })
      .attr("fill", (d, i) => chromaDataCodes[d.name]);
  }

  redrawPercentLabels(data) {
    this.plot
      .selectAll(".label")
      .transition()
      .duration(500)
      .style("opacity", "0");

    this.plot
      .select("g")
      .selectAll(".text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("y", d => {
        return this.yScale(d.name);
      })
      .attr("x", d => {
        return this.xScale(d.population);
      })
      .attr("dx", ".75em")
      .text(function(datum) {
        return datum.population + "%";
      })
      .attr("transform", "translate(" + 0 + "," + this.barMargin.top + ")");
  }

  redrawLabels(data) {
    this.plot.selectAll(".label").remove();

    this.plot
      .select("g")
      .selectAll(".text")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("y", d => {
        return this.yScale(d.name);
      })
      .attr("x", d => {
        return this.xScale(d.population);
      })
      .attr("dx", ".75em")
      .text(function(datum) {
        return parseMillionsPopulationText(datum);
      })
      .style("font-weight", 600)
      .attr("transform", "translate(" + 0 + "," + this.barMargin.top + ")");
  }

  addPopulationLabels(data) {
    this.redrawLabels(data);

    this.plot
      .selectAll(".label")
      .style("opacity", "0")
      .transition()
      .delay(500)
      .duration(500)
      .style("opacity", "1");
  }


  hideAllElements() {
    this.plot
    .transition()
    .delay(500)
    .style("opacity", "0");

    d3.select(".bar-graphic-header")
      .transition()
      .delay(500)
      .style("opacity", "0")
  }

  revealBarChart() {
    this.plot
      .transition()
      .delay(500)
      .style("opacity", "1");

    d3.select(".bar-graphic-header")
      .transition()
      .delay(500)
      .style("opacity", "1")
      .style("color", "black");
  }
}

function parseMillionsPopulationText(datum) {
  const populationText = datum.population;

  return `${populationText}`;
}

function parsePopulationText(datum) {
  const { population, name } = datum;
  const populationText = (population / 1000000).toFixed(2);

  return populationText;
}
