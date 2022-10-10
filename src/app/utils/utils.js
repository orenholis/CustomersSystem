export function updateSearchParams(name, value) {
	let params = new URLSearchParams(location.search);
	params.append(name, value);
	pushNewURLParams(params);
}

export function pushNewURLParams(params) {
	let paramsStr = params.toString();
	let url = new URL('' + (paramsStr ? '?' + paramsStr : ''), location.href);

	history.pushState({}, '', url.toString());
}

export function getURLSearchParam(name) {
	const params = new URLSearchParams(document.location.search.substring(1));
	return params.get(name);
}