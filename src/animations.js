import { sovietCountryIsoCodes, colors, sovietLabelShift } from "./constants";

function animateSectionProperty(section, animationProperties) {
  const {
    property,
    value,
    width,
    height,
    translateX,
    translateY,
    scale,
    duration
  } = animationProperties;

  d3.select(section)
    .transition()
    .duration(duration)
    .attr(property, value);

  switch (property) {
    case "transform":
      d3.select(section)
        .transition()
        .duration(duration)
        .attr(
          property,
          `translate(${width / 2},${height /
            2})scale(${scale})translate(${translateX},${translateY})`
        );
      break;
    case "stroke-width":
      animations.firstAnimation({ countries, path, map });
      break;
    case 2:
      animations.secondAnimation({ countries, path, map });
      break;
    case 2:
      animations.thirdAnimation({ countries, path, map });
      break;

    default:
      break;
  }
}

function zeroAnimation() {
  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(1000)
    .style("opacity", "0.5")
    .style("stroke-width", 0.25 + "px");
}

function firstAnimation({ countries, path, map }) {
  console.warn("-----------------firstAnimation");

  var scale = 2;
  const mapContainer = d3.select(".scroll__graphic");
  const boundingBox = mapContainer.node().getBoundingClientRect();
  const { height, width } = boundingBox;

  var scale = 4;
  var translateX = -Math.floor(width * 0.6);
  var translateY = -Math.floor(height * 0.33);

  d3.select("#map")
    .transition()
    .duration(1000)
    .attr(
      "transform",
      `translate(${width / 2},${height /
        2})scale(${scale})translate(${translateX},${translateY})`
    );

  d3.select("#map")
    .selectAll(".place-label")
    .data(countries)
    .enter()
    .append("text")
    .attr("class", "place-label")
    .attr("transform", function(d) {
      // can get centroid easily like this!  path.centroid(d)
      const [x, y] = path.centroid(d);
      // console.warn('centroid', 'x', x, 'y', y)
      return `translate(${x},${y})`;
    })
    .attr("dx", function({ id }) {
      if (sovietCountryIsoCodes.includes(id)) {
        const { x } = sovietLabelShift[id];
        return `${x}px`;
      }
    })
    .attr("dy", function(d) {
      if (sovietCountryIsoCodes.includes(d.id)) {
        const name = d.id;
        const { y } = sovietLabelShift[name];
        return `${y}px`;
      }
    })
    // .style("z-index", '100')
    .text(function(d) {
      if (sovietCountryIsoCodes.includes(d.id)) {
        // console.warn("soviet datapoint", d);
        return d.properties.name;
      }
    })
    .style("font-size", 3 + "px");

  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(500)
    .style("stroke-width", 0.175 + "px");

  d3.selectAll(".soviet-country")
    .transition()
    .duration(1000)
    .style("fill", function(d, i) {
      // console.warn('i', i)
      return colors[i];
    })
    .style("stroke-width", 0.25 + "px");
}

function secondAnimation({ countries, path, map }) {
  console.warn("-----------------secondAnimation");
}

function thirdAnimation({ countries, path, map }) {
  console.warn("-----------------thirdAnimation");

  d3.selectAll(".non-soviet-country")
    .transition()
    .duration(500)
    .style("opacity", "0");

  d3.selectAll(".scroll__graphic")
    .transition()
    .duration(2500)
    .attr(
      "transform",
      `translate(0,0)scale(0)translate(0,1000)`
    );
}

export default {
  zeroAnimation,
  firstAnimation,
  secondAnimation,
  thirdAnimation
};
