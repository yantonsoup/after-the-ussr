import {
  sovietCountryIsoCodes,
  colors,
} from "./constants";

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
    const boundingBox = scrollContainer.node().getBoundingClientRect();
    const { width } = boundingBox;
    const headerText = "1989 CIS State Populations"

    this.barMargin = {
      top: 15,
      right: 75,
      bottom: 40,
      left: 60
    };

    this.width = width - this.barMargin.left - this.barMargin.right;
    this.height = width - this.barMargin.top - this.barMargin.bottom;

    this.plot = d3
      .select(".bar-graphic")
      .append("svg")
      .attr("width", this.width + this.barMargin.left + this.barMargin.right)
      .attr("height", this.height + this.barMargin.top + this.barMargin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.barMargin.left + "," + this.barMargin.top + ")"
      )
    // we'll actually be appending to a <g> element
    this.drawTitle(headerText);

    // create the other stuff
    this.setXScale(this.data);
    this.setYScale(this.data);
    
    this.bindDataToBars(this.data);
    this.paintHiddenBars();
    this.addYAxes();

    this.hideAllElements();
  }

  hideAllElements() {
    this.plot.style("opacity", "0");
    this.textHeader.style("opacity", "0");
  }

  drawTitle(text) {
    this.textHeader = d3.select(".bar-graphic-header")
    this.textHeader.text(text)
  }

  paintHiddenBars() {
    this.bars
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => {
        return this.yScale(d.name);
      })
      .attr("height", () => this.yScale.rangeBand())
      .attr("fill", (d, i) => colors[i])
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
  
    this.plot
      .select(".y-axis")
      .call(yAxisStuff);

    // .call(yAxisStuff)
  }

  repaintChart(data) {
    this.setXScale(data);
    this.setYScale(data);
    this.bindDataToBars(data);
    this.redrawBars(data);
    this.redrawLabels(data);
    this.redrawYAxes(data)
  }

  paintPercentageChart(data) {
    this.xScale = d3.scale
    .linear()
    .range([0, this.width])
    .domain([
      0,
      100
    ]);

    this.setYScale(data);
    this.bindDataToBars(data);
    this.redrawBars(data);
    this.redrawPercentLabels(data);
    this.redrawYAxes(data)
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
        console.warn("d for new width", d);
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
        return datum.population + '%';
      })
      .attr("transform", "translate(" + 0 + "," + this.barMargin.top + ")");
  }

  redrawLabels(data) {
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
        return parsePopulationText(datum);
      })
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

    this.textHeader
      .transition()
      .delay(500)
      .style("opacity", "1")
      .style("color", "black");
  }
}

function parsePopulationText(datum) {
  const { population, name } = datum;
  const populationText = (population/1000000).toFixed(2) + 'm';
  console.warn({populationText})

  return populationText
}