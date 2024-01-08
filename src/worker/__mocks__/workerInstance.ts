//https://github.com/jestjs/jest/issues/3449#issuecomment-750345973

class Worker {
	url: any;
	onmessage: (msg: any) => void;
	constructor(stringUrl: any) {
		this.url = stringUrl;
		this.onmessage = () => {};
	}

	postMessage(msg: any) {
		this.onmessage(msg);
	}
}

export default Worker;
