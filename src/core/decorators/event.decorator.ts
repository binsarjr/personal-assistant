import "reflect-metadata";

export function OnEvent(eventType: string) {
	return (target: any, propertyKey: string) => {
		Reflect.defineMetadata("whatsapp:event", eventType, target, propertyKey);
	};
}
