import {
  netMigrantsToRussia1989to2002,
  percentMigrantsToRussia1989to2002,
  migrationAbroadEthnicity1995to2002,
  russianPopulationsIn198millions,
  migrationAbroadDestination1995to2002,
  populationRussia1989to2002,
  sovietLabels,
  populationsIn1989millions
} from "./constants";

const sovietCountryIsoCodes = [
  "ARM",
  "AZE",
  "BLR",
  "EST",
  "GEO",
  "KAZ",
  "KGZ",
  "LVA",
  "LTU",
  "MDA",
  "TJK",
  "TKM",
  "UKR",
  "UZB"
];

// /////////////////////////////////////////////////////////
function zeroAnimation(worldMap, barChart, lineChart, direction) {
  worldMap.removeLabels();

  worldMap.createPopulationChoropleth(
    populationsIn1989millions,
    ".soviet-country"
  );

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country,.intl-country",
    styles: {
      opacity: "0.5",
      fill: "#d0d0d0",
      stroke: "none"
    }
  });

  worldMap.animateMapZoom({
    scale: 1,
    duration: 750,
    translateX: 0,
    translateY: 0
  });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function firstAnimation(worldMap, barChart, lineChart, direction) {
  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);

  worldMap.moveMapContainer({
    duration: 750,
    top: quarterPageHeight
  });

  worldMap.animateMapZoom({
    scale: 4,
    duration: 500,
    translateX: -Math.floor(worldMap.width * 0.46),
    translateY: -Math.floor(worldMap.height * 0.22)
  });

  Object.keys(sovietLabels).forEach(countryId => {
    const countryShift = sovietLabels[countryId];
    worldMap.createCountryLabel(countryId, countryShift, 3.5);
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country,.intl-country",
    styles: {
      opacity: "0",
      "stroke-width": "0.175px"
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".soviet-country",
    styles: {
      stroke: "black",
      "stroke-width": "0.1px"
    }
  });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function secondAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up"){
    worldMap.createPopulationChoropleth(
      populationsIn1989millions,
      ".soviet-country"
    );
  }

  worldMap.moveMapContainer({
    duration: 500,
    top: 0
  });

  barChart.revealBarChart();

  barChart.clearBars();
  barChart.bindDataToBars(populationsIn1989millions);
  barChart.paintHiddenBars(populationsIn1989millions);

  // barChart.redrawBars(populationsIn1989millions);
  barChart.drawTitle("1898 Soviet State Populations");
  barChart.repaintChart(populationsIn1989millions, "m");

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country,.intl-country",
    styles: {
      opacity: "0"
    }
  });

  Object.keys(sovietLabels).forEach(countryId => {
    const countryShift = sovietLabels[countryId];
    worldMap.createCountryLabel(countryId, countryShift, 3.5);
  });

  worldMap.createPopulationChoropleth(populationsIn1989millions, ".fsu-state");
  worldMap.animateSectionStyles({
    duration: 500,
    delay: 500,
    section: ".soviet-country",
    styles: {
      stroke: "black",
      "stroke-width": "0.1px"
    }
  });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function thirdAnimation(worldMap, barChart) {
  barChart.clearBars();
  barChart.bindDataToBars(russianPopulationsIn198millions);
  barChart.paintHiddenBars(russianPopulationsIn198millions);

  const title = "1989 Russian Population per State";

  barChart.drawTitle(title, "m");
  barChart.repaintChart(russianPopulationsIn198millions, "m");

  // barChart.revealBarChart();

  // hide curves and dot on way up
  worldMap.createPopulationChoropleth(
    russianPopulationsIn198millions,
    ".fsu-state",
    undefined,
    'black'
  );

  // worldMap.animateSectionStyles({
  //   duration: 500,
  //   section: ".fsu-state",
  //   styles: {
  //     stroke: "black",
  //     "stroke-width": "0.1px"
  //   }
  // });

  worldMap.animateSectionStyles({
    duration: 500,
    delay: 500,
    section: "#RUS",
    styles: {
      opacity: "1",
      fill: "#BAB4AC"
    }
  });

  worldMap.clearArrows();
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function fourthAnimation(worldMap, barChart) {
  barChart.drawTitle("Net Return to Russia per Country");
  barChart.repaintChart(netMigrantsToRussia1989to2002, "m");

  // on way up
  worldMap.animateMapZoom({
    scale: 4,
    duration: 500,
    translateX: -Math.floor(worldMap.width * 0.46),
    translateY: -Math.floor(worldMap.height * 0.22)
  });


  worldMap.createPopulationChoropleth(
    netMigrantsToRussia1989to2002,
    ".fsu-state",
    undefined,
    'black'
  );

  sovietCountryIsoCodes.forEach(country => {
    worldMap.animateArrowFromTo(country, "RUS");
  });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function fifthAnimation(worldMap, barChart, lineChart, direction) {
  worldMap.createPopulationChoropleth(
    percentMigrantsToRussia1989to2002,
    ".fsu-state",
    undefined,
    'black'
  );


  if (direction === 'up') {
    
    sovietCountryIsoCodes.forEach(country => {
      worldMap.animateArrowFromTo(country, "RUS");
    });

    barChart.redrawBarsFromScratch(percentMigrantsToRussia1989to2002);
    barChart.repaintChart(netMigrantsToRussia1989to2002, "m");

    worldMap.animateSectionStyles({
      duration: 500,
      delay: 500,
      section: "#RUS",
      styles: {
        opacity: "1",
        fill: "#BAB4AC",
        stroke: "#BAB4AC",
        "stroke-width": "0.1px"
      }
    });
  }


  lineChart.hideIt();
  worldMap.removeLabels();

  Object.keys(sovietLabels).forEach(countryId => {
    const countryShift = sovietLabels[countryId];
    worldMap.createCountryLabel(countryId, countryShift, 3.5);
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".non-soviet-country,.intl-country",
    styles: {
      opacity: "0"
    }
  });

  // sovietCountryIsoCodes.forEach(countryId => {
  //   worldMap.animateArrowFromTo(countryId, "RUS");
  // });

  worldMap.animateMapZoom({
    scale: 4,
    duration: 500,
    translateX: -Math.floor(worldMap.width * 0.46),
    translateY: -Math.floor(worldMap.height * 0.22)
  });

  barChart.bindDataToBars(percentMigrantsToRussia1989to2002);
  barChart.repaintChart(percentMigrantsToRussia1989to2002, "%");
  barChart.revealBarChart();
  barChart.drawTitle("Russian Diaspora Percent Return per State", "%");
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function sixthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up") {
    lineChart.clearPreviousLineAndAxis("fertility");
    lineChart.clearPreviousLineAndAxis("mortality");

    
  }

  barChart.hideAllElements();

  worldMap.clearArrows();
  worldMap.removeLabels();

  worldMap.animateMapZoom({
    scale: 1,
    duration: 500,
    translateX: 0,
    translateY: 0
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: ".country",
    styles: {
      opacity: "0.5",
      fill: "#d0d0d0",
      stroke: "#d0d0d0",
      "stroke-opacity": 0.5
    }
  });

  worldMap.animateSectionStyles({
    duration: 500,
    section: "#RUS",
    styles: {
      fill: "rgb(255, 165, 0)",
      opacity: "1",
      stroke: "rgb(255, 165, 0)",
      "stroke-opacity": 0.5
    }
  });

  lineChart.revealIt();

  lineChart.drawLine("population", [130000000, 150000000], { x: 200, y: 20 });
  lineChart.drawTitle("Russia Population 1989 to 2002");

  worldMap.createCountryLabel("RUS", [-15, 5], 11);
}

function seventhAnimation(worldMap, barChart, lineChart, direction) {
  lineChart.clearPreviousLineAndAxis("population");
  lineChart.drawLine("fertility", [0, 20], { x: 160, y: 140 });
  lineChart.drawLine("mortality", [0, 20], { x: 150, y: 68 });
  lineChart.drawTitle("Russia Fertility & Mortality per 1000 Persons");

  if (direction === "up") {
    barChart.hideAllElements();
    lineChart.revealIt();
    worldMap.animateSectionStyles({
      duration: 500,
      section: ".country",
      styles: {
        opacity: "0.5",
        fill: "#d0d0d0",
        stroke: "#d0d0d0",
        "stroke-opacity": 0.5
      }
    });

    worldMap.animateSectionStyles({
      duration: 1000,
      section: "#RUS",
      styles: {
        fill: "rgb(255, 165, 0)",
        opacity: "1"
      }
    });
    worldMap.createCountryLabel("RUS", [-8, 8], 12);
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function eightAnimation(worldMap, barChart, lineChart, direction) {
  lineChart.hideIt();
  worldMap.clearArrows();
  worldMap.removeLabels();

  worldMap.animateMapZoom({
    scale: 1,
    duration: 500,
    translateX: 0,
    translateY: 0
  });

  
  worldMap.animateSectionStyles({
    duration: 500,
    section: ".soviet-country",
    styles: {
      fill: "#d0d0d0",
      opacity: "1",
      stroke: "#d0d0d0",
      "stroke-width": "1px"
    }
  });

  worldMap.createPopulationChoropleth(
    migrationAbroadDestination1995to2002,
    ".intl-country",
    ["#ffffb2", "#a1dab4", "#41b6c4"],
    'none'
  );

  barChart.drawTitle(
    "Top Destinations For Soviet Immigrants '95 - '02",
    "1995-2002"
  );
  barChart.redrawBarsFromScratch(migrationAbroadDestination1995to2002);
  barChart.revealBarChart();
}
// /////////////////////////////////////////////////////////

// ////////////////////////////////x/////////////////////////
function ninthAnimation(worldMap, barChart, lineChart, direction) {


  if (direction === "up") {
    lineChart.hideIt();
    lineChart.clearPreviousLineAndAxis("germanFsuToGermany");

    worldMap.clearArrows();
    worldMap.animateMapZoom({
      scale: 1,
      duration: 500,
      translateX: 0,
      translateY: 0
    });

    worldMap.animateSectionStyles({
      duration: 500,
      section: ".soviet-country",
      styles: {
        stroke: "#d0d0d0",
        "stroke-width": "1px",
        "fill": "#d0d0d0"
      }
    });
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function tenthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "down") {
    worldMap.animateSectionStyles({
      duration: 500,
      section: ".non-soviet-country,.soviet-country",
      styles: {
        "stroke-width": "0.15px",
        stroke: "none"
      }
    });

    worldMap.animateMapZoom({
      scale: 7,
      duration: 750,
      translateX: -Math.floor(worldMap.width * 0.4),
      translateY: -Math.floor(worldMap.height * 0.27)
    });

    worldMap.clearArrows();

    const arrowWidth = 0.25;
    const arrowHeadSize = 1;
    const curveOffset = 5;
    worldMap.animateArrowFromTo(
      "RUS",
      "DEU",
      "black",
      arrowWidth,
      arrowHeadSize,
      curveOffset
    );

    worldMap.createCountryLabel("DEU", [-7, 11], 2.5);
  }

  barChart.hideAllElements();

  lineChart.clearPreviousLineAndAxis("fertility");
  lineChart.clearPreviousLineAndAxis("mortality");

  lineChart.revealIt();

  lineChart.drawLine("germanFsuToGermany", [0, 220], { x: 160, y: 70 });
  lineChart.drawTitle("Soviet Migration To Germany 000's");

  // worldMap.highlightInternationalLines();
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function eleventhAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up") {
    lineChart.clearPreviousLineAndAxis("jewishFsuToIsrael");

    worldMap.clearArrows();
    const arrowWidth = 0.25;
    const arrowHeadSize = 1;
    const curveOffset = 5;
    worldMap.animateArrowFromTo(
      "RUS",
      "DEU",
      "black",
      arrowWidth,
      arrowHeadSize,
      curveOffset
    );

    worldMap.createCountryLabel("DEU", [5, 8], 2.5);
    worldMap.animateMapZoom({
      scale: 7,
      duration: 750,
      translateX: -Math.floor(worldMap.width * 0.4),
      translateY: -Math.floor(worldMap.height * 0.27)
    });
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function twelfthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "down") {
    worldMap.clearArrows();

    const arrowWidth = 0.15;
    const arrowHeadSize = 0.6;
    worldMap.animateArrowFromTo(
      "RUS",
      "ISR",
      "black",
      arrowWidth,
      arrowHeadSize
    );

    worldMap.createCountryLabel("ISR", [-2, 4], 1.5);
    worldMap.animateMapZoom({
      scale: 15,
      duration: 750,
      translateX: -Math.floor(worldMap.width * 0.51),
      translateY: -Math.floor(worldMap.height * 0.382)
    });
  }
  // lineChart.clearPreviousLineAndAxis("germanFsuToGermany");
  lineChart.drawTitle("Soviet Migration To Israel 000's");
  lineChart.drawLine("jewishFsuToIsrael", [0, 220], { x: 130, y: 185 });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function thirteenthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up") {
    worldMap.clearArrows();
    lineChart.clearPreviousLineAndAxis("americanFsuToUsa");
    worldMap.removeLabels();

    const arrowWidth = 0.15;
    const arrowHeadSize = 0.6;
    worldMap.animateArrowFromTo(
      "RUS",
      "ISR",
      "black",
      arrowWidth,
      arrowHeadSize
    );

    worldMap.createCountryLabel("ISR", [-2, 3], 1.5);
    worldMap.animateMapZoom({
      scale: 15,
      duration: 750,
      translateX: -Math.floor(worldMap.width * 0.51),
      translateY: -Math.floor(worldMap.height * 0.382)
    });
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function fourteenthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "down") {
    worldMap.clearArrows();
    worldMap.animateArrowFromTo("RUS", "USA", "black");

    worldMap.createCountryLabel("USA", [-22, 18], 3);
  }
  // lineChart.clearPreviousLineAndAxis("jewishFsuToIsrael");
  // worldMap.clearArrows();

  lineChart.drawTitle("Soviet Migration To America 000's");
  lineChart.drawLine("americanFsuToUsa", [0, 220], { x: 130, y: 240 });

  worldMap.animateMapZoom({
    scale: 5,
    duration: 500,
    translateX: -Math.floor(worldMap.width * 0.07),
    translateY: -Math.floor(worldMap.height * 0.3)
  });
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function fifteenthAnimation(worldMap, barChart, lineChart) {}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function sixteeteenthAnimation(worldMap, barChart, lineChart, direction) {
  if (direction === "up") {
    worldMap.moveMapContainer({
      duration: 500,
      top: 0
    });

    worldMap.animateMapZoom({
      scale: 5,
      duration: 500,
      translateX: -Math.floor(worldMap.width * 0.07),
      translateY: -Math.floor(worldMap.height * 0.3)
    });

    lineChart.revealIt();
    worldMap.createCountryLabel("USA", [-22, 18], 3);

    worldMap.clearArrows();
    worldMap.animateArrowFromTo("RUS", "USA", "black");

    worldMap.createPopulationChoropleth(
      migrationAbroadDestination1995to2002,
      ".intl-country",
      ["#ffffb2", "#a1dab4", "#41b6c4"],
      'none'
    );
  }
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function seventeenthAnimation(worldMap, barChart, lineChart) {
  worldMap.clearArrows();
  worldMap.removeLabels();
  lineChart.hideIt();
  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);

  worldMap.moveMapContainer({
    duration: 750,
    top: quarterPageHeight
  });

  worldMap.animateMapZoom({
    scale: 1,
    duration: 500,
    translateX: 0,
    translateY: 0
  });
  worldMap.createPopulationChoropleth(
    populationsIn1989millions,
    ".soviet-country"
  );
}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function eighteenthAnimation() {}
// /////////////////////////////////////////////////////////

// /////////////////////////////////////////////////////////
function nineteenthAnimation() {}
// /////////////////////////////////////////////////////////

export default {
  0: zeroAnimation,
  1: firstAnimation,
  2: secondAnimation,
  3: thirdAnimation,
  4: fourthAnimation,
  5: fifthAnimation,
  6: sixthAnimation,
  7: seventhAnimation,
  8: eightAnimation,
  9: ninthAnimation,
  10: tenthAnimation,
  11: eleventhAnimation,
  12: twelfthAnimation,
  13: thirteenthAnimation,
  14: fourteenthAnimation,
  15: fifteenthAnimation,
  16: sixteeteenthAnimation,
  17: seventeenthAnimation,
  18: eighteenthAnimation,
  19: nineteenthAnimation
};
