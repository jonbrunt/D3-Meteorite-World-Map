// main program function
function main() {
  // declares constants for d3 functionality
  const svg = d3.select('#main').append('svg');
  // g elements appended in order for appropriate DOM rendering of svg
  const map = svg.append('g'); // map is underlying layer
  const points = svg.append('g'); // data points are top layer
  const projection = d3.geoEquirectangular() // map projection type
    .translate([600, 311])
    .scale(191);
  const path = d3.geoPath()
    .projection(projection);
  // map data/path execution
  map.append('path')
    .attr('d', path(worldPath)); // JSON object stored in separate JS file

  // AJAX for meteorite data
  const url = 'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json';
  d3.json(url, (err, obj) => {
    const rawData = obj.features; // assigns single array from object as the rawData
    // filters raw data for presence of meteorite coordinates
    const data = rawData.filter(d => d.geometry && parseInt(d.properties.mass, 10) > 0);
    const massVariance = d3.extent(data, d => parseInt(d.properties.mass, 10));
    // square root (exponent 1/2) range scale to control radius size due to mass range
    const radiiScale = d3.scaleSqrt()
      .domain(massVariance)
      .range([2, 20]);
    // logarithmic color scale to account for large mass range
    const colorScale = d3.scaleLog()
      .domain(massVariance)
      .range(['#ff0000', '#00ff00', '#0000ff']);
    // generates geographic data points
    const circles = points.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => projection(d.geometry.coordinates)[0])
      .attr('cy', d => projection(d.geometry.coordinates)[1])
      .attr('r', d => `${radiiScale(parseInt(d.properties.mass, 10))}px`)
      .attr('fill', d => colorScale(parseInt(d.properties.mass, 10)))
      .style('stroke', '#000')
      .style('stroke-width', 0.75)
      .style('opacity', 0.80);
    // tooltip
    const tooltip = d3.select('body')
      .append('div')
      .classed('tooltip', true);
    // reveals tooltip data for nodes
    function tooltipOn(d) {
      d3.event.preventDefault();
      tooltip
        .style('left', `${d3.event.x}px`)
        .style('top', `${d3.event.y - 80}px`) // positions tip above hover point
        .style('opacity', '0.95')
        .html(`
          <p>Name: ${d.properties.name}</p>
          <p>Mass: ${d.properties.mass}</p>
          <p>Year: ${d.properties.year.split('-')[0]}</p>
        `);
    }
    // hides tooltip data display
    function tooltipOff() {
      d3.event.preventDefault();
      tooltip
        .style('opacity', '0');
    }
    // tooltip activation/deactivation for desktop and mobile
    circles
      .on('mousemove touchstart', tooltipOn)
      .on('mouseout touchend', tooltipOff);
  });
}
// executes main function after DOM is loaded
document.addEventListener('DOMContentLoaded', main());
