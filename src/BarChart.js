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
      this.sovietDataPoints = opts.data.filter(country => sovietCountryIsoCodes.includes(country.id))
      this.element = opts.element;
      // create the chart
      this.draw();
  }
  
  draw() {
      // define width, height and margin
    const mapContainer = d3.select(".scroll__graphic");
    const boundingBox = mapContainer.node().getBoundingClientRect();
    const { height, width } = boundingBox;


    const barMargin = {
        top: 15,
        right: 75,
        bottom: 0,
        left: 60
    };

    this.width = width - barMargin.left - barMargin.right;
    this.height = height- 100 - barMargin.top - barMargin.bottom;

    // we'll actually be appending to a <g> element
    this.plot = d3
    .select("#bar-graphic")
    .append("svg")
    .attr("width", this.width + barMargin.left + barMargin.right)
    .attr("height", this.width + barMargin.top + barMargin.bottom)
    .append("g")
    .attr(
        "transform",
        "translate(" + barMargin.left + "," + barMargin.top + ")"
    )
    .style('opacity', '0')
    // create the other stuff
    this.createScales();
    this.addYAxes();
  }
  
  createScales() {
    // this.xScale = d3.scale
    //     .linear()
    //     .range([0, this.width])
    //     .domain([
    //     0,
    //     d3.max(sortedPopulationData, function(d) {
    //         return d.population;
    //     })
    //     ]);
  
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
    var yAxis = d3.svg
        .axis()
        .scale(this.yAxis)
        //no tick marks
        .tickSize(0)
        .orient("left");

    this.plot
        .append("g")
        .attr("class", "y-axis")
        .call(yAxis);

    var bars = this.plot
        .selectAll(".bar")
        .data(sortedPopulationData)
        .enter()
        .append("g");
    
    bars
        .append("rect")
        .attr("class", "bar")
        .attr("y", function(d) {
            return y(d.name);
        })
        .attr("height", this.yScale.rangeBand())
        .attr("x", 0)
        .attr("width", 0)
      // create and append axis y
      // this is all pretty straightforward D3 stuff
    //   const xAxis = d3.axisBottom()
    //       .scale(this.xScale)
    //       .ticks(d3.timeMonth);

    //   const yAxis = d3.axisLeft()
    //       .scale(this.yScale)
    //       .tickFormat(d3.format("d"));

    //   this.plot.append("g")
    //       .attr("class", "x axis")
    //       .attr("transform", `translate(0, ${this.height-(m.top+m.bottom)})`)
    //       .call(xAxis);

    //   this.plot.append("g")
    //       .attr("class", "y axis")
    //       .call(yAxis)
  }
  
}