const baseUrl =
	"https://dev.azure.com/VaxaSverige/Team%20Orion/_workitems/edit/";
let csvInput = undefined;
let headers = [];

function onLoad() {
	csvInput = document.querySelector("#csv-input");
	csvInput.addEventListener("input", (e) => onTextareaChanged(e));
}

function parseHeaders(data) {
	data = data.split("\n");
	headers = data.at(0).split(",");
	data.splice(0, 1);

	return data;
}

function parseKey(index) {
	return headers[index]?.replace(/\s/g, "_");
}

function parseValue(data) {
	return data.replace(/^\"(.*)\"$/gm, "");
}

function parseRow(data) {
	const regex = /(\"(?:,)\")|(\"(?:,,)\")|(?:,$)/gm;
	let content = data.split(regex);
	console.log("content: ", content);

	content = content.filter(
		(item) => !!item && !regex.test(item?.replace(",,", ""))
	);
	console.log("filtered: ", content);

	content = content.map((item) =>
		item === '",,"'
			? ""
			: (item.at(0) === '"' || item.at(-1) === '"') &&
			  item.split('"')?.length === 2
			? item.replace('"', "")
			: item.replaceAll('""', '"')
	);
	console.log("mapped: ", content);

	const items = content.map((item) => {
		return parseValue(item);
	});

	return items.reduce((prev, cur, index) => {
		let key = parseKey(index);

		return Object.assign(prev, {
			[key]: cur,
		});
	}, {});
}

function parseCSV(data) {
	data = parseHeaders(data);
	const content = data.map((item) => parseRow(item));

	return content;
}

function parseTags(data) {
	return data?.split(";")?.map((item) => item.trim());
}

function linkify(data) {
	const links = data.map((item) => {
		const link = `${baseUrl}${item.ID}`;
		return { ...item, Url: link };
	});

	return links;
}

function format(str, ...args) {
	let newString = str;
	args.forEach((value, index) => {
		newString = newString.replace(`{${index}}`, value);
	});

	return newString;
}

const getValue = (obj, prop) => (prop in obj ? obj[prop] : null);
const getAttr = (attr = {}) =>
	!!attr
		? Object.keys(attr)
				.filter((key) => key in attr)
				.map((key) => `${key}="${attr[key]}"`)
				.join(" ")
		: "";
const $ = (query) => document.querySelector(query);
const $add = (tag, content = null, attr = {}) =>
	`<${tag} ${getAttr(attr)}>${content || ""}</${tag}>`;

function copyToClipboard() {
	const data = parseCSV(csvInput.value);
	const content = linkify(data);

	const linkContainer = $(".output-container");
	const rawContainer = $("#raw-output");
	const thead = $(".csv-table thead");
	const tbody = $(".csv-table tbody");

	let theadInner = `<tr>`;
	let tbodyInner = "";
	for (let th of headers) {
		theadInner += $add("th", $add("div", th));
	}
	theadInner += `</tr>`;

	let linkInner = `<ol>`;

	for (let link of content) {
		const aStyle = `box-sizing: border-box; color: inherit; font-family: &quot;Segoe UI VSS (Regular)&quot;, &quot;Segoe UI&quot;, -apple-system, BlinkMacSystemFont, Roboto, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 14.6667px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;`;
		const spanStyle = `box-sizing: border-box; color: inherit; font-family: &quot;Segoe UI VSS (Regular)&quot;, &quot;Segoe UI&quot;, -apple-system, BlinkMacSystemFont, Roboto, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 11pt; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: inherit; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;`;
		const template = $add(
			"li",
			$add("a", "{1}", {
				href: "{0}",
				target: "_blank",
				rel: "noopener noreferrer",
				style: aStyle,
			}) + $add("span", " {2}", { style: spanStyle })
		);
		const formatted = format(
			template,
			link.Url,
			`${link.Work_Item_Type} ${link.ID}`,
			link.Title
		);

		linkInner += formatted;

		tbodyInner += `<tr>`;
		for (let [key, value] of Object.entries(link)) {
			if (headers.includes(key.replaceAll("_", " "))) {
				tbodyInner += `<td><div class='cell-${key
					.toLowerCase()
					.replaceAll(" ", "_")}'>`;
				switch (key) {
					case "Tags":
						parseTags(value).forEach((tag) =>
							console.log(`'${tag}'`)
						);

						tbodyInner += `${parseTags(value)?.reduce(
							(prev, cur) => prev + `<span>${cur}</span>`,
							""
						)}`;
						break;
					default:
						tbodyInner += `${value}`;
						break;
				}
				tbodyInner += `</div></td>`;
			}
		}
		tbodyInner += `</tr>`;
	}
	linkInner += `</ol>`;

	linkContainer.innerHTML = linkInner;
	rawContainer.value = linkInner;
	thead.innerHTML = theadInner;
	tbody.innerHTML = tbodyInner;

	navigator.clipboard
		.write([
			new ClipboardItem({
				"text/html": new Blob([linkContainer.outerHTML], {
					type: "text/html",
				}),
				"text/plain": new Blob([linkContainer.outerHTML], {
					type: "text/plain",
				}),
			}),
		])
		.then(() => console.log("Ok"))
		.catch((e) => console.error(e));
}

function onTextareaChanged(event) {
	copyToClipboard();
}
