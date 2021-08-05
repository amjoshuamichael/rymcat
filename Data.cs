using System;
using System.IO;
using System.Collections;
using System.Collections.Generic;

namespace Rhymess
{
    public class Data
    {
        static Dictionary<string, string> myDict = new Dictionary<string, string>();
        
        public static void SetupDictionary() {
            using(var reader = new StreamReader("dictionary.csv")) {
                while (!reader.EndOfStream)
                {
                    var line = reader.ReadLine();
                    var values = line.Split(",");
                    myDict.Add(values[0], values[1].Substring(1));
                }
            }
        }
        
        public static string GetPronunciation(string searchWord) {
            try {
                return myDict[searchWord];
            }
            catch (KeyNotFoundException) {
                return "!";
            }
        }
    }    
}