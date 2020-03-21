import { text, centeredText, rightText } from "./shared.js";

import { countryBars, stateBars } from "./barCharts.js";
import { drawChart } from "./lineCharts.js";


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

    countryBars(countries);
    stateBars(countries[0]);
    drawChart(countries[0]);
}    


export function selectCountry(country) {
    stateBars(country);
    drawChart(country);
}

export function selectState(state) {
    drawChart(state);
}

