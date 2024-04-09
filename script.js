async function getData() {
  await fetch(
    "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
  )
    .then((res) => res.json())
    .then((json) => {
      displayGraph(json);
    });
}

let width = document.getElementById("root").scrollWidth * 0.95;
let height = window.innerHeight * 0.8;

const root = d3.select("#root");
const title = root.append("div").attr("id", "title");
title.append("h1").text("FreeCodeCamp Scatterplot Graph");
title.append("h2").text("Doping in Professional Bicycle Racing");

root
  .append("div")
  .attr("id", "graph")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

getData();

function displayGraph(data) {
  let years = [];
  data.forEach((el) => {
    years.push(el.Year);
  });
  const svg = d3.select("svg");

  const x = d3.scaleLinear();
  x.range([0, width - 80]);
  x.domain([d3.min(years) - 1, d3.max(years) + 1]);

  const xAxis = d3.axisBottom(x);
  xAxis.tickFormat((d) => d);

  const y = d3.scaleUtc();
  y.domain([36 * 60 * 1000, 40 * 60 * 1000]);
  y.range([height - 20, 20]);

  const yAxis = d3.axisLeft(y);
  yAxis.tickFormat(function (d) {
    const minutes = Math.floor(d / (1000 * 60));
    const seconds = Math.floor(d % (1000 * 60));
    return `${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0").slice(0, 2)}`;
  });
  yAxis.ticks(d3.utcSecond.every(15));

  // Axes
  svg
    .append("g")
    .attr("transform", `translate(50,${height - 20})`)
    .attr("id", "x-axis")
    .call(xAxis);
  svg
    .append("g")
    .attr("transform", "translate(50, 0)")
    .attr("id", "y-axis")
    .call(yAxis);

  // Dots
  svg
    .selectAll("circle")
    .data(data)
    .join("circle")
    .attr("data-xvalue", (d) => d.Year)
    .attr("data-yvalue", (d) => new Date(d.Seconds * 1000))
    .attr("cx", (d) => x(d.Year) + 50)
    .attr("cy", (d) => y(d.Seconds * 1000))
    .attr("r", "10")
    .attr("class", "dot")
    .on('mouseover', (e) => displayTooltip(e))
    .on('mouseout', () => hideTooltip());

  // Tooltip
  svg.append('g')
    .attr('id', 'tooltip')
    .attr('fill', '#a7dbcc')

  // Legend
  const legend = svg.append("g").attr("id", "legend");
  const noAllegations = legend.append("g");
  const allegations = legend.append("g");

  noAllegations
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "#329ea8")
    .attr("x", x(2010) + 50)
    .attr("y", y((36 * 60 + 15) * 1000));

  noAllegations
    .append("text")
    .text("no doping allegations")
    .attr("x", x(2011) + 50)
    .attr("y", y((36 * 60 + 15) * 1000))
    .attr("dy", "1rem");

  allegations
    .append("rect")
    .attr("width", 20)
    .attr("height", 20)
    .attr("fill", "#c29c2d")
    .attr("x", x(2010) + 50)
    .attr("y", y((36 * 60 + 15) * 1000) + 20);

  allegations
    .append("text")
    .text("doping allegations")
    .attr("x", x(2011) + 50)
    .attr("y", y((36 * 60 + 15) * 1000) + 20)
    .attr("dy", "1rem");
}

function displayTooltip(e) {
  const dot = e.target;
  const attributes = dot.attributes;
  let attrArray = [];
  Array.from(attributes).forEach((attribute) => attrArray.push(attribute.value));

  const tooltip = d3.select('#tooltip')
    .attr('x', attrArray[2])
    .attr('y', attrArray[3])
    .style('display', 'block')
    .attr('width', 300)
    .attr('height', 200)
    .attr('data-year', attrArray[0])
  
  tooltip.append('text')
    .text(`Year: ${attrArray[0]}`)
    .attr('x', (Number(attrArray[2]) + 20))
    .attr('y', Number(attrArray[3]))
    .attr('class', 'tooltipText');
  tooltip.append('text')
    .text(`Time: ${Math.floor(new Date(attrArray[1])/(60 * 1000))}:${Math.floor(new Date(attrArray[1])%(60 * 1000)).toString().padStart(2, '0').slice(0,2)}`)
    .attr('x', (Number(attrArray[2]) + 20))
    .attr('y', (Number(attrArray[3]) + 20))
    .attr('class', 'tooltipText');

}

function hideTooltip() {
  const tooltip = d3.select('#tooltip')
    tooltip.style('display', 'none');
  d3.selectAll('.tooltipText').remove();
}