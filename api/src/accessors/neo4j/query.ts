import { driver } from './driver.js'

/**
 * Runs a Neo4j query using a tagged template literal and returning nothing.
 *
 * @param strings all the string values in the tagged template
 * @param values  all the interpolated values in the tagged template
 * @returns a promise resolving when the query has completed
 */
export async function run(strings: TemplateStringsArray, ...values: unknown[]): Promise<void> {
  await runOne(strings, ...values)
}

/**
 * Runs a Neo4j query using a tagged template literal and returning a single
 * value.
 *
 * @param strings all the string values in the tagged template
 * @param values  all the interpolated values in the tagged template
 * @returns a promise resolving to the returned value or null if no value was returned
 */
export async function runOne<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T | null> {
  const rows = await runMany<T>(strings, ...values)
  return rows[0] ?? null
}

/**
 * Runs a Neo4j query using a tagged template literal and returning multiple values.
 *
 * @param strings all the string values in the tagged template
 * @param values  all the interpolated values in the tagged template
 * @returns a promise resolving to an array of the returned values
 */
export async function runMany<T>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T[]> {
  // Build the query string by interleaving the strings and parameter placeholders
  const query = strings.reduce((querySoFar, queryPart, index) => {
    const paramPart = index < values.length ? `$param${index}` : ''
    return querySoFar + queryPart + paramPart
  }, '')

  // Build the parameters object by mapping each value to a parameter name
  const params = values.reduce<Record<string, unknown>>((paramsSoFar, paramValue, index) => {
    const paramName = `param${index}`
    return { ...paramsSoFar, [paramName]: paramValue ?? null }
  }, {})

  // Run the query and return the results
  const session = driver.session()
  try {
    const result = await session.run(query, params)
    return result.records.map(record => record.get(0) as T)
  } finally {
    await session.close()
  }
}
