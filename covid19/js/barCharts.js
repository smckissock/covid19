import { text, centeredText, rightText } from "./shared.js";
import { selectSite } from "./main.js";

const formatInt = d3.format(',');

export function siteBars(sites, type) {
    const barHeight = 24;
    
    if (type != "country") { 
        sites = sites.states;
        d3.select("#state-bars").remove();
    }

    sites.sort((a, b) => b.stats.confirmed - a.stats.confirmed)
    const maxConfirmed = d3.max(sites, x => x.stats.confirmed);

    const svg = d3.select("#" + type + "-div")
        .append("svg")
        .attr("width", 300)
        .attr("height", barHeight * sites.length)

    if (type == "state") 
        svg.attr("id", "state-bars");
    
    const xScale = d3.scaleLinear()
        .domain([0, maxConfirmed])
        .range([0, 300]);


    svg.selectAll("rect").data(sites).enter().append("rect")
        .attr("x", 0)
        .attr("width", 300)
        .attr("y", (d, i) => (i * barHeight))
        .attr("height", barHeight - 3)
        .classed("site-bar", true)
        .on("click", d => selectSite(d, type));  
    
    svg.selectAll("line").data(sites).enter().append("line")
        .attr("x1", 0)
        .attr("x2", d => xScale(d.stats.confirmed))
        .attr("y1", (d, i) => (i * barHeight) + (barHeight / 2) - 1)
        .attr("y2", (d, i) => (i * barHeight) + (barHeight / 2) - 1)
        .attr('stroke-width', barHeight - 3)
        .classed("site-line", true)
    
    svg.selectAll("text").data(sites).enter().append("text")
        .text(d => d.name) // + " " +  d.stats.confirmed)
        .attr("x", 5)
        .attr("y", (d, i) => (i * barHeight) + 16)
        .classed("bar-text", true)
        .each(function (d, i) {
            rightText(formatInt(d.stats.confirmed), svg, "stat-text", 140, 20, (i * barHeight) + 16)
            rightText(formatInt(d.stats.active), svg, "stat-text", 200, 20, (i * barHeight) + 16)
            rightText(formatInt(d.stats.deaths), svg, "stat-text", 250, 20, (i * barHeight) + 16)
        })
            //.on("mouseover", d => d3.select(this).attr("font-weight", "bold"))
        //.on("mouseout", d => d3.select(this).attr("font-weight", "normal"));
}