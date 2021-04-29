function weatherWorld1(){

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
  return "<strong>Country: </strong><span class='details'>" + d.properties.name + "<br></span>" + "<strong>CRW: </strong><span class='details'>" + d[globalStart.toISOString().slice(0,10)] +"<br></span>";
})

var margin = {top: 80, right: 0, bottom: 0, left: 10},
width = document.getElementById('nodeDiv').offsetWidth - margin.left - margin.right,
height = document.getElementById('nodeDiv').offsetHeight + margin.top - margin.bottom;

var x = d3.scaleLinear()
            .domain([0, 1.5])
            .rangeRound([550, 900]);

        var color = d3.scaleThreshold()
            .domain(d3.range(0, 1.5, 1.5/7))
            .range([d3.rgb("00441b"),d3.rgb("#006d2c"),d3.rgb("#41ab5d"),d3.rgb("#a1d99b"),d3.rgb("#fb6a4a"),d3.rgb("#cb181d"),d3.rgb("#67000d")]);

        var formatDateIntoYear = d3.timeFormat("%Y");
        var formatDate = d3.timeFormat("%b %Y");
        var formatTime = d3.timeFormat("%B %d, %Y");

        var parseTime = d3.timeParse("%m-%d-%Y");
        var globalStart = new Date("2019-01-23");
        var check = 0;

        var g = svg.append("g")
            .attr("class", "key")
            .attr("transform", "translate(300,100)");

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
            .text("CRW");

        g.call(d3.axisBottom(x)
            .tickSize(7)
            .tickFormat(function(x, i) { return i ? x.toFixed(3) : x ; })
            .tickValues(color.domain()))
          .select(".domain")
            .remove();

        var formatDateIntoYear = d3.timeFormat("%Y");
        var formatDate = d3.timeFormat("%b %Y");
        var formatTime = d3.timeFormat("%B %d, %Y");
        var path = d3.geoPath();

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

    var check = 0;

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

    var startDate = new Date("2020-04-30"),
    endDate = new Date("2019-01-23");

    var margin2 = {top:0, right:50, bottom:50, left:50},
    width2 = width - margin2.left - margin2.right,
    height2 = height;
    
    var x = d3.scaleTime()
    .domain([startDate, endDate])
    .range([margin2.right, width2])
    .clamp(true);

    var slider = svg.append("g")
    .attr("class", "slider")
    .attr("transform", "translate(" + margin.left + "," + 750 + ")");

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

      covid_map.forEach(d => {weatherById[d.id] = +d[globalStart.toISOString().slice(0,10)];});
      svg.call(tip);

      data.features.forEach(d => { d[globalStart.toISOString().slice(0,10)] = weatherById[d.properties.name] });

      svg.selectAll("path")
         .style('fill', function(d){
          return color(weatherById[d.properties.name])

         })
    }


  }

}