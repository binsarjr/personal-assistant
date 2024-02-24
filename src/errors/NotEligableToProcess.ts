export default class extends Error {
	constructor(message = "Not eligable to process") {
		super(message);
	}
}
