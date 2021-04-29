function lineChart(){

  var svg = d3.selectAll('#lineGraphNode').attr('width',document.getElementById('lineGraphDiv').offsetWidth);
        //Using this selection to update the SVG everytime the function is called
        svg.selectAll("*").remove();

        removeElementsByClass('d3-tip n');


        var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-10, 0])
.html(function(d) {
  return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Total Cases: </strong><span class='details'>" + d.population +"<br></span>";
})


var margin = {top: 0, right:0, bottom: 50, left: 90},
width = document.getElementById('lineGraphDiv').offsetWidth - margin.left - margin.right,
height = document.getElementById('lineGraphDiv').offsetHeight - margin.top - margin.bottom;


var startDate = new Date("2020-01-01"),
endDate = new Date("2021-04-14");


var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var formatTime = d3.timeFormat("%B %d, %Y");
var parseTime = d3.timeParse("%Y-%m-%d");
var globalStart = new Date("2021-03-14");

queue()
.defer(d3.csv, '../owid-covid-data.csv')
.await(ready);

var svgall = d3.select("#lineGraphNode")
            .attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'map')
            .append("g").attr('transform','translate(100,-20)');
orig_height = height
height = height - 200
svg = svgall.attr("width", width)
            .attr("height", height)
            .append('g')
            .attr('class', 'plot')
            .append("g");//.attr('transform','translate(0,-20)');

console.log(startDate)
var check = 0;



svg.append("text")
  .attr("x", (width / 2))
  .attr("y", 45)
  .attr("text-anchor", "middle")
  .style("font-size", 30)
  .style("font-weigth", "bold")
  .style("text-decoration", "underline")
  .text("Cases by Country");

var globalStart = new Date("2021-04-14");

