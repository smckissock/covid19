using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualBasic.FileIO;
using System.IO;

namespace covid19 {

    class Location {
        public string Id;

        public string Name;
        public string Lat;
        public string Long;

        protected Location(string name, string lat, string lon) {
            Name = name;
            Lat = lat;
            Long = lon;
        }
    }

    class Country : Location {
        public List<State> States;
        public Country(string name, string lat, string lon) : base(name, lat, lon) {
            States = new List<State>();
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
        public Country Country;
        public State State;
        public City City;
        public string MetricType;
        public string Count;

        public Metric(string date, Country country, State state, City city, string metricType, string count) {
            Date = date;
            Country = country;
            State = state;
            City = city;
            MetricType = metricType;
            Count = count;
        }

        public string MetricTypeId() {
            if (MetricType == "Confirmed")
                return "1";
            if (MetricType == "Deaths")
                return "2";
            if (MetricType == "Recovered")
                return "3";

            throw new Exception("Bad metric type");
        }
    }

    public class Import {

        const int STATE_CITY = 0;
        const int COUNTRY = 1;
        const int LAT = 2;
        const int LONG = 3;

        static List<Country> Countries;
        static List<Metric> Metrics;

        public static void Run() {
            Countries = new List<Country>();
            Metrics = new List<Metric>();

            LoadFile("Confirmed");
            LoadFile("Deaths");
            LoadFile("Recovered");

            WriteToDb();

            MakeCsv();
        }


        private static void LoadFile(string metricType) {
            Console.WriteLine(metricType);

            string path = @"C:\project\covid19\Importer\data\COVID-19-master\COVID-19-master\csse_covid_19_data\csse_covid_19_time_series\";
            var csv = GetCsvParser(path + "time_series_19-covid-" + metricType + ".csv");

            string[] cols = csv.ReadFields();
            var days = new List<string>(cols);
            days.RemoveRange(0, 4);

            while (!csv.EndOfData) {
                string[] fields = csv.ReadFields();

                InsertMetric(fields, days, metricType);
            }
        }

        private static void InsertMetric(string[] fields, List<string> days, string metricType) {
            string countryName = fields[COUNTRY];
            string stateCity = fields[STATE_CITY];
            string lat = fields[LAT];
            string lon = fields[LONG];

            Country country = null;
            State state = null;

            country = Countries.Find(x => x.Name == countryName);
            if (country == null) {
                country = new Country(countryName, lat, lon);
                Countries.Add(country);
            }

            // Country only (no state or city specified)
            if (stateCity == "") {
                int col = 4;
                foreach (string day in days) {
                    string count = fields[col];
                    if (count != "0")
                        Metrics.Add(new Metric(day, country, null, null, metricType, count));
                    col++;
                }
                return;
            }

            // State or Province, but not a US city (fragile - won't work if province name contains a comma)
            if (!stateCity.Contains(",")) {
                state = country.States.Find(x => x.Name == stateCity);
                if (state == null) {
                    state = new State(stateCity, lat, lon);
                    country.States.Add(state);
                }

                int col = 4;
                foreach (string day in days) {
                    string count = fields[col];
                    if (count != "0")
                        Metrics.Add(new Metric(day, country, state, null, metricType, count));
                    col++;
                }
                return;
            }
        }


        private static void WriteToDb() {
            foreach (Country c in Countries) {
                c.Id = Db.Insert("INSERT INTO Country VALUES ('" + c.Name.Replace("'", "''") + "', '" + c.Lat + "', '" + c.Long + "')");

                foreach (State s in c.States) {
                    s.Id = Db.Insert("INSERT INTO State VALUES (" + c.Id + ",'" + s.Name.Replace("'", "''") + "', '" + s.Lat + "', '" + s.Long + "')");
                }
            }

            foreach (Metric m in Metrics) {
                Db.Insert("INSERT INTO Metric VALUES (" +
                    m.Country.Id + ", " +
                    ((m.State != null) ? m.State.Id : "1") + ", " +
                    ((m.City != null) ? m.City.Id : "1") + ", " +
                    m.MetricTypeId() + ", '" +
                    m.Date + "', " +
                    m.Count + ")");
            }
        }

        private static void MakeCsv() {
            var rows = new List<String>();
            rows.Add("country,state,date,confirmed,deaths,recovered");
            var reader = Db.Query("SELECT Country, State, Date, Confirmed, Deaths, Recovered FROM MetricView");
            while (reader.Read()) {
                // Console.WriteLine(reader[0].ToString());
                var row =
                    reader[0].ToString() + "," +
                    reader[1].ToString() + "," +
                    reader[2].ToString() + "," +
                    reader[3].ToString() + "," +
                    reader[4].ToString() + "," +
                    reader[5].ToString();
                rows.Add(row);
            }
            File.WriteAllText(@"c:\project\covid19\covid19\data\data.csv", string.Join("\n", rows.ToArray()));
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
