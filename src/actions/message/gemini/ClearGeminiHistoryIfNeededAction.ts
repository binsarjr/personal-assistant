import { BaseAction } from "../../../contracts/actions/BaseAction.js";
import DB from "../../../services/database.js";
import { Queue } from "../../../services/queue.js";

export default class extends BaseAction {
	async execute() {
		for (let bot in DB.data.gemini) {
			for (let jid in DB.data.gemini[bot]) {
				const history = DB.data.gemini[bot][jid].history || [];
				// if last history no more interaction after 30 minutes ago, clear history
				const lastHistory = history[history.length - 1];
				if (
					lastHistory &&
					Date.now() - lastHistory.timestamp > 30 * 60 * 1000
				) {
					DB.data.gemini[bot][jid].history = [];
					Queue.add(() => DB.write());
				}
			}
		}
	}
}
