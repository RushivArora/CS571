function usvaccine(){

  var svg = d3.selectAll('#usvacNode').attr('width',document.getElementById('usvacDiv').offsetWidth);
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
width = document.getElementById('usvacDiv').offsetWidth - margin.left - margin.right,
height = document.getElementById('usvacDiv').offsetHeight + margin.top - margin.bottom;

var color = d3.scaleThreshold()
    //.domain(d3.range(0, 1, 1/9))
    .domain([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8])
    .range(d3.schemeBlues[9]);

    var path = d3.geoPath();
    //.projection(projection);

    var x = d3.scaleLinear()
    .domain([0, 1])
    .rangeRound([550, 900]);

    var formatDateIntoYear = d3.timeFormat("%Y");
    var formatDate = d3.timeFormat("%b %Y");
    var formatTime = d3.timeFormat("%B %d, %Y");

    var parseTime = d3.timeParse("%Y-%m-%d");
    var globalStart = new Date("2021-01-16");

    var g = svg.append("g")
    .attr("class", "key")
    .attr("transform", "translate(0,40)");

    g.selectAll("rect")
    .data(color.range().map(function(d) {
      d = color.invertExtent(d);
      if (d[0] == null) d[0] = x.domain()[0];
      if (d[1] == null) d[1] = x.domain()[1];
      return d;
    }))
    .enter().append("rect")
    .attr("height", 8)
    .attr("x", function(d) { return x(d[0]); })
    .attr("width", function(d) { return x(d[1]) - x(d[0]); })
    .attr("fill", function(d) { return color(d[0]); });

    g.append("text")
    .attr("class", "caption")
    .attr("x", x.range()[0])
    .attr("y", -6)
    .attr("fill", "#000")
    .attr("text-anchor", "start")
    .attr("font-weight", "bold")
    .text("Percent Adults Vaccinated");

    g.call(d3.axisBottom(x)
      .tickSize(13)
      .tickFormat(function(x, i) { return i ? Math.floor(x) : x ; })
      .tickValues(color.domain()))
    .select(".domain")
    .remove();

    d3.queue()
    .defer(d3.json, "https://d3js.org/us-10m.v1.json")
    .defer(d3.csv, "../vaccines.csv") //, function(d) { cases.set(d.id, +d.rate); })
    .await(ready);

    function ready(error, usa, vaccines) {
      if (error) throw error;
      const vaccinesById = {};
      const allDates = {};

      vaccines.forEach(d => {
    //console.log(formatTime(parseTime(d.date)))
    if(formatTime(parseTime(d.date)) == formatTime(globalStart)){
      vaccinesById[d.id] = +d.rate;}
    });

      topojson.feature(usa, usa.objects.counties).features.forEach(d => { d.rate = vaccinesById[d.id] });

      var vaccinesByIdList = d3.entries(vaccinesById);

      svg.append("g")
      .attr("class", "counties")
      .selectAll("path")
      .data(topojson.feature(usa, usa.objects.counties).features)
      .enter().append("path")
      .attr("d", path)
      .style("fill", function(d) { 
        return color(d.rate = vaccinesById[d.id]);
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
        .datum(topojson.mesh(usa, usa.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);

    //All the work on the slider:

    var startDate = new Date("2021-01-16"),
    endDate = new Date("2021-03-31");

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

      vaccines.forEach(d => {
        if(formatTime(parseTime(d.date)) == formatTime(globalStart)){
          vaccinesById[d.id] = +d.rate;}
        });

      svg.selectAll("path")
      .style('fill', d => color(vaccinesById[d.id]))
    }


  }

}