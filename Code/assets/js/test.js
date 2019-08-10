var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

// function used for updating x-scale var upon click on axis label
function xScale(data, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(data, d => d[chosenXAxis]) * 0.8,
    d3.max(data, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXaxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var label = "Hair Length:";
  }
  else if (chosenXAxis === 'age') {
    var label = "# of Albums:";
  }
  else if (chosenXAxis === 'income') {
    var label = "# of Albums:";
  }

  var toolTip = d3.tip()
  .attr("class", "tooltip")
  .offset([80, -60])
  .html(function (d) {
    return (`${d.poverty}<br>${label} ${d[chosenXAxis]}`);
  });

circlesGroup.call(toolTip);

circlesGroup.on("mouseover", function (data) {
  toolTip.show(data);
})
  // onmouseout event
  .on("mouseout", function (data, index) {
    toolTip.hide(data);
  });

return circlesGroup;
}


// Retrieve data from the CSV file and execute everything below
d3.csv('../assets/data/data.csv', function (data) {

  // parse data
  data.forEach(function (data) {
    data.id = +data.id;
    data.state = data.state;
    data.abbr = data.abbr;
    data.poverty = +data.poverty;
    data.povertyMoe = +data.povertyMoe;
    data.age = +data.age;
    data.ageMoe = +data.ageMoe;
    data.income = +data.income;
    data.income = +data.incomeMoe;
    data.healthcare = +data.healthcare;
    data.healthcareLow = +data.healthcareLow;
    data.healthcareHigh = +data.healthcareHigh;
    data.obesity = +data.obesity;
    data.obesityLow = +data.obesity;
    data.obesityHigh = +data.obesityHigh;
    data.smokes = +data.smokes
    data.smokesLow = +data.smokesLow;
    data.smokesHigh = +data.smokesHigh;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(data, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.obesity)])
    .range([height, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);


    // append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(data)
        .enter()


    circlesGroup.append('circle')
        .attr('cx', d => xLinearScale(d[chosenXAxis]))
        .attr('cy', d => yLinearScale(d.obesity))
        .attr('r', 10)
        .attr('fill', 'blue')
        .attr('opacity', '.5')

    circlesGroup.append('text')
        .attr('fill', 'white')
        .style('text-anchor', 'middle')
        .attr('font-size', 8)
        .attr('x', d => xLinearScale(d[chosenXAxis]))
        .attr('y', d => yLinearScale(d.obesity))
        .text(d => d.abbr)


  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var hairLengthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("Hair Metal Ban Hair Length (inches)");

  var hairLengthLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "age") // value to grab for event listener
    .classed("active", true)
    .text("Hair Metal Ban Hair Length (inches)");

  var albumsLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("# of Albums Released");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("obesity");

  // updateToolTip function above csv import


  labelsGroup.selectAll("text")
    .on("click", function () {
      // get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = value;

        console.log(value)

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(data, chosenXAxis);

        // updates x axis with transition
        xAxis = renderAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        if (chosenXAxis === 'poverty') {
          povertyLabel
            .classed('active', true)
            .classed('inactive', false)
          ageLabel
            .classed('active', false)
            .classed('inactive', true)
          incomeLabel
            .classed('active', false)
            .classed('inactive', true)
        }
        else if (chosenXAxis === 'age') {
          povertyLabel
            .classed('active', false)
            .classed('inactive', true)
          ageLabel
            .classed('active', true)
            .classed('inactive', false)
          incomeLabel
            .classed('active', false)
            .classed('inactive', true)
        }
        else if (chosenXAxis === 'income') {
          povertyLabel
            .classed('active', false)
            .classed('inactive', true)
          ageLabel
            .classed('active', false)
            .classed('inactive', true)
          incomeLabel
            .classed('active', true)
            .classed('inactive', false)
        }

      }
    })
});