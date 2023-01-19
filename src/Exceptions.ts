/**
 * Digunakan untuk mengecek error yang ada pada
 * proses pengecekkan di event event whatsapp client
 */
export class ValidateError extends Error {
  constructor(message: string) {
    super(message)

    // assign the error class name in your custom error (as a shortcut)
    this.name = this.constructor.name

    // capturing the stack trace keeps the reference to your error class
    Error.captureStackTrace(this, this.constructor)

  }
}
