using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualBasic.FileIO;
using System.IO;

namespace covid19 {

    public class SiteDay {
        public string Date;
        public string City;
        public string State;
        public string Country;
        public string Confirmed;
        public string Deaths;
        public string Recovered;

        public SiteDay(string date, string city, string state, string country, string confirmed, string deaths, string recovered) {
            Date = date; 
            City = city;
            State = state;
            Country = country;
            Confirmed = confirmed;
            Deaths = deaths;
            Recovered = recovered;
        }
    }

    class Location {
        public string Id;

        public string Name;
        public string Lat;
        public string Long;

        public List<SiteDay> SiteDays;

        protected Location(string name, string lat, string lon) {
            Name = name;
            Lat = lat;
            Long = lon;

            SiteDays = new List<SiteDay>();
        }
    }

    class Country : Location {
        public List<State> States;
        public Country(string name, string lat, string lon) : base(name, lat, lon) {
            States = new List<State>();
        }

        public string Description() {
            int cityCount = 0;
            foreach (State s in States)
                cityCount += s.Cities.Count;

            return Name + "  States: " + States.Count.ToString() + "  Cities: " + cityCount.ToString();
        }
    }

    class State : Location {
        public List<City> Cities;
        public State(string name, string lat, string lon) : base(name, lat, lon) {
            Cities = new List<City>();
        }
    }

    class City : Location {
        
        public City(string name, string lat, string lon) : base(name, lat, lon) {
            
        }
    }

    class Metric {
        public string Date;
        public string Confirmed;
        public string Deaths;
        public string Recovered;

        public Metric(string date, string confirmed, string deaths, string recovered) {
            Date = date;
            Confirmed = (confirmed == "") ? "0" : confirmed;
            Deaths = (deaths == "") ? "0" : deaths;
            Recovered = (recovered == "") ? "0" : recovered;
        }
    }


    public class Import {
        static List<Country> Countries;
        static bool postMarch21 = false;

        public static void Run() {
            Countries = new List<Country>();
            
            LoadDayFiles();
            //WriteToDb();
        }


        private static void LoadDayFiles() {
            string path = @"C:\project\covid19\Importer\data\COVID-19-master\COVID-19-master\csse_covid_19_data\csse_covid_19_daily_reports";
            string[] files = Directory.GetFiles(path);
            foreach (string file in files)
                if (file.Contains("csv")) 
                    LoadDayFile(file);

            foreach (Country c in Countries)
                Console.WriteLine(c.Description());

            Console.WriteLine("");

            foreach (State s in Countries[4].States)
                Console.WriteLine(s.Name);
        }

        private static void LoadDayFile(string fileName) {
            string date = fileName.Substring(fileName.LastIndexOf(".csv") - 10).Replace(".csv", "");

            if (date == "03-22-2020")
                postMarch21 = true;

            var csv = GetCsvParser(fileName);

            string[] cols = csv.ReadFields();
            var days = new List<string>(cols);
            days.RemoveRange(0, 4);

            while (!csv.EndOfData) {
                string[] fields = csv.ReadFields();

                SiteDay siteDay;
                if (postMarch21)
                    siteDay = new SiteDay(date, fields[1], fields[2], fields[3], fields[7], fields[8], fields[9]);
                else {
                    string cityState = fields[0];

                    // Skip cruise ship
                    if (cityState.Contains("Diamond Princess"))
                        continue;
                    
                    if (!cityState.Contains(","))
                        siteDay = new SiteDay(date, "", fields[0], fields[1], fields[3], fields[4], fields[5]);
                    else {
                        // This is like "Sacremento, California"
                        var cityStateArray = cityState.Split(',');
                        siteDay = new SiteDay(date, cityStateArray[0], StateForCode(cityStateArray[1].Trim()), fields[1], fields[3], fields[4], fields[5]);
                    }
                }
                InsertSiteDay(siteDay);
            }
        }

