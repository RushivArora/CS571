function weatherUSA(){

  var svg = d3.selectAll('#latestCasesNode').attr('width',document.getElementById('latestCaseDiv').offsetWidth);
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
width = document.getElementById('latestCaseDiv').offsetWidth - margin.left - margin.right,
height = document.getElementById('latestCaseDiv').offsetHeight + margin.top - margin.bottom;

var color = d3.scaleThreshold()
.domain(d3.range(0.0, 1.5, 1.5/5))
.range(d3.schemeReds[5]);

var formatDateIntoYear = d3.timeFormat("%Y");
var formatDate = d3.timeFormat("%b %Y");
var formatTime = d3.timeFormat("%B %d, %Y");
        // var path = d3.geoPath();

        zoomed = ()=>{
          const {x,y,k} = d3.event.transform
          let t = d3.zoomIdentity
          t =  t.translate(x,y).scale(k).translate(50,50)
          svg.attr("transform", t)
        }
        var zoom = d3.zoom()
        .scaleExtent([1, 30])
        .on("zoom", zoomed);

        var svg = d3.select("#latestCasesNode")
        .attr("width", width)
        .attr("height", height)
        .call(zoom)
        .append('g')
        .attr('class', 'map')
        .append("g").attr('transform','translate(50,50)');

    // var path = d3.geoPath();

    svg.call(tip);

    var parseTime = d3.timeParse("%Y-%m-%d");
    var globalStart = new Date("2019-01-23");

    // var projection = d3.geoAlbersUsa()
    // // .scale(0.03939*width + 0.104166*height+20)
    // .translate( [width/2, height / 2])
    // .scale(1000);

    var path = d3.geoPath()//.projection(projection);


    queue()
    .defer(d3.json, 'https://d3js.org/us-10m.v1.json')
    .defer(d3.csv, '../weather_usa.csv')
    .await(ready);

    function ready(error, usa, weather) {

  // console.log(covid_map)
  // console.log(usa)

  // var states = topojson.feature(usa, usa.objects.states).features;
  // // console.log(states);
  // svg.selectAll(".state")
  // .data(states)
  // .enter().append(path)
  // .attr("class", "state")
  // .attr("d", path);

  const weatherById = {};
  const allDates = {};
  weather.forEach(d => {weatherById[d.id] = +d[globalStart.toISOString().slice(0,10)]});

  topojson.feature(usa, usa.objects.counties).features.forEach(d => { d[globalStart.toISOString().slice(0,10)] = weatherById[d.id] });

  var weatherByIdList = d3.entries(weatherById);
  svg.append("g")
  .attr("class", "counties")
  .selectAll("path")
  .data(topojson.feature(usa, usa.objects.counties).features)
  .enter().append("path")
  .attr("d", path)
  .attr("fill", function(d) { return color(d[globalStart.toISOString().slice(0,10)] = weatherById[d.id]);
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

      // states
      svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(topojson.feature(usa, usa.objects.states).features)
        .enter().append("path")
        .attr("fill", "none")
        .style("stroke", "white")
        .style("stroke-width", "1")
        .attr("d", path);

    //All the work on the slider:

    var startDate = new Date("2019-01-23"),
    endDate = new Date("2020-04-30");

    var margin2 = {top:0, right:50, bottom:50, left:50},
    width2 = width - margin2.left - margin2.right,
    height2 = height - margin2.top - margin2.bottom + 10;

    var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([margin2.right, width2])
    .clamp(true);

    var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + 615 + ")");

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

      weather.forEach(d => {weatherById[d.id] = +d[globalStart.toISOString().slice(0,10)];});

      svg.selectAll("path")
      .style('fill', d => color(weatherById[d.id]))
    }


  }

}
