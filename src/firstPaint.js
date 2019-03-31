import d3 from 'd3';

export default function firstPaint () {
  // Setup sizes for the graphic and steps
  const fullPageHeight = Math.floor(window.innerHeight);
  console.warn('fullPageHeight', fullPageHeight)
  const halfPageHeight = Math.floor(window.innerHeight/2)
  const halfPageWidth = Math.floor(window.innerWidth/2)


  const storyContDims = d3.select('.story-container').node().getBoundingClientRect();
  console.warn('storyContainerDimentions', storyContDims)
  const width = storyContDims.width
  
  const quarterPageHeight = Math.floor(window.innerHeight * 0.25);

  d3.select(".splash-container")
    .style("height", fullPageHeight + "px");
    
  d3.selectAll(".step")
    .style("height", fullPageHeight + "px");
  
  let mapWH = fullPageHeight;
  if (halfPageHeight >  width) {
    mapWH  =  width;
  }
  
  d3.select(".map-graphic-container")
    .style("width", width + "px")
    .style("height", width + "px")
    .style("top", quarterPageHeight + "px")

  d3.select(".bar-graphic-container")
    .style('top', halfPageHeight + 'px')
    .style("width", width + "px")
    .style("height", halfPageHeight + "px")

  d3.select(".line-graphic-container")
    .style('top', halfPageHeight + 'px')
    .style("width", width + "px")
    .style("height", halfPageHeight + "px")

  // // Desktop Layout
  if (window.innerWidth > 768) {
  //   d3.select(".bar-graphic-container")
  //     .style('top', quarterPageHeight + 'px')
  //     .style("width", halfPageWidth + "px")
  //     .style("height", halfPageHeight + "px")
  //     .style("max-width", "50%")

    d3.select(".map-graphic-container")
      .style("width", halfPageHeight + "px")
      .style("height", halfPageHeight + "px")


    d3.select(".bar-graphic-container")
      .style('top', halfPageHeight + 'px')
      .style("width", halfPageHeight + "px")
      .style("height", halfPageHeight + "px")

    d3.select(".line-graphic-container")
      .style('top', halfPageHeight + 'px')
      .style("width", halfPageHeight + "px")
      .style("height", halfPageHeight + "px")

    d3.select('.story-container')
      .style("max-width", halfPageHeight + "px")

    d3.selectAll('.step')
      .style("max-width", halfPageHeight + "px")

  }
  // max width === 640

  // min height for this would have to be 1280
  // width = 640 = height = 640

  // map over 

  // half pag

  // at large screen heights make the max height the same as the width of the story-container
} 