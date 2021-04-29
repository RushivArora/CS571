function heatMap1(){

  var svg = d3.selectAll('#node').attr('width',document.getElementById('nodeDiv'));
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


var margin = {top: 0, right: 0, bottom: 0, left: 10},
width = document.getElementById('nodeDiv').offsetWidth - margin.left - margin.right,
height = document.getElementById('nodeDiv').offsetHeight + margin.top - margin.bottom;

var color = d3.scaleThreshold()
.domain([10000, 100000, 500000, 1000000, 5000000, 10000000])
.range(d3.schemeReds[6]);
var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var formatTime = d3.timeFormat("%B %d, %Y");

// zoomed = ()=>{
//   const {x,y,k} = d3.event.transform
//   let t = d3.zoomIdentity
//   t =  t.translate(x,y).scale(k).translate(50,50)
//   svg.attr("transform", t)
// }
// var zoom = d3.zoom()
// .scaleExtent([1, 30])
// .on("zoom", zoomed);

var svg = d3.select("#node")
.attr("width", width)
.attr("height", height)
.append('g')
.attr('class', 'map')
.append("g").attr('transform','translate(50,50)');


// var projection = d3.geoMercator()
// .scale(0.03939*width + 0.104166*height+20)
// .translate( [width/2.3, height / 1.85]);

const projection = d3.geoRobinson()
                     .scale(200)
                     .rotate([352, 0, 0])
                     .translate( [width / 2, (height - 100) / 2]);

var path = d3.geoPath().projection(projection);

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

var check = 0;



svg.append("text")
  .attr("x", (width / 2))
  .attr("y", 30)
  .attr("text-anchor", "middle")
  .style("font-size", 30)
  .style("font-weigth", "bold")
  .style("text-decoration", "underline")
  .text("World Cases Map");

queue()
.defer(d3.json, '../world_countries.json')
.defer(d3.csv, '../owid-covid-data.csv')
.await(ready);

function ready(error, data, covid_map) {

  // console.log(covid_map)

  const populationById = {};
  const allDates = {};
  covid_map.forEach(d => {
    if(formatTime(parseTime(d.date)) == formatTime(globalStart)){
      populationById[d.iso_code] = +d.total_cases;}
    });
  data.features.forEach(d => { d.population = populationById[d.id] });

  console.log(data.features)

  var populationByIdList = d3.entries(populationById);

  temp  = d3.min(populationByIdList, function(d){ return d.value; });

  svg.append("g")
  .attr("class", "countries")
  .selectAll("path")
  .data(data.features)
  .enter().append("path")
  .attr("d", path)
  .style("fill", function(d) { return color(populationById[d.id]); })
  .style('stroke', 'white')
  .style('stroke-width', 0.5)
  .style("opacity",1)
        // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          console.log(d.features)
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

          worldRace(d.properties.name);
          worldPercent(d.properties.name);



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

        //Description
        function wrap(text, width) {
               text.each(function () {
                   var text = d3.select(this),
                       words = text.text().split(/\s+/).reverse(),
                       word,
                       line = [],
                       lineNumber = 0,
                       lineHeight = 1.1, // ems
                       x = text.attr("x"),
                       y = text.attr("y"),
                       dy = 0, //parseFloat(text.attr("dy")),
                       tspan = text.text(null)
                                   .append("tspan")
                                   .attr("x", x)
                                   .attr("y", y)
                                   .attr("dy", dy + "em");
                   while (word = words.pop()) {
                       line.push(word);
                       tspan.text(line.join(" "));
                       if (tspan.node().getComputedTextLength() > width) {
                           line.pop();
                           tspan.text(line.join(" "));
                           line = [word];
                           tspan = text.append("tspan")
                                       .attr("x", x)
                                       .attr("y", y)
                                       .attr("dy", ++lineNumber * lineHeight + dy + "em")
                                       .text(word);
                       }
                   }
               });
           }
           var desc = svg.append("g")
                           .attr("class", "description")
                           //.attr("transform", "translate(" + 50 + "," + 700 + ")");
           desc.append("text")
             .attr('x', 50)
             .attr('y', 775)
             .attr("fill", "black")
             .attr('font-size', 16)
             .text("This visualisation displays the progression of the Covid-19 pandemic distribution over time in all the countries in the world.\
              The period of time covered in this visualisation is 01/01/2020 - 04/13/2021.")
              .call(wrap, 1200);

          var note = svg.append("g")
                              .attr("class", "note")
                              //.attr("transform", "translate(" + 50 + "," + 700 + ")");
              note.append("text")
                .attr('x', 50)
                .attr('y', 810)
                .attr("fill", "black")
                .attr('font-size', 16)
                .attr('font-weight','bold')
                .text("Note: Data for countries with political disputes, such as North Korea, is not available.")
                .call(wrap, 1200);

    //All the work on the slider:

    var startDate = new Date("2020-01-01"),
    endDate = new Date("2021-04-14");

    var margin2 = {top:0, right:50, bottom:50, left:50},
    width2 = width - margin2.left - margin2.right,
    height2 = height;

    var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([margin2.right, width2])
    .clamp(true);

    var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + (margin.left-20) + "," + 700 + ")");

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
          populationById[d.iso_code] = 0;
          code = d.iso_code;
        }

        if(formatTime(parseTime(d.date)) == formatTime(globalStart)){
            populationById[d.iso_code] = +d.total_cases;
            code = d.iso_code;
          }
      });



      data.features.forEach(d => { d.population = populationById[d.id] });

      svg.call(tip);

      svg.selectAll("path")
         .style('fill', d => color(populationById[d.id]))

    }


  }

}
