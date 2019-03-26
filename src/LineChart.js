import d3 from "d3";

export default class LineChart {
  constructor(opts) {
    this.data = opts.data;
    // this.internationalData = opts.internationalData
    this.element = opts.element;
    this.headerElement = opts.headerElement;
    this.margins = {
      top: 15,
      right: 40,
      bottom: 100,
      left: 64
    };

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

    this.appendContainer();

    this.paintIt();
    this.hideIt();
  }

  hideIt() {
    d3.select(this.element)
      .transition()
      .duration(1000)
      .style("opacity", 0);
    d3.select(this.headerElement)
      .transition()
      .duration(1000)
      .style("opacity", 0);
  }

  revealIt() {
    d3.select(this.element)
      .transition()
      .delay(500)
      .duration(500)
      .style("opacity", 1);

    d3.select(this.headerElement)
      .transition()
      .delay(500)
      .style("opacity", 1);
  }

  drawTitle(text, units) {
    d3.select(".line-graphic-header-text").text(text);
    d3.select(".line-graphic-header-units").text(units);
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
      .ticks(10)
      .innerTickSize(15)
      .tickFormat(function(yValue) {
        // console.warn({ yValue });
        if (yValue > 10000) {
          const millionsDigits = Math.floor(yValue / 1000000).toString();
          return millionsDigits;
        }

        return yValue;
      })
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
        // console.warn("makeLine d", d[property]);
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
      d.germanFsuToGermany = +d.germanFsuToGermany;
      d.jewishFsuToIsrael = +d.jewishFsuToIsrael;
      d.jewishFsuToGermany = +d.jewishFsuToGermany;
      d.jewishFsuToUsa = +d.jewishFsuToUsa;
      d.americanFsuToUsa = +d.americanFsuToUsa;
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
      .attr("class", "axis x-axis")
      .attr("fill", "lightgoldenrodyellow")
      .attr("transform", "translate(0," + this.height + ")")
      .call(this.xAxis);

    this.svg
      .selectAll(".property-line")
      .data(this.propertyLines)
      .enter()
      .append("g")
      .attr("class", "property-line");
  }

  clearPreviousLineAndAxis(property) {
    const yAx = this.svg.select(".y-axis");
    const propertylines = this.svg.selectAll(".property-line");
    const lineLabels = this.svg.selectAll(".line-label");
    console.warn({ yAx });
    console.warn({ propertylines });
    console.warn({ lineLabels });

    this.svg.select(".y-axis").remove();
    this.svg.selectAll(`.${property}-line`).remove();
    this.svg.selectAll(".line-label").remove();
  }

  drawLine(property, domain) {
    this.yScale.domain(domain);
    const { fill } = getLineStylesFromProperty(property);

    this.svg
      .append("g")
      .attr("class", "axis y-axis")
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
      .attr("class", `${property}-line`)
      .attr("d", d => {
        this.makeLine(property);
        return this.line(d.values);
      })
      .attr({
        fill: "none",
        stroke: fill,
        "stroke-width": "3px",
        "stroke-dasharray": "3, 3",
        "shape-rendering": "crispEdges"
      });

    var totalLength = [
      this.path[0][0].getTotalLength(),
      this.path[0][1].getTotalLength()
    ];

    d3.select(this.path[0][0])
      .attr("stroke-dasharray", totalLength[0] + " " + totalLength[0])
      .attr("stroke-dashoffset", totalLength[0])
      .transition()
      .duration(2500)
      .ease("linear")
      .attr("stroke-dashoffset", 0);

    d3.select(this.path[0][1])
      .attr("stroke-dasharray", totalLength[1] + " " + totalLength[1])
      .attr("stroke-dashoffset", totalLength[1])
      .transition()
      .duration(2500)
      .ease("linear")
      .attr("stroke-dashoffset", 0);

    this.labelLine(property);
  }

  labelLine(property) {
    console.warn("property", property);
    console.warn("prohis.data[0][property]", this.data[0][property]);
    console.warn(
      "this.yScale(this.data[0][property]",
      this.yScale(this.data[0][property])
    );
    const translateX = this.width - 100;
    const translateY = this.yScale(this.data[0][property]);

    console.warn("translateX", translateX);
    console.warn("translateY", translateY);

    const { fill } = getLineStylesFromProperty(property);

    this.svg
      .append("text")
      .attr("transform", `translate(${translateX},${translateY})`)
      .attr("dy", ".35em")
      .attr("text-anchor", "start")
      .attr("class", "line-label")
      .style("fill", fill)
      .text(property);
  }
}

function getLineStylesFromProperty(property) {
  switch (property) {
    case "population":
      return {
        fill: "orange"
      };
    case "fertility":
      return {
        fill: "green"
      };
    case "mortality":
      return {
        fill: "black"
      };
    case "germanFsuToGermany":
      return {
        fill: "#41b6c4"
      };
    case "jewishFsuToGermany":
      return {
        fill: "#41b6c4"
      };
    case "jewishFsuToIsrael":
      return {
        fill: "#a1dab4"
      };
    case "jewishFsuToUsa":
      return {
        fill: "#ffffb2"
      };
    case "americanFsuToUsa":
      return {
        fill: "#ffffb2"
      };
    default:
      return {
        fill: "black"
      };
  }
}
