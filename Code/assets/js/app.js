// @TODO: YOUR CODE HERE!


var svgWidth = 1000;
var svgHeight = 600;

var margins = {
    top: 40,
    right: 50,
    bottom: 60,
    left: 50
};

var width = svgWidth - margins.left - margins.right
var height = svgHeight - margins.top - margins.bottom

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3.select('#scatter')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)

// Append an SVG group    
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margins.left},${margins.top})`)

// Initial Params    
var chosenXAxis = 'poverty'

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
        .call(bottomAxis)


    return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d => newXScale(d[chosenXAxis]));

    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === 'poverty') {
        var label = "Poverty Rate(%)";
    }
    else if (chosenXAxis === 'age') {
        var label = "Age (Median)";
    }
    else if (chosenXAxis === 'income') {
        var label = 'Income (Median)'
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function (d) {
            return (`${d.obesity}<br>${label} ${d[chosenXAxis]}`);
        });

    circlesGroup.call(toolTip);

    circlesGroup.on('mouseover', function (data) {
        toolTip.show(data);
    })
    // onmouseout event
    on('mouseout', function (data, index) {
        toolTip.hide(data);
    });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv('../assets/data/data.csv').then(function (data) {

    // parse data
    data.forEach(function (data) {


        data.abbr = data.abbr;
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes

    });

    // xLinearScale function above csv import
    var xLinearScale = xScale(data, chosenXAxis);

    // Create y scale function
    var yLinearScale = d3.scaleLinear()
        .domain([20, d3.max(data, d => d.obesity)])
        .range([height, 0]);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    chartGroup.append('g')
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
    var labelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 10)
        .attr('value', 'poverty')
        .attr('text-anchor', 'middle')
        .classed('active', true)
        .text('Poverty Rate(%)');



    // append y axis
    chartGroup.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', 0 - margins.left)
        .attr('x', 0 - (height / 2))
        .attr('dy', '1em')
        .classed('axis-text', true)
        .text('Obese (%)')


    // x axis labels event listener
    labelsGroup.selectAll("text")
        .on("click", function () {
            // get value of selection
            var value = d3.select(this).attr('value');
            if (value !== chosenXAxis) {

                chosenXAxis = value;
                console.log(xAxis)
                xLinearScale = xScale(data, chosenXAxis);
                console.log(data)
                console.log(chosenXAxis)
                console.log(xLinearScale)

                xAxis = renderAxes(xLinearScale, xAxis);
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

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