        private static void InsertSiteDay(SiteDay siteDay) {
            var country = Countries.Find(x => x.Name == siteDay.Country);
            if (country == null) {
                country = new Country(siteDay.Country, "", "");
                Countries.Add(country);
            }
            
            // Country
            if (siteDay.State == "" ) {
                country.SiteDays.Add(siteDay);
                return;
            }

            var state = country.States.Find(x => x.Name == siteDay.State);
            if (state == null) {
                state = new State(siteDay.State, "", "");
                country.States.Add(state);
            }

            //if (state.Name == "Sacramento County, CA")
            //    Console.WriteLine("STOP");

            // State
                if (siteDay.City == "") {
                state.SiteDays.Add(siteDay);
                return;
            }

            var city = state.Cities.Find(x => x.Name == siteDay.City);
            if (city == null) {
                city = new City(siteDay.City, "", "");
                state.Cities.Add(city);
            }

            // City
            city.SiteDays.Add(siteDay);
        }

        private static string StateForCode(string code) {

            if (code == "AR") return "Arkansas";
            if (code == "AZ") return "Arizona";
            if (code == "AK") return "Alaska";
            if (code == "AL") return "Alabama";
            if (code == "NE") return "Nebraska";
            if (code == "MT") return "Montana";
            if (code == "MO") return "Missouri";
            if (code == "MS") return "Mississippi";
            if (code == "MN") return "Minnesota";
            if (code == "MI") return "Michigan";
            if (code == "MA") return "Massachusetts";
            if (code == "MD") return "Maryland";
            if (code == "ME") return "Maine";
            if (code == "LA") return "Louisiana";
            if (code == "KY") return "Kentucky";
            if (code == "KS") return "Kansas";
            if (code == "IA") return "Iowa";
            if (code == "IN") return "Indiana";
            if (code == "IL") return "Illinois";
            if (code == "ID") return "Idaho";
            if (code == "HI") return "Hawaii";
            if (code == "GA") return "Georgia";
            if (code == "FL") return "Florida";
            if (code == "DE") return "Delaware";
            if (code == "CT") return "Connecticut";
            if (code == "CO") return "Colorado";
            if (code == "CA") return "California";
            if (code == "WA") return "Washington";
            if (code == "WY") return "Wyoming";
            if (code == "WI") return "Wisconsin";
            if (code == "WV") return "West Virginia";
            if (code == "VA") return "Virginia";
            if (code == "VT") return "Vermont";
            if (code == "UT") return "Utah";
            if (code == "TX") return "Texas";
            if (code == "TN") return "Tennessee";
            if (code == "SD") return "South Dakota";
            if (code == "SC") return "South Carolina";
            if (code == "RI") return "Rhode Island";
            if (code == "PA") return "Pennsylvania";
            if (code == "OR") return "Oregon";
            if (code == "OK") return "Oklahoma";
            if (code == "OH") return "Ohio";
            if (code == "ND") return "North Dakota";
            if (code == "NC") return "North Carolina";
            if (code == "NY") return "New York";
            if (code == "NM") return "New Mexico";
            if (code == "NJ") return "New Jersey";
            if (code == "NH") return "New Hampshire";
            if (code == "NV") return "Nevada";
          
            return code;
        }
       

        private static void WriteToDb() {
            //foreach (Country c in Countries) {
            //    c.Id = Db.Insert("INSERT INTO Country VALUES ('" + c.Name.Replace("'", "''") + "', '" + c.Lat + "', '" + c.Long + "')");

            //    foreach (State s in c.States) {
            //        s.Id = Db.Insert("INSERT INTO State VALUES (" + c.Id + ",'" + s.Name.Replace("'", "''") + "', '" + s.Lat + "', '" + s.Long + "')");
            //    }
            //}

            //foreach (Metric m in Metrics) {
            //    Db.Insert("INSERT INTO Metric VALUES (" +
            //        m.Country.Id + ", " +
            //        ((m.State != null) ? m.State.Id : "1") + ", " +
            //        ((m.City != null) ? m.City.Id : "1") + ", " +
            //        m.MetricTypeId() + ", '" +
            //        m.Date + "', " +
            //        m.Count + ")");
            //}
        }

        private static TextFieldParser GetCsvParser(string csvFile) {
            TextFieldParser csv = new TextFieldParser(csvFile, Encoding.UTF8);
            csv.CommentTokens = new string[] { "#" };
            csv.SetDelimiters(new string[] { "," });
            csv.HasFieldsEnclosedInQuotes = true;

            return csv;
        }
    }
}
