import faunadb from 'faunadb';

export const faunaClient = process.env.FAUNA_ADMIN_KEY ? new faunadb.Client({
  secret: process.env.FAUNA_ADMIN_KEY,
  domain: 'db.us.fauna.com',
  scheme: 'https',
  timeout: 3,
  queryTimeout: 5000
}) : null;
