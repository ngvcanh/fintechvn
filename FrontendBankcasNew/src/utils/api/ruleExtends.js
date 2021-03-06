// @flow

import * as base from './base';

const SEATS_PAYLOADS_BASE = `${ base.API_BASE }/ruleExtends`;

export const get = (filter, skip, limit, where) => {
  filter  = filter  || {};
  where   = where   || {};
  skip    = skip    || 0;
  limit   = limit   || 0;
  
  let filters = {
    ...filter,
    skip,
    limit,
    where
  };
  
  let url = `${ SEATS_PAYLOADS_BASE }?filter=${ JSON.stringify(filters)}`;
  return base.get(url, 200)
    .then(obj => {
      return obj;
    });
}
