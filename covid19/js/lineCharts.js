
import { text, centeredText, rightText } from "./shared.js";


export function drawChart(site) {

    function drawLabels() {
        text("Johns Hopkins", svg, "source-text", margin.left + 30, 30)
    }

    const svgDims = { width: 1000, height: 940 }

    d3.select("#line-chart")
        .remove();

    const svg = d3.select("#chart-div")
        .append("svg")
        .attr("id", "line-chart")
        .attr("width", svgDims.width)
        .attr("height", svgDims.height)

    const margin = {top: 20, right: 30, bottom: 60, left: 60};

    drawLabels();

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

    // Draw x axis - e.g. "Jan 10"    
    const xGroup = g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(dayScale)
           .tickFormat(function(d) {
                let func = d3.timeFormat("%b");
                return func(d) + " " + d.getDate();   
           }));

    // Bars for cumulative confirmed cases        
    g.selectAll("rect").data(site.days).enter().append("rect")
        .attr("x", d => dayScale(d.date))
        .attr("width", 10)
        .attr("y", d => yScale(d.stats.confirmed))
        .attr("height", d => (height - yScale(d.stats.confirmed)))
        .style("fill", "lightblue"); 

    // Lines for cumulative deaths        
    g.selectAll("line").data(site.days).enter().append("line")
        .attr("x1", d => dayScale(d.date))
        .attr("x2", d => dayScale(d.date))
        .attr("y1", height)
        .attr("y2", d => yScale(d.stats.deaths))
        .attr('stroke-width', 10)
        .classed("deaths-line", true)

    // Circles for daily active cases        
    g.selectAll("circle").data(site.days).enter().append("circle")
        .attr("cx", d => dayScale(d.date))
        //.attr("cy", d => height - yScale(d.stats.active))
        .attr("cy", d => yScale(d.stats.active))
        .attr("r", 5)
        .style("fill", "black");
}