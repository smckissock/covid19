import { text, centeredText, rightText } from "./shared.js";
import { siteBars } from "./barCharts.js";
import { drawChart } from "./lineCharts.js";
 
const lightBlue = '#9ecae1'
let countries;
export let lastDay = "";

d3.json('covid19/data/data.json')
    .then(data => init(data));


function init(data) {
    // Replace date strings with date objects
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
    countries = data.countries;

    countries.find(d => d.name == "US").name = "United States";
    lastDay = d3.max(countries[0].days, x => x.date);

    siteBars(countries, "country");
    selectSite(countries[0], "country"); 
}    

export function selectSite(site, type) {
    if (type == "country")
        siteBars(site, "state");

    drawChart(site);
    drawTitles(site, type);
}


// Return "country" or "country / state"
export function siteName(site) {
    if (site.states)
        return site.name;
    
    let name;     
    countries.forEach(function(country) {
        country.states.forEach(function (state) {
            if (state.name.valueOf() == site.name.valueOf())
                name = country.name + " / " + state.name;
        });
    });
    return name;
} 


function drawTitles(site, type) {
    d3.select("#site-title").remove();

    const svg = d3.select("#site-title-div")
        .append("svg")
        .attr("width", 1100)
        .attr("height", 60)
        .attr("id", "site-title");

    text(siteName(site), svg, "site-title-text", 30, 52);    
    text(lastDay, svg, "date-title-text", 30, 72);    
}

