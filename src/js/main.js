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
	console.log(data.at(0));

	return data;
}

function parseKey(index) {
	return headers[index]?.replace(/\s/g, "_");
}

function parseValue(data) {
	return data.replace(/^\"(.*)\"$/gm, "");
}

function parseRow(data) {
	/*     const _split = ()
    const separatorIndex = data.indexOf('","'); */
	const content = data.split(/(\"(?:,)\")|(\"(?:,,)\")/gm);
	console.log(content);

	const items = content.map((item, index) => {
		/* return /^"(.*)"$/gm.exec(item)?.at(1); */
		/* console.log(item, parseValue(item)); */

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

function copyToClipboard() {
	const data = parseCSV(csvInput.value);
	const content = linkify(data);

	const linkContainer = document.querySelector(".link-container");

	for (let link of content) {
		const aStyle = `box-sizing: border-box; color: inherit; font-family: &quot;Segoe UI VSS (Regular)&quot;, &quot;Segoe UI&quot;, -apple-system, BlinkMacSystemFont, Roboto, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 14.6667px; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal;`;
		const spanStyle = `box-sizing: border-box; color: inherit; font-family: &quot;Segoe UI VSS (Regular)&quot;, &quot;Segoe UI&quot;, -apple-system, BlinkMacSystemFont, Roboto, &quot;Helvetica Neue&quot;, Helvetica, Ubuntu, Arial, sans-serif, &quot;Apple Color Emoji&quot;, &quot;Segoe UI Emoji&quot;, &quot;Segoe UI Symbol&quot;; font-size: 11pt; font-style: normal; font-variant-ligatures: normal; font-variant-caps: normal; font-weight: 400; letter-spacing: normal; orphans: 2; text-align: start; text-indent: 0px; text-transform: none; widows: 2; word-spacing: 0px; -webkit-text-stroke-width: 0px; white-space: normal; background-color: inherit; text-decoration-thickness: initial; text-decoration-style: initial; text-decoration-color: initial;`;
		const template = `<li><a href="{0}" target="_blank" rel="noopener noreferrer" style="${aStyle}">{1}</a><span style="${spanStyle}">: {2}</span></li>`;
		const formatted = format(
			template,
			link.Url,
			`${link.Work_Item_Type} ${link.ID}`,
			link.Title
		);

		linkContainer.innerHTML += formatted;
	}

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
