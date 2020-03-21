import { text, centeredText, rightText } from "./shared.js";
import { selectSite } from "./main.js";


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
        .attr("width", 240)
        .attr("height", barHeight * sites.length)

    if (type == "state") {
        svg.attr("id", "state-bars");
    }

    const xScale = d3.scaleLinear()
        .domain([0, maxConfirmed])
        .range([0, 240]);
    
    svg.selectAll("rect").data(sites).enter().append("rect")
        .attr("x", 0)
        .attr("width", d => xScale(d.stats.confirmed))
        .attr("y", (d, i) => (i * barHeight))
        .attr("height", barHeight - 3)
        .style("fill", "lightblue")
        .attr("cursor", "pointer")
        .on("click", d => selectSite(d, type));    

    svg.selectAll("text").data(sites).enter().append("text")
        .text(d => d.name + " " +  d.stats.confirmed)
        .attr("x", 4)
        .attr("y", (d, i) => (i * barHeight) + 17)
        .classed("bar-text", true)
        .on("mouseover", d => d3.select(this).attr("font-weight", "bold"))
        .on("mouseout", d => d3.select(this).attr("font-weight", "normal"));
}