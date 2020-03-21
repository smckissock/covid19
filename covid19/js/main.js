import { text, centeredText, rightText } from "./shared.js";
import { siteBars } from "./barCharts.js";
import { drawChart } from "./lineCharts.js";

//let currentDay;
//let countries;
 
const lightBlue = '#9ecae1'

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
    const countries = data.countries;

    siteBars(countries, "country");
    //stateBars(countries[0], false);
    drawChart(countries[0]);
}    

export function selectSite(site, type) {
    if (type == "country")
        siteBars(site, "state");

    drawChart(site);
}

