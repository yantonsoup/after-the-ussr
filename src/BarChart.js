import d3 from "d3";
import chroma from "chroma-js";

import { sovietCountryIsoCodes } from "./constants";
import { createChromaData } from "./utils";
export default class BarChart {
  constructor(opts) {
    // load in arguments from config object
    this.data = opts.data;
    this.sovietDataPoints = opts.data.filter(country =>
      sovietCountryIsoCodes.includes(country.id)
    );
    this.element = opts.element;
    this.barMargin = {
      top: 15,
      right: 85,
      bottom: 40,
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

    this.width = width - this.barMargin.left - this.barMargin.right;
    this.height = halfPageHeight - this.barMargin.top - this.barMargin.bottom;

    this.paintPlot(this.width, this.height, this.barMargin);

    // create the other stuff
    this.setXScale(this.data);
    this.setYScale(this.data);

    this.bindDataToBars(this.data);
    this.paintHiddenBars(this.data);
    this.addYAxes();

    this.hideAllElements();
  }

  paintPlot(width, height, margins) {
    this.plot = d3
      .select(".bar-graphic")
      .append("svg")
      .attr("width", width + margins.left + margins.right)
      .attr("height", height + margins.top + margins.bottom)
      .append("g")
      .attr("transform", "translate(" + margins.left + "," + margins.top + ")");
  }



  drawTitle(text) {
    this.textHeader = d3.select(".bar-graphic-header-text");
    this.textHeader.text(text);
  }

  redrawYAxes() {
    const yAxisStuff = d3.svg
      .axis()
      .scale(this.yScale)
      .tickSize(0)
      .orient("left");

    this.plot.select(".y-axis").call(yAxisStuff);
  }


  setYScale(data) {
    this.yScale = d3.scale
      .ordinal()
      .rangeRoundBands([this.height, 0], 0.1)
      .domain(
        data.map(function(d) {
          return d.name;
        })
      );
  }

  addYAxes() {
    const yAxisStuff = d3.svg
      .axis()
      .scale(this.yScale)
      //no tick marks
      .tickSize(0)
      .orient("left");

    this.plot
      .append("g")
      .attr("class", "y-axis")
      .call(yAxisStuff)
      .style("fill", "black")
      .style("letter-spacing", "1px")
      .style("font-weight", "400");
  }

  repaintChart(data, units) {
    this.setXScale(data);
    this.setYScale(data);
    this.bindDataToBars(data);
    this.redrawBars(data);
    this.redrawLabels(data, units);
    this.redrawYAxes(data);
  }

  // paintPercentageChart(data) {
  //   this.xScale = d3.scale
  //     .linear()
  //     .range([0, this.width])
  //     .domain([0, 100]);

  //   this.setYScale(data);
  //   this.bindDataToBars(data);
  //   this.redrawBars(data);
  //   this.redrawPercentLabels(data);
  //   this.redrawYAxes(data);
  // }
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

    paintHiddenBars(data) {
      const colorRangeOverride = ['white', 'orange'];

      const chromaDataCodes = createChromaData(data, colorRangeOverride);

      this.bars
        .append("rect")
        .attr("class", "bar")
        .attr("y", d => {
          return this.yScale(d.name);
        })
        .attr("height", () => this.yScale.rangeBand())
        .attr("fill", (d, i) => chromaDataCodes[d.name]);
    }

    redrawBars(data) {
      const chromaDataCodes = createChromaData(data);

      d3.selectAll("rect")
        .data(data)
        .transition()
        .delay(function(d, i) {
          return i * 40;
        })
        .attr("y", d => {
          return this.yScale(d.name);
        })
        .attr("width", d => {
          return this.xScale(d.population);
        })
        .attr("height", () => this.yScale.rangeBand())
        .attr("fill", (d, i) => chromaDataCodes[d.name]);
    }

  setXScale(data) {
    this.xScale = d3.scale
      .linear()
      .range([0, this.width])
      .domain([
        0,
        d3.max(data, function(d) {
          return d.population;
        })
      ]);
  }

  clearBars() {
    this.plot
      .selectAll("rect")
      .remove()
  }


  redrawBarsFromScratch(data) {
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

    const chromaDataCodes = createChromaData(data, ['#ffffb2', '#a1dab4', '#41b6c4']);

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

    this.redrawLabels(data, '%');
  }

  bindDataToBars(data) {
    this.bars = this.plot
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("g");
  }

  redrawLabels(data, units) {
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
        return `${datum.population}${units}`;
      })
      .style("font-weight", 600)
      .style("fill", "lightgoldenrodyellow")
      .attr("transform", "translate(" + 0 + "," + this.barMargin.top + ")");
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
