import d3 from 'd3';
import { sovietCountryIsoCodes, colors } from "./constants";

export default class BarChart {
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

  draw() {
    // define width, height and margin
    const scrollContainer = d3.select(".scroll");
    // const boundingBox = scrollContainer.node().getBoundingClientRect();
    const boundingBox = d3
      .select(this.element)
      .node()
      .getBoundingClientRect();

    const { width } = boundingBox;

    this.barMargin = {
      top: 15,
      right: 85,
      bottom: 40,
      left: 64
    };

    const halfPageHeight = Math.floor(window.innerHeight)/2

    this.width = width - this.barMargin.left - this.barMargin.right;
    this.height = halfPageHeight - this.barMargin.top - this.barMargin.bottom;

    this.paintPlot(this.width, this.height, this.barMargin);

    const headerText = "1989 Soviet State Populations";

    this.drawTitle(headerText, "mil");

    // create the other stuff
    this.setXScale(this.data);
    this.setYScale(this.data);

    this.bindDataToBars(this.data);
    this.paintHiddenBars();
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

  hideAllElements() {
    this.plot.style("opacity", "0");
    d3.select(".bar-graphic-header").style("opacity", "0");
  }

  drawTitle(text, units) {
    this.textHeader = d3.select(".bar-graphic-header-text");
    this.textHeader.text(text);

    this.textHeaderUnits = d3.select(".bar-graphic-header-units");
    this.textHeaderUnits.text(units);
  }

  paintHiddenBars() {
    this.bars
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => {
        return this.yScale(d.name);
      })
      .attr("height", () => this.yScale.rangeBand())
      .attr("fill", (d, i) => colors[i]);
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
      .call(yAxisStuff);
  }

  redrawYAxes(data) {
    const yAxisStuff = d3.svg
      .axis()
      .scale(this.yScale)
      //no tick marks
      .tickSize(0)
      .orient("left");

    this.plot.select(".y-axis").call(yAxisStuff);

    // .call(yAxisStuff)
  }

  repaintChart(data) {
    this.setXScale(data);
    this.setYScale(data);
    this.bindDataToBars(data);
    this.redrawBars(data);
    this.redrawLabels(data);
    this.redrawYAxes(data);
  }

  paintPercentageChart(data) {
    this.xScale = d3.scale
      .linear()
      .range([0, this.width])
      .domain([0, 100]);

    this.setYScale(data);
    this.bindDataToBars(data);
    this.redrawBars(data);
    this.redrawPercentLabels(data);
    this.redrawYAxes(data);
  }

  redrawBarsWith3DataPoints(data) {
    this.xScale = d3.scale
      .linear()
      .range([0, this.width])
      .domain([0, 100]);

    this.setYScale(data);
    this.bindDataToBars(data);
    this.redrawBars(data);
    this.redrawPercentLabels(data);
    this.redrawYAxes(data);
  }

  bindDataToBars(data) {
    this.bars = this.plot
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("g");
  }

  redrawBars(data) {
    d3.selectAll("rect")
      .data(data)
      .transition()
      .delay(function(d, i) {
        return i * 100;
      })
      .attr("width", d => {
        return this.xScale(d.population);
      });
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
      .style("fill", "lightgoldenrodyellow")
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
