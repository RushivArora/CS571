function sortByProperty(property){  
    return function(a,b){  
       if(parseInt(a[property]) < parseInt(b[property]))  
          return 1;  
       else if(parseInt(a[property]) > parseInt(b[property]))  
          return -1;  
   
       return 0;  
    }  
 }

 function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


function top6_effected(dateSent){

    var svgRace = d3.selectAll('#Top6').attr('width',document.getElementById('top6Div').offsetWidth);
        //Using this selection to update the SVG everytime the function is called
    svgRace.selectAll("*").remove();

    d3.csv("../owid-covid-data.csv", function(data,covid_map) {

        console.log(data)
        var formatTime = d3.timeFormat("%B %d, %Y");
        var parseTime = d3.timeParse("%Y-%m-%d");

        const populationById = {};
        covid_map.forEach(d => { 
        if(formatTime(parseTime(data.date)) == formatTime(dateSent)){
          populationById[d.iso_code] = +d.total_cases;}
        });

        var sorted_data = populationById.sort(sortByProperty('total_cases'));
        var sorted_3_first = [sorted_data[0], sorted_data[1], sorted_data[2]];
        var sorted_3_second = [sorted_data[3], sorted_data[4], sorted_data[5]];

        var svgRace = d3.selectAll('#Top6')
                        .attr('height', document.getElementById('top6Div').offsetHeight)

        width = document.getElementById('top6Div').offsetWidth
        height = document.getElementById('top6Div').offsetHeight*0.95

        console.log(sorted_3_first);

        svgRace.append('g')
            .data(['Highest 6 infected (Confirmed)'])
            .append('text')
            .text(['Highest 6 infected (Confirmed)'])
            .style('fill', 'white')
            .style('font-size', (0.052*width)+'px')
            .attr('x', width/7)
            .attr('y', 0.08*height);

        svgRace.selectAll('body')
            .data(sorted_3_first)
            .enter()
            .append('text')
            .text(function(d,i){
                // if(d['location'] =='United Kingdom'){
                //     return 'UK'
                // }
                // if (d['location'] == 'South Africa'){
                //     return 'South A.'
                // }
                return d['iso_code'];
            })
            .style('fill', 'white')
            .attr('y',0.28*height)
            .attr('text-anchor','left')
            .style('font-size', (0.052*width)+'px')
            .attr('x', function(d,i){
                return (i*(0.25*width)) + width/7;
            });

        svgRace.selectAll('body')
            .data(sorted_3_first)
            .enter()
            .append('text')
            .text(function(d,i){
                return numberWithCommas(d['total_cases']);
            })
            .style('fill', 'white')
            .attr('y',0.38*height)
            .attr('text-anchor','left')
            .style('font-size', (0.04*width)+'px')
            .attr('x', function(d,i){
                return i*(0.25*width) + width/7;
            });

        svgRace.selectAll('body')
            .data(sorted_3_second)
            .enter()
            .append('text')
            .text(function(d,i){
                // if(d['location'] =='United Kingdom'){
                //     return 'UK'
                // }
                // if (d['location'] == 'South Africa'){
                //     return 'South A.'
                // }
                return d['iso_code'];
            })
            .style('fill', 'white')
            .attr('y',0.56*height)
            .attr('text-anchor','left')
            .style('font-size', (0.052*width)+'px')
            .attr('x', function(d,i){
                return i*(0.25*width) + width/7;
            });

        svgRace.selectAll('body')
            .data(sorted_3_second)
            .enter()
            .append('text')
            .text(function(d,i){
                return numberWithCommas(d['total_cases']);
            })
            .style('fill', 'white')
            .attr('y',0.67*height)
            .attr('text-anchor','left')
            .style('font-size', (0.04*width)+'px')
            .attr('x', function(d,i){
                return i*(0.25*width) + width/7;
            });
    
    });
}
