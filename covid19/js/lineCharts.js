

export function drawChart(site) {

    const svgDims = { width: 1000, height: 800 }

    d3.select("#line-chart")
        .remove();

    const svg = d3.select("#chart-div")
        .append("svg")
        .attr("id", "line-chart")
        .attr("width", svgDims.width)
        .attr("height", svgDims.height)

    const margin = {top: 20, right: 30, bottom: 60, left: 60};

    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;
    const g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    

    const firstDay = d3.min(site.days, x => x.date);
    const lastDay = d3.max(site.days, x => x.date);
    const dayScale = d3.scaleTime()
        .domain([firstDay, lastDay])
        .range([0, width]);

    const maxConfirmed = d3.max(site.days, x => x.stats.confirmed);
    const yScale = d3.scaleLinear()
        .domain([maxConfirmed, 0])
        .range([0, height]);


    // Draw y axis    
    var yGroup = g.append("g")
        .call(d3.axisLeft(yScale));

    // Draw x axis - Jan 10    
    const xGroup = g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(dayScale)
           .tickFormat(function(d) {
                let func = d3.timeFormat("%b");
                return func(d) + " " + d.getDate();   
           }));

    g.selectAll("rect").data(site.days).enter().append("rect")
        .attr("x", d => dayScale(d.date))
        .attr("width", 10)
        .attr("y", d => yScale(d.stats.confirmed))
        .attr("height", d => (height - yScale(d.stats.confirmed)))
        .style("fill", "lightblue"); 
}