//Read the data
function ready(error, data){

  console.log(data);

  const casesById = {};

  //Step 1: Group all the data. Will get one line per group
  var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.iso_code;})
    .entries(data);

  //Step 2: Get a list of all the countries and create an entry in the dictionary
  var res = sumstat.map(function(d){ return d.key })
  res.forEach(d => {
    casesById[d] = 0.0

  });

  var datanew = []

  //Sttep 3: Get the total number of cases for a given country up till a given date
  data.forEach(d => {

    if(d.iso_code == "OWID_EUR" || d.iso_code == "OWID_NAM" || d.iso_code == "OWID_ASI" || d.iso_code == "OWID_AFR" || d.iso_code == "OWID_EUN" || d.iso_code == "OWID_INT" || d.iso_code == "OWID_KOS" || d.iso_code == "OWID_CYN" || d.iso_code == "OWID_OCE" || d.iso_code == "OWID_SAM"){
      return;
    }

    var temp = new Date(d.date)
    if(d.new_cases != "" && temp > startDate && temp < endDate){
      casesById[d.iso_code] += parseFloat(d.new_cases);
      datanew.push(d);
    }
  });

  console.log(casesById);

  //Step 4.1: Convert the dictionary to an array
  var items = Object.keys(casesById).map(function(key) {
  return [key, casesById[key]];
  });

  // Step 4.2: Sort the array based on the second element
  items.sort(function(first, second) {
    return second[1] - first[1];
  });

  // Step 4.3: Get the top 10 countries
  var topItems = items.slice(0,9)
  console.log(topItems)

  // Step 5: Get a group of only the first 10 countries (as listed above)
  var datanew2 = []
  datanew.forEach(d => {
    if(exists(topItems, d.iso_code)){
      datanew2.push(d)
    }

  })

  var sumstat2 = d3.nest() // nest function allows to group the calculation per level of a factor
    .key(function(d) { return d.iso_code;})
    .entries(datanew2);

  var res2 = sumstat2.map(function(d){ return d.key })
  var color = d3.scaleOrdinal()
    .domain(res2)
    .range(['#003f5c','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600','#fbe0c4'])

  //console.log(sumstat2);
  console.log(datanew)
  console.log(datanew2)
  console.log(sumstat2)
  var temporal = [...sumstat2]

  // Add X axis --> it is a date format
  var x = d3.scaleTime()
            .domain([startDate, endDate])
            .range([ 0, width ])

  var xAxis = d3.axisBottom()
                .scale(x)
                .ticks(10);

  // Add Y axis
  var y = d3.scaleLinear()
            .domain([0, d3.max(data, function(d) { return +d.total_cases; })])
            .range([ height-10, 0 ]);

  var yAxis = d3.axisLeft()
                .scale(y);


  svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + (height) + ")")
        .call(xAxis);

  //Create Y axis
  svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);

  // Draw the line

   var lines =  svg.selectAll(".line")
                   .data(sumstat2)
                   .enter().append("g")
                   .append("path")
                   .attr("class", "lines")
                   .attr("fill", "none")
                   .attr("data-legend",function(d) { return d.key})
                   .attr("stroke", function(d){ return color(d.key) })
                   .attr("stroke-width", 2.5)
                   .attr("d", function(d){
                      return d3.line()
                        .x(function(d) { return x(new Date(d.date)); })
                        .y(function(d) { return y(+d.total_cases); })
                        (d.values)
                    })
    lines.append("text")
      .attr("x", 3)
      .attr("dy", ".15em")
      .text(function(d) { return d.key; });

      // Handmade legend
      var legendCircle = svg.selectAll("circle")
          .data(topItems)
          .enter()
          .append("circle")
          .attr("cx",20)
          .attr("cy",function(d,i){
           return 30 + i*15;
         })
          .attr("r", 6)
          .style("fill", function(d){
           return color(d[0]);
         })

      var legendText = svg.selectAll("texting")
        .data(topItems)
        .enter()
        .append("text")
        .attr('class', 'abc')
        .attr("x", 35)
        .attr("y", function(d,i){
         return 30 + i*15;
       })
        .text(function(d){
          if(d[0] == "OWID_WRL"){
            return "WORLD"
          }
          return d[0];
        })
        .style("font-size", "15px")
        .attr("alignment-baseline","middle")

    sumstat2.reverse()

  function exists(arr, search) {
    return arr.some(row => row.includes(search));
  }

  /*
  ALL THE SLIDER STUFF
  */

  var margin2 = {top:0, right:50, bottom:0, left:30},
    width2 = width - margin2.left - margin2.right,
    height2 = height - margin2.top - margin2.bottom + margin.top + margin.bottom;

  var x_slider = d3.scaleTime()
                   .domain([startDate, endDate])
                   .range([0, width2])
                   .clamp(true);

  var slider = svgall.append("g")
                  .attr("class", "slider")
                  .attr("transform", "translate(" + 0 + "," + (orig_height-125) + ")");

  slider.append("line")
        .attr("class", "track")
        .attr("x1", x_slider.range()[0])
        .attr("x2", x_slider.range()[1])
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-inset")
        .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
        .attr("class", "track-overlay")
        .call(d3.drag()
        .on("start.interrupt", function() { slider.interrupt(); })
        .on("start drag", function() { update(x_slider.invert(d3.event.x)); })
        .on("end", function() { doneSliding(x_slider.invert(d3.event.x)); }));

  slider.insert("g", ".track-overlay")
        .attr("class", "ticks")
        .attr("transform", "translate(0," + 18 + ")")
        .selectAll("text")
        .data(x_slider.ticks(10))
        .enter()
        .append("text")
        .attr("x", x_slider)
        .attr("y", 10)
        .attr("text-anchor", "middle")
        .text(function(d) { return formatDate(d); });

  var label = slider.append("text")
                    .attr("class", "label")
                    .attr("text-anchor", "middle")
                    .text(formatTime(globalStart))
                    .attr("transform", "translate(0," + (-25) + ")")

  var handle = slider.insert("circle", ".track-overlay")
                     .attr("class", "handle")
                     .attr("r", 9)

  if(check == 0){
    update(globalStart);
    check = 1;
  }


  function update(h) {
      globalStart = h;
      var date = formatDate(h);
      handle.attr("cx", x_slider(h));
      label
          .attr("x", x_slider(h))
          .text(formatTime(h));

  }

 function doneSliding(h){


  // Updata the line
  lines.data(sumstat2)
       .enter()
       .append("path")
       .attr("class","line")
       .merge(lines)
       .attr("d", function(d){
          return d3.line()
                   .x(function(d) { return x(new Date(d.date)); })
                   .y(function(d) { return y(+0); })
                     (d.values)
       })



    console.log("Done Sliding")
    endDate = new Date(formatDate(h));
    var date = formatDate(h);
    x.domain([startDate, new Date(date)]);

    svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis);

    const casesById = {};

    //Step 1: Group all the data. Will get one line per group
    var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
                    .key(function(d) { return d.iso_code;})
                    .entries(data);

    //Step 2: Get a list of all the countries and create an entry in the dictionary
    var res = sumstat.map(function(d){ return d.key })
          res.forEach(d => {
          casesById[d] = 0.0
    });

    var datanew = []

    //Step 3: Get the total number of cases for a given country up till a given date
    data.forEach(d => {

      if(d.iso_code == "OWID_EUR" || d.iso_code == "OWID_NAM" || d.iso_code == "OWID_ASI" || d.iso_code == "OWID_AFR" || d.iso_code == "OWID_EUN" || d.iso_code == "OWID_INT" || d.iso_code == "OWID_KOS" || d.iso_code == "OWID_CYN" || d.iso_code == "OWID_OCE" || d.iso_code == "OWID_SAM"){
          return;
      }

      var temp = new Date(d.date)
      if(d.new_cases != "" && temp > startDate && temp < endDate){
          casesById[d.iso_code] += parseFloat(d.new_cases);
          datanew.push(d);
      }
    });

    //Step 4.1: Convert the dictionary to an array
    var items = Object.keys(casesById).map(function(key) {
        return [key, casesById[key]];
    });

    // Step 4.2: Sort the array based on the second element
    items.sort(function(first, second) {
        return second[1] - first[1];
    });

    // Step 4.3: Get the top 10 countries
    var topItems = items.slice(0,9)
    console.log(topItems)

    // Step 5: Get a group of only the first 10 countries (as listed above)
    var datanew2 = []
    datanew.forEach(d => {
        if(exists(topItems, d.iso_code)){
            datanew2.push(d)
        }
    })

    sumstat2 = d3.nest() // nest function allows to group the calculation per level of a factor
                 .key(function(d) { return d.iso_code;})
                 .entries(datanew2)
                 //.sort(function(a, b){ return d3.ascending(a.values, b.values); })
    res2 = topItems.map(function(d){ return d[0] })
    console.log(res2)
    color = d3.scaleOrdinal()
              .domain(res2.reverse())
              .range(['#003f5c','#2f4b7c','#665191','#a05195','#d45087','#f95d6a','#ff7c43','#ffa600','#fbe0c4'])



    // Add Y axis
    y.domain([0, d3.max(datanew2, function(d) { return +d.total_cases; })])

    svg.select(".y.axis")
        .transition()
        .duration(1000)
        .call(yAxis);


  // Updata the line
  lines.data(sumstat2)
       .enter()
       .append("path")
       .attr("class","line")
       .merge(lines)
       .transition()
       .duration(1000)
       .attr("stroke", function(d){ return color(d.key) })
       .attr("d", function(d){
          return d3.line()
                   .x(function(d) { return x(new Date(d.date)); })
                   .y(function(d) { return y(+d.total_cases); })
                     (d.values)
       })

    sumstat2 = d3.nest() // nest function allows to group the calculation per level of a factor
                 .key(function(d) { return d.iso_code;})
                 .entries(datanew2)
                 .sort(function(a, b){ return d3.ascending(a.values, b.values); })

  //console.log(topItems)
  //console.log(sumstat2)

    legendText.data(topItems)
              .enter()

    legendCircle.data(topItems)
                .enter()

    d3.selectAll("circle.abc2")
      .each(function(d, i) {
        console.log(d)
            if(d[0] == "OWID_WRL"){
              d[0] = "WORLD"
            }
            d3.select(this).style(color(d[0]));
          })
      .transition()
      .duration(2000)

    d3.selectAll("text.abc")
      .each(function(d, i) {
            if(d[0] == "OWID_WRL"){
              d[0] = "WORLD"
            }
            d3.select(this).text(d[0]);
          })
      .transition()
      .duration(2000)


  }





  }


}
