import { text, centeredText, rightText } from "./shared.js";

let facts;
let countryDim;
let cityDim;
let dateDim;

let currentDay;
 
let countries;
 
const lightBlue = '#9ecae1'

d3.json('covid19/data/data.json')
    .then(data => init(data));


function init(data) {
    // Replace data strings with date objects
    data.countries.forEach(function(country) {
        country.days.forEach(function(day) {
            day.date = new Date(day.date);
        });

        // Do the same for states, if any 
        country.states.forEach(function(state) {
            state.days.forEach(function(day) {
                day.date = new Date(day.date);
            });
        });
    });

    countryBars(data);
}    


function countryBars(data) {
    const barHeight = 24;    
    const countries = data.countries;
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

    stateBars(countries[0]);
    drawChart(countries[0]);
}


function selectCountry(country) {
    stateBars(country);
    drawChart(country);
}


function stateBars(country) {
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
        .on("click", d => update(d));    

    svg.selectAll("text").data(states).enter().append("text")
        .text(d => d.name + " " +  d.stats.confirmed)
        .attr("x", 4)
        .attr("y", (d, i) => (i * barHeight) + 17)
        .classed("bar-text", true)
        .on("mouseover", d => d3.select(this).attr("font-weight", "bold"))
        .on("mouseout", d => d3.select(this).attr("font-weight", "normal"));
}


function drawChart(site) {

    const width = 1000;
    const height = 800;

    const firstDay = d3.min(site.days, x => x.date);
    const lastDay = d3.max(site.days, x => x.date);
    const dayScale = d3.scaleTime()
        .domain([firstDay, lastDay])
        .range([0, width]);

    const maxConfirmed = d3.max(site.days, x => x.stats.confirmed);
    const yScale = d3.scaleLinear()
        .domain([maxConfirmed, 0])
        .range([0, height]);

    d3.select("#line-chart")
        .remove();
    
    const svg = d3.select("#chart-div")
        .append("svg")
        .attr("id", "line-chart")
        .attr("width", width)
        .attr("height", height)

    svg.append("g")
        .attr("transform", "translate(0," + (height-30) + ")")
        .call(d3.axisBottom(dayScale)
            .tickFormat(d3.timeFormat("%Y-%m-%d")));

    svg.append("g")
        .attr("transform", "translate(40,20)")
        .call(d3.axisLeft(yScale));

    svg.selectAll("rect").data(site.days).enter().append("rect")
        .attr("x", d => dayScale(d.date))
        .attr("width", 10)
        .attr("y", d => yScale(d.stats.confirmed))
        .attr("height", d => (780 - yScale(d.stats.confirmed)))
        .style("fill", "lightblue");
}




