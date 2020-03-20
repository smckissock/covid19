using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualBasic.FileIO;
using System.IO;


namespace covid19 {
    
    class Program {

        static void Main(string[] args) {
            Import.Run();
            MakeJson.Run();
            
            Console.WriteLine("DONE");
            Console.Read();

        }
    }
}
