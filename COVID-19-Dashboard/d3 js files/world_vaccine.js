function vaccineWorld(){

  var svg = d3.selectAll('#latestCasesNode').attr('width',document.getElementById('latestCaseDiv'));
        //Using this selection to update the SVG everytime the function is called
        svg.selectAll("*").remove();

        removeElementsByClass('d3-tip n');


        var format = d3.format(",");

// Set tooltips
const tip = d3.tip()
              .attr('class', 'd3-tip')
              .offset([-10, 0])
              .html(d => `<strong>Country: </strong><span class='details'>${d.properties.name}<br></span><strong>Vacinations per 100: </strong><span class='details'>${format(d.totalperhundred)}<br></span><strong>Total Vaccinations: </strong><span class='details'>${format(d.total)}</span>`);


var margin = {top: 0, right: 0, bottom: 0, left: 10},
width = document.getElementById('latestCaseDiv').offsetWidth - margin.left - margin.right,
height = document.getElementById('latestCaseDiv').offsetHeight + margin.top - margin.bottom;

var color = d3.scaleThreshold()
             .domain([0, 0.5, 8, 16, 24, 32, 40, 48, 56, 90])
              .range(d3.schemeBlues[7]);

var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var formatTime = d3.timeFormat("%B %d, %Y");
const projection = d3.geoRobinson()
                     .scale(200)
                     .rotate([352, 0, 0])
                     .translate( [width / 2, (height - 100) / 2]);

const path = d3.geoPath().projection(projection);

svg.call(tip);

var parseTime = d3.timeParse("%Y-%m-%d");
var globalStart = new Date("2021-04-14");

//Function for converting CSV values from strings to Dates and numbers
var rowConverter = function(d) {
  return {
    Date: parseTime(d.date),
    Amount: parseInt(d.total_cases)
  };
}

queue()
.defer(d3.json, '../world_countries.json')
.defer(d3.csv, '../owid-covid-data.csv')
.await(ready);

var check = 0;

function ready(error, data, covid_map) {

  // console.log(covid_map)

  const vaccinationByID = {};
  const vaccinationByIDPerHundred = {};
  const allDates = {};

  covid_map.forEach(d => { 
    var temp = new Date(d.date)
    if(d.new_vaccinations_smoothed != "" && temp > startDate && temp < globalStart){
      vaccinationByID[d.iso_code] += parseFloat(d.new_vaccinations_smoothed);
    }

    if(d.total_vaccinations_per_hundred != "" && temp > startDate && temp < globalStart){
      vaccinationByIDPerHundred[d.iso_code] = parseFloat(d.total_vaccinations_per_hundred);
    }
  });

  console.log(vaccinationByID)
  console.log(vaccinationByIDPerHundred)

  data.features.forEach(d => { d.population = vaccinationByID[d.id] });

  var vaccinationyIdList = d3.entries(vaccinationByID);

  temp  = d3.min(vaccinationyIdList, function(d){ return d.value; });

  svg.append("g")
  .attr("class", "countries")
  .selectAll("path")
  .data(data.features)
  .enter().append("path")
  .attr("d", path)
  .style('fill', d => color(vaccinationByID[d.id]))
  .style('stroke', 'white')
  .style('stroke-width', 0.5)
  .style("opacity",1)
        // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          // console.log(d.features)
          tip.show(d);

          d3.select(this)
          .style("opacity", 0.4)
          .style("stroke","white")
          .style("stroke-width",3);

          d3.select(this).style('cursor', 'pointer')
        })
        .on('click',function(d){
          tip.show(d);

          d3.select(this)
          .style("opacity", 0.4)
          .style("stroke","white")
          .style("stroke-width",3)
          .transition()
          .duration(200)
          .style('opacity', 0.8);

          top6_effected(globalStart);



        })
        .on('mouseout', function(d){
          tip.hide(d);

          d3.select(this)
          .style("opacity", 1)
          .style("stroke","white")
          .style("stroke-width",0.3);
        });

        svg.append("path")
        .datum(topojson.mesh(data.features, function(a, b) { return a.id !== b.id; }))
        .attr("class", "names")
        .attr("d", path);

    //All the work on the slider:

    var startDate = new Date("2020-01-01"),
    endDate = new Date("2021-04-14");

    var margin2 = {top:0, right:50, bottom:50, left:50},
    width2 = width - margin2.left - margin2.right,
    height2 = height;
    
    var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([0, width2])
    .clamp(true);

    var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin2.left + "," + 700 + ")");

    slider.append("line")
    .attr("class", "track")
    .attr("x1", x.range()[0])
    .attr("x2", x.range()[1])
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-inset")
    .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
    .attr("class", "track-overlay")
    .call(d3.drag()
      .on("start.interrupt", function() { slider.interrupt(); })
      .on("start drag", function() { update(x.invert(d3.event.x)); }));

    slider.insert("g", ".track-overlay")
    .attr("class", "ticks")
    .attr("transform", "translate(0," + 18 + ")")
    .selectAll("text")
    .data(x.ticks(10))
    .enter()
    .append("text")
    .attr("x", x)
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
      handle.attr("cx", x(h));
      label
      .attr("x", x(h))
      .text(formatTime(h));

      var code = "Hello"
      covid_map.forEach(d => { 
        if(code != d.iso_code){
          vaccinationByID[d.iso_code] = 0;
          code = d.iso_code;
          vaccinationByIDPerHundred[d.iso_code] = "0";
        }

        

        var temp = new Date(d.date)
        if(d.new_vaccinations_smoothed != "" && temp > startDate && temp < globalStart){
          vaccinationByID[d.iso_code] += parseFloat(d.new_vaccinations_smoothed);
        }

        if(d.total_vaccinations_per_hundred != "" && temp > startDate && temp < globalStart){
          vaccinationByIDPerHundred[d.iso_code] = +d.total_vaccinations_per_hundred;
        }

      });

      data.features.forEach(d => { d.totalperhundred = vaccinationByIDPerHundred[d.id];
                                   d.total = vaccinationByID[d.id];
           });

      console.log(vaccinationByIDPerHundred)

      svg.selectAll("path")
         .style('fill', d => color(vaccinationByIDPerHundred[d.id]))

    }


  }

}