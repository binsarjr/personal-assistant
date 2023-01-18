type DataPattern = string | RegExp
export interface Pattern {
  patterns: DataPattern | DataPattern[] | false
}
