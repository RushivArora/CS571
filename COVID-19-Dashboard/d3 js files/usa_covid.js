function usaMap(){

  var svg = d3.selectAll('#node').attr('width',document.getElementById('nodeDiv').offsetWidth);
        //Using this selection to update the SVG everytime the function is called
        svg.selectAll("*").remove();

        var width = +svg.attr("width");
        var height = +svg.attr("height");

        removeElementsByClass('d3-tip n');


        var format = d3.format(",");

        // Set tooltips
        var tip = d3.tip()
                      .attr('class', 'd3-tip')
                      .offset([-10, 0])
                      .html(d => `<strong>County: </strong><span class='details'>${d.name}<br></span><strong>Cases/100,000: </strong><span class='details'>${d.rate}</span>`);

        //var svg = d3.select("svg"),
        //    width = +svg.attr("width"),
        //    height = +svg.attr("height");

        const margin = {top: 0, right: 0, bottom: 0, left: 0};
        //const width  = 960 - margin.left - margin.right;
        //const height = 600 - margin.top - margin.bottom;

        //var cases = d3.map();

        //var projection = d3.geoAlbers();

        var path = d3.geoPath();
            //.projection(projection);

        svg.call(tip);

        var x = d3.scaleLinear()
            .domain([0, 18000])
            .rangeRound([550, 900]);

        var color = d3.scaleThreshold()
            .domain(d3.range(0, 18000, 18000/9))
            .range(d3.schemeReds[9]);

        var formatDateIntoYear = d3.timeFormat("%Y");
        var formatDate = d3.timeFormat("%b %Y");
        var formatTime = d3.timeFormat("%B %d, %Y");

        var parseTime = d3.timeParse("%m-%d-%Y");
        var globalStart = new Date("2021-04-19");
        var check = 0;

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
            .text("Cases per 100,000");

        g.call(d3.axisBottom(x)
            .tickSize(13)
            .tickFormat(function(x, i) { return i ? Math.floor(x) : x ; })
            .tickValues(color.domain()))
          .select(".domain")
            .remove();

        d3.queue()
            .defer(d3.json, "https://d3js.org/us-10m.v1.json")
            .defer(d3.csv, "../cases.csv") //, function(d) { cases.set(d.id, +d.rate); })
            .await(ready);

        function ready(error, usa, cases) {
          if (error) throw error;

          const casesById = {};
          const nameById = {};
          const allDates = {};



          cases.forEach(d => {
            if(formatTime(parseTime(d.date)) == formatTime(globalStart)){
              casesById[d.id] = d.rate;
              nameById[d.id] = d.name;}
          });


          topojson.feature(usa, usa.objects.counties).features.forEach(d => { d.rate = casesById[d.id] });
          //topojson.feature(usa, usa.objects.counties).features.forEach(d => { d.name = nameById[d.id] });

          var casesByIdList = d3.entries(casesById);



          // counties
          svg.append("g")
            .attr("class", "counties")
            .selectAll("path")
            .data(topojson.feature(usa, usa.objects.counties).features)
            .enter().append("path")
            .attr("fill", function(d) {
                return color(d.rate = casesById[d.id]);
            })
            // tooltips
            .on('mouseover',function(d){
              d.name = nameById[d.id]
              tip.show(d);
              d3.select(this)
                .style('stroke', 'white')
                .style('stroke-width', 3);
            })
            .on('mouseout', function(d){
              tip.hide(d);
              d3.select(this)
                .style('stroke', 'none');
                //.style('stroke-width',0.2);
            })
            .attr("d", path);


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



          // All the work on the slider:
          var startDate = new Date("2020-05-30"),
              endDate = new Date("2021-04-19");

          var margin2 = {top:0, right:50, bottom:50, left:50},
            width2 = width - margin2.left - margin2.right,
            height2 = height - margin2.top - margin2.bottom;

          var x = d3.scaleTime()
                    .domain([startDate, endDate])
                    .range([margin2.right, width2])
                    .clamp(true);

          var slider = svg.append("g")
                          .attr("class", "slider")
                          .attr("transform", "translate(" + margin.left + "," + 630 + ")");

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

              cases.forEach(d => {
                if(formatTime(parseTime(d.date)) == formatTime(globalStart)){
                    casesById[d.id] = d.rate;}
              });

              svg.call(tip);

              svg.selectAll("path")
                 //.style('fill', d => color(casesById[d.id]));
                 .style('fill', function(d) {
                   d.rate = casesById[d.id]
                   return color(casesById[d.id]);
                 })
          }

        }

}