import { KurrentDBClient } from '@kurrent/kurrentdb-client'

import { KURRENTDB_URI } from '@src/env.js'

export const client = KurrentDBClient.connectionString(KURRENTDB_URI)
