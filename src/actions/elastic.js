export const INIT_ELASTIC = 'INIT_ELASTIC';

export const initElastic = (client) => ({
  'type': INIT_ELASTIC,
  'client': client
});
