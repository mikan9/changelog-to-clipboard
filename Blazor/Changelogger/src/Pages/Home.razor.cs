using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Components;
using Microsoft.JSInterop;
using src.Util;

namespace src.Pages
{
    public partial class HomeComponentBase : ComponentBase
    {
        [Inject]
        private IJSRuntime Js { get; set; } = default!;

        [GeneratedRegex("/\\s/g")]
        private static partial Regex KeyRegex();
        [GeneratedRegex(@"^""(.*)""$", RegexOptions.Multiline)]
        private static partial Regex ValueRegex();
        [GeneratedRegex(@"(""(?:,)"")|(""(?:,,)"")|(?:,$)", RegexOptions.Multiline)]
        private static partial Regex RowRegex();

        private string[] headers = [];
        private string[] raw = [];

        public string CSVData = "";

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

            await Js.LogAsync("headers: ", headers);
            await Js.LogAsync("content: ", content);
            var filtered = content.Where(part => part != null && !RowRegex().IsMatch(part.Replace(",,", "")));
            await Js.LogAsync("filtered: ", filtered);
            var mapped = filtered.Select(part =>
            part.Length == 0 ? part :
                part == "\",,\""
                ? ""
                : (part[0] == '"' || part.Last() == '"') &&
                    part.Split("\"").Length == 2
                ? part.Replace("\"", "")
                : part.Replace("\"\"", "\""))
            .ToArray();

            await Js.LogAsync("mapped: ", mapped);

            var items = content.Select(ParseValue).ToArray();
            await Js.LogAsync("items: ", items);

            int index = 0;
            var dict = new Dictionary<string, string>();
            foreach (var item in items)
            {
                await Js.LogAsync("index: ", index, "item: ", item);
                string key = ParseKey(index);
                await Js.LogAsync("key: ", key);
                index++;

                dict.Add(key, item);
            }

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

        private string[] Linkify(string[] data)
        {
            return ["test"];
        }

        public async Task CopyToClipboard()
        {
            var parsed = await ParseCSV(CSVData);
            await Js.LogAsync("test", headers, parsed, raw);
        }
    }
}