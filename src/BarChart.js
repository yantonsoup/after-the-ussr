import {
  sovietCountryIsoCodes,
  colors,
  sovietLabelShift,
  netFsuMigrationOne,
  populationsIn1991
} from "./constants";

const sortedPopulationData = populationsIn1991.sort(function(a, b) {
  return d3.ascending(a.population, b.population);
});
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
    const mapContainer = d3.select(".scroll__graphic");
    const boundingBox = mapContainer.node().getBoundingClientRect();
    const { height, width } = boundingBox;

    this.barMargin = {
      top: 15,
      right: 75,
      bottom: 0,
      left: 60
    };
    const text = d3.select(".scroll").select(".scroll__text");
    const textWidth = text.node().offsetWidth;

    this.width = textWidth - this.barMargin.left - this.barMargin.right;
    this.height = height - 100 - this.barMargin.top - this.barMargin.bottom;

    // we'll actually be appending to a <g> element
    this.plot = d3
      .select("#bar-graphic")
      .append("svg")
      .attr("width", this.width + this.barMargin.left + this.barMargin.right)
      .attr("height", this.height + this.barMargin.top + this.barMargin.bottom)
      .append("g")
      .attr(
        "transform",
        "translate(" + this.barMargin.left + "," + this.barMargin.top + ")"
      )
      .style("opacity", "0");
    // create the other stuff
    this.setXScale(sortedPopulationData)
    this.setYScale(sortedPopulationData)
    this.bindDataToBars(sortedPopulationData)
    this.paintHiddenBars()
    this.addYAxes();
  }

  paintHiddenBars() {
    this.bars
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => {
        return this.yScale(d.name);
      })
      .attr("height", () => this.yScale.rangeBand())
      .attr("fill", function(d, i) {
        return colors[i];
      })
      .attr("x", 0)
      .attr("width", 0);
  }

  setYScale(data) {
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

  setXScale(data) {
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

  redrawBarsAndLabels(data) {
    this.bindDataToBars(data)
    this.setXScale(data)
    this.setYScale(data)
    this.redrawBars(data)
    this.redrawLabels(data)
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
      .transition()
      .delay(function(d, i) {
        return i * 100;
      })
      .attr("width", d => {
        console.warn('d for new width', d)
        return this.xScale(d.population);
      });
  }

  redrawLabels(data) {
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
        return this.xScale(d.population) + 1;
      })
      .attr("dx", ".75em")
      .text(function(d) {
        return d.population;
      })
      .attr("transform", "translate(" + 0 + "," + this.barMargin.top + ")")
  }

  addPopulationLabels() {
    const barGraphicSvg = d3.select("#bar-graphic").select("svg");

    barGraphicSvg
      .select("g")
      .selectAll(".text")
      .data(sortedPopulationData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("y", d => {
        return this.yScale(d.name);
      })
      .attr("x", d => {
        return this.xScale(d.population) + 1;
      })
      .attr("dx", ".75em")
      .text(function(d) {
        return d.population;
      })
      .attr("transform", "translate(" + 0 + "," + this.barMargin.top + ")")
      .style("opacity", "0");


    barGraphicSvg
      .selectAll('.label')
      .transition()
      .delay(1500)
      .duration(1000)
      .style("opacity", "1");
  }

  fadeTextIn() {
    this.plot
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", "1");

    d3.select(".bar-graphic-header")
        .transition()
        .delay(1000)
        .duration(500)
        .style("opacity", "1")
        .style('color', 'black')
    }
}
