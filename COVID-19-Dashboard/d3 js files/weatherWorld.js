function weatherWorld(){

  var svg = d3.selectAll('#node').attr('width',document.getElementById('nodeDiv').offsetWidth);
        //Using this selection to update the SVG everytime the function is called
        svg.selectAll("*").remove();

        removeElementsByClass('d3-tip n');


        var format = d3.format(",");

// Set tooltips
var tip = d3.tip()
.attr('class', 'd3-tip')
.offset([-10, 0])
.html(function(d) {
  return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>Total Cases: </strong><span class='details'>" + d.total_cases +"<br></span>"
  + "<strong>New Cases: </strong><span class='details'>" + d.new_cases +"<br></span>" + "<strong>Deaths: </strong><span class='details'>" + d.total_deaths +"<br></span>";
})

var margin = {top: 150, right: 0, bottom: 0, left: 10},
width = document.getElementById('nodeDiv').offsetWidth - margin.left - margin.right,
height = document.getElementById('nodeDiv').offsetHeight + margin.top - margin.bottom;

var color = d3.scaleThreshold()
             .domain(d3.range(0.0, 1.5, 1.5/9))
             .range(d3.schemeReds[9]);

        var formatDateIntoYear = d3.timeFormat("%Y");
        var formatDate = d3.timeFormat("%b %Y");
        var formatTime = d3.timeFormat("%B %d, %Y");
        var path = d3.geoPath();

    zoomed = ()=>{
      const {x,y,k} = d3.event.transform
      let t = d3.zoomIdentity
      t =  t.translate(x,y).scale(k).translate(50,50)
      svg.attr("transform", t)
    }
    var zoom = d3.zoom()
    .scaleExtent([1, 30])
    .on("zoom", zoomed);

    var svg = d3.select("#node")
    .attr("width", width)
    .attr("height", height)
    .call(zoom)
    .append('g')
    .attr('class', 'map')
    .append("g").attr('transform','translate(50,50)');


    var projection = d3.geoMercator()
    .scale(0.03939*width + 0.104166*height+20)
    .translate( [width/2.3, height / 1.85]);

    var path = d3.geoPath().projection(projection);

    svg.call(tip);

    var parseTime = d3.timeParse("%Y-%m-%d");
    var globalStart = new Date("2019-01-23");

//Function for converting CSV values from strings to Dates and numbers
var rowConverter = function(d) {
  return {
    Date: parseTime(d.date),
    Amount: parseInt(d.total_cases)
  };
}

queue()
.defer(d3.json, '../world_countries.json')
.defer(d3.csv, '../ww1.csv')
.await(ready);

function ready(error, data, covid_map) {

  // console.log(covid_map)

  const weatherById = {};
  const allDates = {};
  covid_map.forEach(d => {

    weatherById[d.id] = +d[globalStart.toISOString().slice(0,10)]
     });
  data.features.forEach(d => { d[globalStart.toISOString().slice(0,10)] = weatherById[d.properties.name] });

  svg.append("g")
  .attr("class", "countries")
  .selectAll("path")
  .data(data.features)
  .enter().append("path")
  .attr("d", path)
  .style("fill", function(d) { return color(d[globalStart.toISOString().slice(0,10)] = weatherById[d.properties.name]);
      })
  .style('stroke', 'white')
  .style('stroke-width', 0.5)
  .style("opacity",1)
        // tooltips
        .style("stroke","white")
        .style('stroke-width', 0.3)
        .on('mouseover',function(d){
          // console.log(d.total_cases)
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

    var startDate = new Date("2019-01-23"),
    endDate = new Date("2020-04-30");

    var margin2 = {top:0, right:50, bottom:50, left:50},
    width2 = width - margin2.left - margin2.right,
    height2 = height;

    var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([margin2.right, width2])
    .clamp(true);

    var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + 0 + ")");

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
    .text(formatTime(startDate))
    .attr("transform", "translate(0," + (-25) + ")")

    var handle = slider.insert("circle", ".track-overlay")
    .attr("class", "handle")
    .attr("r", 9)


    function update(h) {
      globalStart = h;
      var date = formatDate(h);
      handle.attr("cx", x(h));
      label
      .attr("x", x(h))
      .text(formatTime(h));

      covid_map.forEach(d => {weatherById[d.id] = +d[globalStart.toISOString().slice(0,10)];});

      svg.selectAll("path")
         .style('fill', d => color(weatherById[d.properties.name]))
    }


  }

}
