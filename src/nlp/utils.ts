import csv from 'csv-parser'
import { createReadStream } from 'fs'
import { glob } from 'glob'
/**
 * Membaca data stem dari file CSV.
 * Fungsi ini menggunakan aliran baca untuk membaca file CSV dan
 * mengembalikan objek berisi pasangan data input dan output.
 *
 * @param filepath - Path ke file CSV.
 * @returns Objek berisi pasangan data input dan output.
 */
export const readDataStem = async (...pathPattern: string[]) => {
  const files = await glob(pathPattern)
  const results: { [s: string]: string } = {}
  for (const file of files) {
    await new Promise(async (resolve, reject) => {
      createReadStream(file)
        .pipe(csv())
        .on('data', (data) => {
          results[data.input] = data.output
        })
        .on('end', () => {
          resolve(results)
        })
    })
  }
  return results
}
