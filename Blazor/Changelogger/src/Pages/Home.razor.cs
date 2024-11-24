using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using Changelogger.Util;
using Changelogger.Services;
using System.Reflection.Metadata;

namespace Changelogger.Pages
{
    public partial class HomeComponentBase() : ComponentBase
    {
        [Inject]
        private IJSRuntime Js {get; set;} = default!;

        [Inject]
        private ClipboardService ClipboardService {get; set;} = default!;

        [GeneratedRegex("/\\s/g")]
        private static partial Regex KeyRegex();

        [GeneratedRegex(@"^""(.*)""$", RegexOptions.Multiline)]
        private static partial Regex ValueRegex();
        
        [GeneratedRegex(@"(""(?:,)"")|(""(?:,,)"")|(?:,$)", RegexOptions.Multiline)]
        private static partial Regex RowRegex();

        private readonly string baseUrl = "https://dev.azure.com/VaxaSverige/Team%20Orion/_workitems/edit/";

        private string[] headers = [];
        private string[] raw = [];

        public string CSVData = "";

        public ElementReference OutputContainer;

        protected async Task ConvertCSV()
        {
            await CopyToClipboard();
        }

        private void ParseHeader(string data)
        {
            string[] splitData = data.Split("\n");
            headers = splitData[0].Split(',');
            splitData.ToList().RemoveRange(0, 1);
            var removeHeaders = splitData.ToList();
            removeHeaders.RemoveRange(0, 1);
            raw = [.. removeHeaders];
        }

        private string ParseKey(int index)
        {
            return KeyRegex().Replace(headers[index], "_");
        }

        private string ParseValue(string data)
        {
            return ValueRegex().Replace(data, "");
        }

        private async Task<Dictionary<string, string>> ParseRow(string data)
        {
            string[] content = RowRegex()
                .Split(data);

            var filtered = content.Where(part => part?.Length > 0 && !RowRegex().IsMatch(part.Replace(",,", "")));
            var mapped = filtered.Select(part =>
            part.Length == 0 ? part :
                part == "\",,\""
                ? ""
                : (part[0] == '"' || part.Last() == '"') &&
                    part.Split("\"").Length == 2
                ? part.Replace("\"", "")
                : part.Replace("\"\"", "\""))
            .ToArray();

            var items = mapped.Select(ParseValue).ToArray();

            int index = 0;
            var dict = new Dictionary<string, string>();
            foreach (var item in items)
            {
                string key = ParseKey(index);
                index++;

                dict.Add(key, item);
            }
            dict.Add("Url", baseUrl + dict["ID"]);

            return dict;
        }

        private async Task<Dictionary<string, string>[]> ParseCSV(string data)
        {
            ParseHeader(data);
            var tasks = await Task.WhenAll(raw.Select(ParseRow));
            return tasks;
        }

        private string[] ParseTags(string data)
        {
            return data.Split(';').Select(item => item.Trim()).ToArray();
        }

        public async Task CopyToClipboard()
        {
            var parsed = await ParseCSV(CSVData);
            await Js.LogAsync("test", headers, parsed, raw);

            await ClipboardService.WriteHtmlAsync(OutputContainer);
        }
    }
}