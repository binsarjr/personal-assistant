export abstract class BaseAction {
	abstract execute(): Promise<void>;
}
