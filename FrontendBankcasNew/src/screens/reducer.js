// @flow

import { combineReducers } from 'redux';
import { reducer as session } from 'modules/session';
import { reducer as breadcrumb } from 'screens/modules/breadcrumb';
import { reducer as profile } from 'modules/account';
import { reducer as categories } from 'modules/categories';
import { reducer as product } from 'modules/product';
import { reducer as productDetail } from 'modules/productDetail';
import { reducer as setting } from 'modules/setting';

const reducer = combineReducers({
  session,
  breadcrumb,
  categories,
  profile,
  product,
  productDetail,
  setting
});

export default reducer;