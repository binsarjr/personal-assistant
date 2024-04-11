/**
 * Mengembalikan angka integer yang merupakan hasil dari pembulatan nilai acak
 * dalam rentang min sampai max.
 *
 * @param min - nilai minimal yang disediakan.
 * @param max - nilai maksimal yang disediakan.
 * @returns sebuah bilangan integer hasil pembulatan nilai acak dalam rentang
 * min sampai max.
 */
export function randomInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
