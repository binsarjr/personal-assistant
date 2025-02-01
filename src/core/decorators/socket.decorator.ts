import "reflect-metadata";

export const Socket = () => {
	return (target: any, propertyKey: string, parameterIndex: number) => {
		const key = `socketParam:${propertyKey}`;
		// Simpan metadata di prototype dengan key yang unik
		Reflect.defineMetadata(key, parameterIndex, target);
	};
};
