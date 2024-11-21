using System.Diagnostics;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Forms;

namespace src.Pages
{

    public partial class HomeComponentBase : ComponentBase
    {
        [GeneratedRegex("/\\s/g")]
        private static partial Regex KeyRegex();
        [GeneratedRegex("/^\"(.*)\"$/gm")]
        private static partial Regex ValueRegex();
        [GeneratedRegex("/(\"(?:,)\")|(\"(?:,,)\")|(?:,$)/dgm")]
        private static partial Regex RowRegex();

        private string[] headers = [];
        private string[] data = [];

        public string CSVData = "";

        protected void ConvertCSV()
        {
            Console.WriteLine(CSVData);
        }

        private void ParseHeader(string data)
        {
            string[] splitData = data.Split("\n");
            headers = splitData[0].Split(',');
            splitData.ToList().RemoveRange(0, 1);
            this.data = [.. splitData];
        }

        private string ParseKey(int index)
        {
            return KeyRegex().Replace(headers[index], "_");
        }

        private string ParseValue(string data)
        {
            return ValueRegex().Replace(data, "");
        }

        private Dictionary<string, string> ParseRow(string data)
        {
            string[] content = RowRegex()
                .Split(data)
                .Where(part => RowRegex().IsMatch(part.Replace(",,", "")))
                .Select(part =>
                    part == "\",,\""
                    ? ""
                    : (part[0] == '"' || part.ElementAt(-1) == '"') &&
                        part.Split("\"").Length == 2
                    ? part.Replace("\"", "")
                    : part.Replace("\"\"", "\""))
                .ToArray();

            var items = content.Select(ParseValue).ToArray();

            int index = 0;
            var dict = new Dictionary<string, string>();
            foreach (var item in items)
            {
                string key = ParseKey(index);
                index++;

                dict.Add(key, item);
            }

            return dict;
        }

        private Dictionary<string, string>[] ParseCSV(string data)
        {
            ParseHeader(data);

            return this.data.Select(ParseRow).ToArray();
        }

        private string[] ParseTags(string data)
        {
            return data.Split(';').Select(item => item.Trim()).ToArray();
        }

        private string[] Linkify(string[] data)
        {
            return ["test"];
        }

        public void CopyToClipboard()
        {

        }
    }
}