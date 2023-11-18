import Fuse from 'fuse.js';

var FuseOptions = {
	includeScore: true,
	keys: ['articleText'],
	useExtendedSearch: true,
};

type Articles = {
	articleId: string;
	articleText: string;
	editDate: number;
}[];

export function performFuseSearch(searchTarget: Articles, searchPattern: string) {
	// https://www.fusejs.io/examples.html#nested-search
	let fuse = new Fuse(searchTarget, FuseOptions);
	let result = fuse.search(searchPattern);
	return result.reduce<Articles>((acc, cur) => {
		acc.push(cur.item);
		return acc;
	}, []);
}
