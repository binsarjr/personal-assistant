type Nullable<T> = T | null | undefined;

/**
 * Mengembalikan promise pertama yang memiliki data valid (bukan null/undefined).
 * @param promises Array of promises.
 * @returns Promise<T | undefined>
 */
export async function firstValidData<T>(
	promises: Promise<Nullable<T>>[]
): Promise<T | undefined> {
	return new Promise((resolve) => {
		let pending = promises.length;
		let found = false;

		promises.forEach((promise) => {
			promise
				.then((result) => {
					if (!found && result !== undefined && result !== null) {
						found = true;
						resolve(result); // Return data pertama yang valid
					} else {
						pending--;
						if (pending === 0 && !found) {
							resolve(undefined); // Semua promise tidak ada data
						}
					}
				})
				.catch(() => {
					pending--;
					if (pending === 0 && !found) {
						resolve(undefined); // Semua promise gagal
					}
				});
		});
	});
}
