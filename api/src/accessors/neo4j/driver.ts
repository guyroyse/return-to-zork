import neo4j from 'neo4j-driver'

import { NEO4J_PASSWORD, NEO4J_URI, NEO4J_USER } from '@src/env.js'

const token = neo4j.auth.basic(NEO4J_USER, NEO4J_PASSWORD)
export const driver = neo4j.driver(NEO4J_URI, token)
