window.copyHtmlToClipboard = function (element) {
	navigator.clipboard.write([
		new ClipboardItem({
			"text/html": new Blob([element.outerHTML], {
				type: "text/html",
			}),
			"text/plain": new Blob([element.outerHTML], {
				type: "text/plain",
			}),
		}),
	]);
};
