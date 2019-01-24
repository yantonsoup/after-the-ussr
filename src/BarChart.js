import {
  sovietCountryIsoCodes,
  colors,
  sovietLabelShift,
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
    this.createScales();
    this.addYAxes();
  }

  createScales() {
    this.xScale = d3.scale
      .linear()
      .range([0, this.width])
      .domain([
        0,
        d3.max(sortedPopulationData, function(d) {
          return d.population;
        })
      ]);

    // y scale
    this.yScale = d3.scale
      .ordinal()
      .rangeRoundBands([this.height, 0], 0.1)
      .domain(
        sortedPopulationData.map(function(d) {
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

    this.bars = this.plot
      .selectAll(".bar")
      .data(sortedPopulationData)
      .enter()
      .append("g");

    this.bars
      .append("rect")
      .attr("class", "bar")
      .attr("y", d => {
        return this.yScale(d.name);
      })
      .attr("height", () => this.yScale.rangeBand())
      .attr("x", 0)
      .attr("width", 0);
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
      .attr("transform", "translate(" + 0 + "," + this.barMargin.top + ")");
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
        .style("opacity", "1");
    }


  animateBarsIn() {
    d3.selectAll("rect")
      .transition()
      .delay(function(d, i) {
        return i * 100;
      })
      .attr("fill", function(d, i) {
        return colors[i];
      })
      .attr("width", d => {
        return this.xScale(d.population);
      });
  }
}
