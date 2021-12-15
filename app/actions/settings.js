// @flow
import _ from 'lodash';
import * as types from './types';
import { getCurrencyBalance } from './accounts';
import { getCurrencyExchangePrice } from './currency';

export function addToken(account, tokenSymbol, contract = 'eosio.token') {
  return (dispatch: () => void, getState) => {
    const symbol = tokenSymbol.toUpperCase();
    const { accounts } = getState();

    dispatch({
      type: types.ADD_TOKEN,
      account,
      symbol,
      contract
    });

    if (!accounts.balances[account] || !accounts.balances[account][symbol]) {
      dispatch(getCurrencyBalance(account));
    }
  };
}

export function removeToken(account, tokenSymbol, contract = 'eosio.token') {
  return (dispatch: () => void) => {
    const symbol = tokenSymbol.toUpperCase();

    dispatch({
      type: types.REMOVE_TOKEN,
      account,
      symbol,
      contract
    });
  };
}

export function setDefaultExplorer(explorer) {
  return (dispatch: () => void, getState) => {
    const { settings } = getState();
    const index = _.findIndex(settings.explorers, el => el.key === explorer);
    if (index > 0) {
      settings.explorers.splice(0, 0, settings.explorers.splice(index, 1)[0]);
      dispatch({
        type: types.SET_DEFAULT_EXPLORER,
        explorers: settings.explorers
      });
    }
  };
}

export function setTheme(theme) {
  return (dispatch: () => void, getState) =>
    new Promise((resolve, reject) => {
      const { settings } = getState();
      if (theme && settings.selectedTheme !== theme) {
        dispatch({
          type: types.SET_SELECTED_THEME,
          selectedTheme: theme
        });
        return resolve();
      }

      reject();
    });
}

export function setExchangeCurrency(currency) {
  return (dispatch: () => void, getState) => {
    const { settings } = getState();
    if (currency && settings.exchageCurrency !== currency) {
      dispatch({
        type: types.SET_EXCHANGE_CURRENCY,
        exchangeCurrency: currency
      });
      dispatch(getCurrencyExchangePrice('EOS', currency));
    }
  };
}

export default {
  addToken,
  removeToken,
  setExchangeCurrency
};
