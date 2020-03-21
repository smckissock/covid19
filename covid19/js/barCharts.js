import { text, centeredText, rightText } from "./shared.js";

import { selectCountry, selectState } from "./main.js";


export function countryBars(countries) {
    const barHeight = 24;    

    countries.sort((a, b) => b.stats.confirmed - a.stats.confirmed)
    const maxConfirmed = d3.max(countries, x => x.stats.confirmed);

    const svg = d3.select("#country-div")
        .append("svg")
        .attr("width", 240)
        .attr("height", barHeight * countries.length)

    const xScale = d3.scaleLinear()
        .domain([0, maxConfirmed])
        .range([0, 240]);
    
    svg.selectAll("rect").data(countries).enter().append("rect")
        .attr("x", 0)
        .attr("width", d => xScale(d.stats.confirmed))
        .attr("y", (d, i) => (i * barHeight))
        .attr("height", barHeight - 3)
        .style("fill", "lightblue")
        .attr("cursor", "pointer")
        .on("click", d => selectCountry(d));    

    svg.selectAll("text").data(countries).enter().append("text")
        .text(d => d.name + " " +  d.stats.confirmed)
        .attr("x", 4)
        .attr("y", (d, i) => (i * barHeight) + 17)
        .classed("bar-text", true)
        .on("mouseover", d => d3.select(this).attr("font-weight", "bold"))
        .on("mouseout", d => d3.select(this).attr("font-weight", "normal"));
}


export function stateBars(country) {
    const barHeight = 24;    
    
    const states = country.states;
    states.sort((a, b) => b.stats.confirmed - a.stats.confirmed)
    const maxConfirmed = d3.max(states, x => x.stats.confirmed);

    d3.select("#state-bars")
        .remove();
    
    const svg = d3.select("#state-div")
        .append("svg")
        .attr("id", "state-bars")
        .attr("width", 240)
        .attr("height", barHeight * states.length)

    if (country.states.length == 0) {
        text("Province-level data not available for " + country.name, svg, "bar-text", 10, 20)
        return;     
    }

    const xScale = d3.scaleLinear()
        .domain([0, maxConfirmed])
        .range([0, 240]);
    
    svg.selectAll("rect").data(states).enter().append("rect")
        .attr("x", 0)
        .attr("width", d => xScale(d.stats.confirmed))
        .attr("y", (d, i) => (i * barHeight))
        .attr("height", barHeight - 3)
        .style("fill", "lightblue")
        .attr("cursor", "pointer")
        .on("click", d => selectState(d));    

    svg.selectAll("text").data(states).enter().append("text")
        .text(d => d.name + " " +  d.stats.confirmed)
        .attr("x", 4)
        .attr("y", (d, i) => (i * barHeight) + 17)
        .classed("bar-text", true)
}
