import faunadb from 'faunadb';

export const faunaClient = new faunadb.Client({
  secret: process.env.FAUNA_ADMIN_KEY,
  domain: 'db.us.fauna.com',
  scheme: 'https',
  timeout: 3
});
