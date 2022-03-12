/*
*   main.js
*   Practice bar chart using buidling heights dataset
*
*/


// SET MARGIN: leave room for x-axis label (top) and y-axis label (left)
const MARGIN = {LEFT: 100, BOTTOM: 100, TOP: 10, RIGHT: 10}
const WIDTH = 600 - MARGIN.LEFT - MARGIN.RIGHT
// SET CHART DIMENSIONS
const HEIGHT = 400 - MARGIN.TOP - MARGIN.BOTTOM

// SET SVG CANVAS
const svg = d3.select("#chart-area").append("svg")
    .attr("width", WIDTH + MARGIN.LEFT + MARGIN.RIGHT)
    .attr("height", HEIGHT + MARGIN.BOTTOM + MARGIN.TOP)

// PREPARE SVG
// --- + group
const g = svg.append("g")
    // ${} forces JS to interpret MARGIN values as variables
    .attr("transform", `translate(${MARGIN.LEFT}, ${MARGIN.TOP})`)

// --- + x axis label
g.append("text")
    .attr("class", "xaxis-label")
    .attr("x", WIDTH/2)
    .attr("y", HEIGHT + MARGIN.BOTTOM/1.6)
    .attr("font-size", "15px")
    .attr("text-anchor", "middle")
    .text("World's tallest buildings")

// --- + y axis label
g.append("text")
    .attr("class", "yaxis-label")
    .attr("x", -HEIGHT/2)
    .attr("y", -MARGIN.LEFT/2)
    .attr("font-size", "15px")
    .attr("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    // rotation flips coordinates
    // move down: -x
    // move left: -y
    .text("Height (m)")

// ADD DATA-DRIVEN ELEMENTS
// --- + data
d3.json("data/buildings.json").then(data => {
    data.forEach(d => {
        d.height = Number(d.height)
    })
    console.log(data)
    // --- + x transformation
    const x = d3.scaleBand()
        .domain(data.map(d => { return d.name }))
        .range([0, WIDTH])
        .paddingInner(0.2) //value from 0 to 1
        .paddingOuter(0.1)
    
    // --- + y transformation
    const y = d3.scaleLinear()
        .domain([0, 
                 d3.max(data, d => { return d.height })])
        .range([HEIGHT, 0])
    
    // --- + bars
    const rects = g.selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("width", x.bandwidth)
        .attr("x", (d) => { return x(d.name) })
        .attr("y", (d) => { return y(d.height) })
        .attr("height", (d) => {return HEIGHT - y(d.height)})
        .attr("fill", (d) => {
            // highlight tallest building
            if (d.height === d3.max(data, d => {return d.height})) {
                return "#E27616"
            } else {
                return "#1A4F8F"
            } 
        })
    console.log(y(350))
    
    g.selectAll(".data-label") //select data labels only
        .data(data)
        .enter()
        .append("text")
        .attr("class", "data-label")
        .attr("x", (d) => { return x(d.name) + 13 })
        .attr("y", (d) => { return y(d.height) + 15 })
        .attr("fill", "#FFFFFF")
        .attr("font-size", "13px")
        .text((d) => {return d3.format(".1f")(d.height)})
    
    console.log(g.selectAll("text"))
    
    // --- + xaxis
    const xAxisCall = d3.axisBottom(x)
    g.append("g")
        .attr("class", "xaxis")
        .attr("transform", `translate(0, ${HEIGHT})`)
        .call(xAxisCall)
        .selectAll("text")
        .call(wrap, x.bandwidth())
    // --- + yaxis
    const yAxisCall = d3.axisLeft(y)
        .ticks(5)
        .tickFormat(d => d + "m")
    g.append("g")
        .attr("class", "yaxis")
        .call(yAxisCall) 
    
    
}).catch(error => {
    console.log(error)
})

function wrap(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em")
    while (word = words.pop()) {
      line.push(word)
      tspan.text(line.join(" "))
      if (tspan.node().getComputedTextLength() > width) {
        line.pop()
        tspan.text(line.join(" "))
        line = [word]
        tspan = text.append("tspan")
            .attr("x", 0)
            .attr("y", y)
            .attr("dy", `${++lineNumber * lineHeight + dy}em`).text(word)
      }
    }
  })
}