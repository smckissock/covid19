import { text, centeredText, rightText } from "./shared.js";
import { selectSite } from "./main.js";

const formatInt = d3.format(',');

export function siteBars(sites, type) {

    const barWidth = 300; 
    const barHeight = 32;
    
    if (type != "country") { 
        sites = sites.states;
        d3.select("#state-bars").remove();
    }

    sites.sort((a, b) => b.stats.confirmed - a.stats.confirmed)
    const maxConfirmed = d3.max(sites, x => x.stats.confirmed);

    const svg = d3.select("#" + type + "-div")
        .append("svg")
        .attr("width", barWidth)
        .attr("height", barHeight * sites.length)

    if (type == "state") 
        svg.attr("id", "state-bars");
    
    const xScale = d3.scaleLinear()
        .domain([0, maxConfirmed])
        .range([0, barWidth - 26]);

    // Rects underneath the country      
    svg.selectAll("rect").data(sites).enter().append("rect")
        .attr("x", 5)
        .attr("width", barWidth - 26)
        .attr("y", (d, i) => (i * barHeight))
        .attr("height", barHeight - 5)
        .classed("site-bar", true)
        .on("click", d => selectSite(d, type)) 
        .on("mouseover", function() {
            d3.select(this).classed('site-bar-highlight', true)})   
        .on("mouseout", function() {
            d3.select(this).classed('site-bar-highlight', false)})
    
    // A line representing # of confirmed        
    svg.selectAll("line").data(sites).enter().append("line")
        .attr("x1", 5)
        .attr("x2", d => xScale(d.stats.confirmed))
        .attr("y1", (d, i) => (i * barHeight) + (barHeight / 2) - 2)
        .attr("y2", (d, i) => (i * barHeight) + (barHeight / 2) - 2)
        .attr('stroke-width', barHeight - 10)
        .classed("site-line", true)
    
    // Country/state names plus stats    
    const textY = 19;
    svg.selectAll("text").data(sites).enter().append("text")
        .text(d => d.name) 
        .attr("x", 12)
        .attr("y", (d, i) => (i * barHeight) + textY)
        .classed("bar-text", true)
        .each(function (d, i) {
            rightText(formatInt(d.stats.confirmed), svg, "stat-text", 140, 20, (i * barHeight) + textY)
            rightText(formatInt(d.stats.active), svg, "stat-text", 200, 20, (i * barHeight) + textY)
            rightText(formatInt(d.stats.deaths), svg, "stat-text", 250, 20, (i * barHeight) + textY)
        })
            //.on("mouseover", d => d3.select(this).attr("font-weight", "bold"))
        //.on("mouseout", d => d3.select(this).attr("font-weight", "normal"));
}