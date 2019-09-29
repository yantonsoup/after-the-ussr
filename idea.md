- switch to event-emitter based setup

# Dynamic sizing spots

The map takes its dimensions in applyContainerStyles, by looking at the pages width, which is never larger than 50% height of the screen

if (window.innerWidth > 768) {

mapZoom
we're transitioning stuff

animateMapZoom({ scale, translateX, translateY, duration }) {
this.mapGraphic
.transition()
.duration(duration)
.attr(
"transform",
`scale(${scale})translate(${translateX},${translateY})`
);
}

I WANT the container to take on half the width of the screen and be full height of the screen

index.css
.story-container,.overlay-section,.step {
max-width: 50vh;
}

- worldmap.draw
  line 30: width, height taken from bounding box
- worldmap.moveMapContainer
  takes in a top
- worldmap.animateArrowFromTo
  takes

Bounding Box is used for getting width of graphic

- const boundingBox = d3
  .select(this.element)
  .node()
  .getBoundingClientRect();

- const { width } = boundingBox;

- All the containers are currently square
