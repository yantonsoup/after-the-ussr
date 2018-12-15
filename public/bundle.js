(function () {
  'use strict';

  const sovietCountryIsoCodes = ["ARM", "AZE", "BLR", "EST", "GEO", "KAZ", "KGZ", "LVA", "LTU", "MDA", "RUS", "TJK", "TKM", "UKR", "UZB"];

  var mercatorBounds = function (projection, maxlat) {
    var yaw = projection.rotate()[0],
        xymax = projection([-yaw + 180 - 1e-6, -maxlat]),
        xymin = projection([-yaw - 180 + 1e-6, maxlat]);
    return [xymin, xymax];
  };

  function loadMap() {
    return new Promise((resolve, reject) => {
      d3.json("./json/110topoworld.json", function (json) {
        console.warn("loaded 110topoworld.json:", json);
        const mapContainer = d3.select(".scroll__graphic");
        const boundingBox = mapContainer.node().getBoundingClientRect();
        const {
          height,
          width
        } = boundingBox;
        var rotate = -20; // so that [-60, 0] becomes initial center of projection

        var maxlat = 83;
        var projection = d3.geo.mercator().rotate([rotate, 0]).scale(1) // we'll scale up to match viewport shortly.
        .translate([width / 2, height / 2]); // .center([0, 25])

        var b = mercatorBounds(projection, maxlat);
        var s = width / (b[1][0] - b[0][0]);
        var scaleExtent = [s, 10 * s];
        projection.scale(scaleExtent[0]);
        var path = d3.geo.path().projection(projection);
        const countrySubunits = topojson.feature(json, json.objects.subunits).features;
        const svg = d3.select(".scroll__graphic").append("svg").attr("width", width).attr("height", height);
        const map = svg.append("g").attr("id", "map");
        map.selectAll("path").data(countrySubunits).enter().append("path").attr("d", path).style("stroke-width", 0.5 + "px").attr("class", "country").attr("id", function (d, i) {
          return "country" + d.id;
        }).attr("class", function (datapoint, i) {
          if (sovietCountryIsoCodes.includes(datapoint.id)) {
            return "country soviet-country";
          } else {
            return "country non-soviet-country";
          }
        });
        resolve(countrySubunits);
      });
    });
  }

  const sovietCountryIsoCodes$1 = ["ARM", "AZE", "BLR", "EST", "GEO", "KAZ", "KGZ", "LVA", "LTU", "MDA", "RUS", "TJK", "TKM", "UKR", "UZB"];
  const colors = ["#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603", "#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#feedde", "#fdbe85", "#fd8d3c", "#e6550d", "#a63603"];
  const sovietLabelShift = {
    ARM: {
      x: -12,
      y: 2
    },
    AZE: {
      x: -8,
      y: 5
    },
    BLR: {
      x: -14,
      y: 4
    },
    EST: {
      x: -12,
      y: 0
    },
    GEO: {
      x: -13,
      y: 1
    },
    KAZ: {
      x: 14,
      y: 6
    },
    KGZ: {
      x: 5,
      y: 3
    },
    LVA: {
      x: -12,
      y: 0
    },
    LTU: {
      x: -14,
      y: 0
    },
    MDA: {
      x: -12,
      y: 1
    },
    RUS: {
      x: -40,
      y: 10
    },
    TJK: {
      x: -4,
      y: 6
    },
    TKM: {
      x: -10,
      y: 8
    },
    UKR: {
      x: -9,
      y: 7
    },
    UZB: {
      x: -12,
      y: 0
    }
  };

  function firstAnimation() {
    var scale = 2;
    const mapContainer = d3.select(".scroll__graphic");
    const boundingBox = mapContainer.node().getBoundingClientRect();
    const {
      height,
      width
    } = boundingBox;
    var translateX = -Math.floor(width * 0.7);
    var translateY = -Math.floor(height * 0.4);
    console.warn("firstAnimation translateX", translateX);
    console.warn("first animation translateY", translateY);
    console.warn({
      scale
    });
    console.warn({
      width
    });
    console.warn({
      height
    });
    console.warn({
      translateX
    });
    console.warn({
      translateY
    });
    d3.select("#map").transition().duration(1000).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + scale + ")translate(" + translateX + "," + translateY + ")"); // d3.selectAll(".soviet-country")
    //   .transition()
    //   .duration(100)
    //   .style("fill", "#a63603")
    //   .style("stroke-width", 0.5 + "px");

    d3.selectAll(".non-soviet-country").transition().duration(100).style("opacity", "0.5").style("stroke-width", 0.25 + "px");
    d3.selectAll(".soviet-country").transition().duration(1000).style("fill", function (d, i) {
      // console.warn('i', i)
      return colors[i];
    });
  }

  function secondAnimation(countries) {
    const mapContainer = d3.select(".scroll__graphic");
    const boundingBox = mapContainer.node().getBoundingClientRect();
    const {
      width,
      height
    } = boundingBox;
    var scale = 4;
    var translateX = -Math.floor(width * 0.6);
    var translateY = -Math.floor(height * 0.33);
    d3.select("#map").transition().duration(1000).attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + scale + ")translate(" + translateX + "," + translateY + ")");
    d3.selectAll(".non-soviet-country").transition().duration(500).style("stroke-width", 0.175 + "px");
    d3.selectAll(".soviet-country").transition().duration(500).style("stroke-width", 0.25 + "px");
    d3.selectAll(".non-soviet-country").transition().duration(500).style("opacity", "0.1");
    d3.selectAll(".place-label").data(countries).enter().append("text").attr("class", "place-label").attr("transform", function (d) {
      // can get centroid easily like this!  path.centroid(d)
      const [x, y] = path.centroid(d);
      return `translate(${x},${y})`;
    }).attr("dx", function ({
      id
    }) {
      if (sovietCountryIsoCodes$1.includes(id)) {
        const {
          x
        } = sovietLabelShift[id];
        console.warn(x); // can get centroid easily like this!  path.centroid(d)

        return `${x}px`;
      }

      return;
    }).attr("dy", function (d) {
      if (sovietCountryIsoCodes$1.includes(d.id)) {
        const name = d.id;
        const {
          y
        } = sovietLabelShift[name]; // can get centroid easily like this!  path.centroid(d)

        return `${y}px`;
      }

      return;
    }) // .style("z-index", '100')
    .text(function (d) {
      if (sovietCountryIsoCodes$1.includes(d.id)) {
        console.warn("soviet datapoint", d);
        return d.properties.name;
      }

      return;
    }).style("font-size", 3 + "px");
  }

  var animations = {
    firstAnimation,
    secondAnimation
  };

  function setupStickyfill() {
    d3.selectAll(".sticky").each(function () {
      Stickyfill.add(this);
    });
  }

  function setupScrollama() {
    const scroller = scrollama(); // response = { element, direction, index }

    function handleStepEnter(response) {
      console.warn("handleStepEnter, response", {
        response
      });

      switch (response.index) {
        case 0:
          animations.firstAnimation();
          break;

        case 1:
          animations.secondAnimation(countries);
          break;

        default:
          break;
      }

      if (response.index === 1) {
        animations.secondAnimation(countries);
      } // add color to current step only
      // step.classed("is-active", function(d, i) {
      //   return i === response.index;
      // });

    }

    function handleContainerEnter(response) {
      d3.select(".intro__overline").classed("sticky_break", true);
      console.warn({
        handleContainerEnter
      });
    }

    function handleContainerExit(response) {
      console.warn({
        handleContainerExit
      }); // response = { direction }
    }

    function init() {
      setupStickyfill();
      scroller.setup({
        container: ".scroll",
        graphic: ".scroll__graphic",
        text: ".scroll__text",
        step: ".scroll__text .step",
        debug: false,
        offset: 0.9
      }).onStepEnter(handleStepEnter).onContainerEnter(handleContainerEnter).onContainerExit(handleContainerExit); // setup resize event -> this is causing issues in mobile when the mobile headers resize
      // window.addEventListener("resize", handleResize);
    } // kick things off


    init();
    let countries;
    loadMap().then(countrySubunits => {
      console.warn({
        countrySubunits
      });
      countries = countrySubunits;
      return countries;
    });
  }

  function firstPaint() {
    // Setup sizes for the graphic and steps
    var container = d3.select(".scroll");
    const boundingBox = container.node().getBoundingClientRect();
    const {
      width,
      height
    } = boundingBox;
    var text = container.select(".scroll__text");
    var textWidth = text.node().offsetWidth;
    var step = text.selectAll(".step");
    var stepHeight = Math.floor(window.innerHeight * 1);
    step.style("height", stepHeight + "px"); // var graphicMargin = 16 * 4; // 64px

    var graphicMarginTop = Math.floor(window.innerHeight * 0.25);
    var graphic = container.select(".scroll__graphic");
    console.warn('graphic width, height', graphic.node().offsetWidth);
    graphic.style("width", width + "px").style("height", width + "px").style("top", graphicMarginTop + "px"); // -----------------------------------

    console.warn({
      textWidth
    });
    console.warn('height', {
      height
    });
    console.warn('width', {
      width
    });
    d3.select(".header-container").style("height", 850 + "px");
    d3.select(".ussr-svg-container").style("width", textWidth + "px");
    d3.select(".intro-block").style("width", textWidth + "px");
    d3.select(".name-block").style("width", textWidth + "px");
    d3.select(".ussr-svg").style("height", 200 + "px");
    d3.select(".ussr-svg").style("width", 200 + "px");
  }

  // logs will still point to your original source modules

  console.log('if you have sourcemaps enabled in your devtools, click on main.js:5 -->');

  window.onbeforeunload = function () {
    window.scrollTo(0, 0);
  };

  firstPaint();
  setupScrollama();

}());
//# sourceMappingURL=bundle.js.map
