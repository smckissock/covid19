using System.Collections.Generic;
using System.Linq;
using System.IO;

using Newtonsoft.Json;

namespace covid19 {

    public class stats {
        public int confirmed;
        public int deaths;
        public int recovered;

        public int active;

        public stats(int confirmed, int deaths, int recovered) {
            this.confirmed = confirmed;
            this.deaths = deaths;
            this.recovered = recovered;
            this.active = confirmed - deaths - recovered;
        }
    }

    public class JsonDay {
        public string date;
        public stats stats;

        public JsonDay(string date, stats stats) {
            this.date = date;
            this.stats = stats;
        }
    }


    // Country or State (region, city?)
    public class JsonSite {
        public string name;
        public List<JsonDay> days;
        public stats stats;
        
        public JsonSite(string name, List<JsonDay> days) {
            this.name = name;
            this.days = days;
            
            if (days.Count > 0)
                this.stats = days.Last().stats;
        }

        public void AddDay(JsonDay day) {
            days.Add(day);
            this.stats = days.Last().stats;
        }
    }

    public class JsonCountry : JsonSite {
        public List<JsonSite> states;
        
        public JsonCountry(string name, List<JsonDay> days, List<JsonSite> states) : base (name, days) {
            this.states = states;
        }
    } 

    public class Site {
        public string currentDate;
        public List<JsonCountry> countries;
    }

    public class covid19 {
        public List<JsonCountry> countries;

        public covid19(List<JsonCountry> countries) {
            this.countries = countries;
        }
    }
        

    public class MakeJson {

        public static void Run() {

            void CountriesWithoutStates(List<JsonCountry> cntries) {
                string countryName = "";
                List<JsonDay> days = new List<JsonDay>();
                var reader = Db.Query("SELECT Country, Date, Confirmed, Deaths, Recovered FROM MetricView WHERE State = 'N/A' ORDER BY Country, Date");
                while (reader.Read()) {
                    string newCountryName = reader[0].ToString();

                    if (newCountryName != countryName) {
                        // Don't save if first time
                        if (countryName != "")
                            cntries.Add(new JsonCountry(countryName, days, new List<JsonSite>()));

                        countryName = newCountryName;
                        days = new List<JsonDay>();
                    }
                    days.Add(new JsonDay(reader[1].ToString(), new stats((int)reader[2], (int)reader[3], (int)reader[4])));
                }
                cntries.Add(new JsonCountry(countryName, days, new List<JsonSite>()));
            }


            void CountriesWithStates(List<JsonCountry> cntries) {

                var countryReader = Db.Query("SELECT DISTINCT Country FROM MetricView WHERE State <> 'N/A' ORDER BY Country");
                while (countryReader.Read()) {
                    string countryName = (string)countryReader[0];
                    JsonCountry country = new JsonCountry(countryName, new List<JsonDay>(), new List<JsonSite>());
                    cntries.Add(country);

                    // Add states to country
                    string stateName = "";
                    JsonSite state = null;
                    var stateReader = Db.Query("SELECT State, Date, Confirmed, Deaths, Recovered FROM MetricView WHERE Country = '" + countryName + "' ORDER BY State, Date");
                    while (stateReader.Read()) {
                        string newStateName = stateReader[0].ToString();

                        if (newStateName != stateName) {
                            state = new JsonSite(newStateName, new List<JsonDay>());
                            country.states.Add(state);
                            stateName = newStateName;
                        }
                        state.AddDay(
                            new JsonDay(
                                stateReader[1].ToString(),
                                new stats((int)stateReader[2], (int)stateReader[3], (int)stateReader[4])));
                    }
                }

                // For countries with states, add days with sum of their state's stats   
                var dateReader = Db.Query(
                    "SELECT DISTINCT DATE FROM Metric " +
                    "WHERE Date >= (SELECT MIN(Date) FROM Metric) " +
                    "AND Date <= (SELECT MAX(Date) FROM Metric) " +
                    "ORDER By Date");

                var dates = new List<string>();
                while (dateReader.Read())
                    dates.Add(dateReader[0].ToString());

                foreach (JsonCountry cntry in cntries) {
                    if (cntry.states.Count == 0)
                        continue;

                    // Add zeros for each day to the country 
                    foreach (string dateString in dates)
                        cntry.days.Add(new JsonDay(dateString, new stats(0, 0, 0)));

                    // Go through each state and all its values to they country for each day 
                    foreach (JsonSite state in cntry.states) {
                        foreach (JsonDay day in state.days) {
                            var countryDay = cntry.days.Find(x => x.date == day.date);

                            countryDay.stats.confirmed += day.stats.confirmed;
                            countryDay.stats.deaths += day.stats.deaths;
                            countryDay.stats.recovered += day.stats.recovered;
                        }
                    }
                    cntry.stats = cntry.days.Last().stats;
                }
            }

            var countries = new List<JsonCountry>();
            CountriesWithoutStates(countries);
            CountriesWithStates(countries);
            SaveJson(countries);
        }


        public static void SaveJson (List<JsonCountry> countries) {
            string fileName = @"c:\project\covid19\covid19\data\data.json";

            var covid19 = new covid19(countries); 
            string json = JsonConvert.SerializeObject(covid19);

            var niceJson = Newtonsoft.Json.Linq.JToken.Parse(json).ToString();
            File.WriteAllText(fileName, niceJson);
        }
    }
}
