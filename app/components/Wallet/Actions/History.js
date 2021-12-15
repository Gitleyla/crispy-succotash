// @flow
import React, { Component } from 'react';
import { List, Grid, Icon, Label } from 'semantic-ui-react';
import { shell } from 'electron';
import _ from 'lodash';
import { parseAction } from '../../../utils/parser';
import ScrollingTable from './../../Shared/UI/ScrollingTable';
import MainContentContainer from './../../Shared/UI/MainContent';

type Props = {
  actions: {},
  account: {},
  history: {},
  explorer: {},
  lastIrreversibleBlock: number
};

export default class History extends Component<Props> {
  props: Props;
  state = { activeAction: -1 };

  handleClick = sequence => {
    this.setState({
      activeAction: this.state.activeAction === sequence ? -1 : sequence
    });
  };

  handleGoto = (e, { txid }) => {
    const { explorer } = this.props;
    shell.openExternal(`${explorer.path}${txid}`);
  };

  handleLoadNextActions = () => {
    const { account, actions, history } = this.props;
    const lastActionSeq =
      history.length === 0 ? 0 : history[0].account_action_seq;

      actions.getActions(account.account_name, lastActionSeq);
    this.forceUpdate();
  };

  render() {
    const { history, account, lastIrreversibleBlock } = this.props;
    const { activeAction } = this.state;
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };
    const options2 = { hour: '2-digit', minute: '2-digit' };
    const days = [];
    const lastActionSeq =
      history.length === 0 ? 0 : history[history.length - 1].account_action_seq;
    const totalPages = Math.ceil(lastActionSeq / 20);

    history.forEach(value => {
      const { block_time, account_action_seq, block_num } = value; // eslint-disable-line camelcase
      const date = new Date(block_time);
      const day = date.toLocaleDateString('en-US', options);
      const time = date.toLocaleTimeString('en-US', options2);

      let dayActions = _.find(days, { day });
      if (!dayActions) {
        dayActions = { day, actions: [], timestamp: date.getTime() };
        days.push(dayActions);
      }

      const { trx_id } = value.action_trace; // eslint-disable-line camelcase
      const { account, name, data } = value.action_trace.act; // eslint-disable-line no-shadow
      const { act_digest } = value.action_trace.receipt; // eslint-disable-line camelcase
      const action = {
        sequence: account_action_seq,
        time,
        txId: trx_id,
        account,
        name,
        data,
        digest: act_digest,
        irreversible: block_num <= lastIrreversibleBlock, // eslint-disable-line camelcase
        active: activeAction === account_action_seq // eslint-disable-line camelcase
      };

      if (!dayActions.actions.find(el => el.digest === action.digest && el.time === action.time)) {
        dayActions.actions.push(action);
      } 
    });
    const accountName = account.account_name;

    const items = _.map(_.reverse(days), dayGroup => (
      <List.Item key={dayGroup.day} style={{ marginBottom: '1em' }}>
        <p className="subtitle">{dayGroup.day}</p>
        <List.Content>
          <List selection divided>
            {_.map(_.reverse(dayGroup.actions), action => (
              <List.Item
                key={`${action.time}-${action.txId}-${action.digest}`}
                active={action.active}
              >
                <List.Content>
                  {renderAction(
                    action,
                    accountName,
                    this.handleClick,
                    this.handleGoto
                  )}
                </List.Content>
              </List.Item>
            ))}
          </List>
        </List.Content>
      </List.Item>
    ));

    return (
      <MainContentContainer 
        title="History" 
        subtitle="View account activity"
        content={
          <ScrollingTable 
            header={
              renderHeader()
            }
            content={
              <span>
                <List style={{ marginBottom: '2em' }}>{items}</List>
                {days.length > 0 &&
                totalPages > 1 && (
                  <Grid>
                    <Grid.Row centered>
                      <a
                        href="#"
                        onClick={this.handleLoadNextActions}
                      >
                        Show more
                      </a>
                    </Grid.Row>
                  </Grid>
                )}
              </span>
            }
          />
        }
      />
    );
  }
}

function renderAction(action, account, handler, goto) {
  let data = '';
  Object.keys(action.data).forEach(key => {
    data = [data, key, action.data[key]].join(' ');
  });

  const { desc, quantity, prettyname } = parseAction(action, account);
  let description = <Grid.Column width={4} />;
  if (desc) {
    description = <Grid.Column width={4}>{desc}</Grid.Column>;
  }
  let quant = <Grid.Column width={4} />;
  if (quantity) {
    quant = (
      <Grid.Column width={4} textAlign="right">
        {quantity}
      </Grid.Column>
    );
  }
  let status = <Icon name="spinner" loading />;
  if (action.irreversible) {
    status = <Icon name="check circle outline" />;
  }

  return (
    <Grid>
      <Grid.Row onClick={() => handler(action.sequence)}>
        <Grid.Column widht={1}>{status}</Grid.Column>
        <Grid.Column width={3}>{action.time}</Grid.Column>
        <Grid.Column width={3}><Label basic className={`history-action ${action.name} ${prettyname}`}>{prettyname}</Label></Grid.Column>
        {description}
        {quant}
      </Grid.Row>
      {action.active && (
        <Grid.Row style={{ fontSize: 'small' }}>
          <Grid.Column style={{ padding: '1em' }}>
            <div 
              txid={action.txId} 
              onClick={() => goto(null, { txid: action.txId })}
            >
              Transaction ID :
              &nbsp;
              <Icon name='info circle' />
              {action.txId}
            </div>
            {
              typeof action.data.memo === 'string' && (
                <div>Memo :&nbsp;{_.truncate(action.data.memo, { length: 1024})}</div>
              )
            }
          </Grid.Column>
        </Grid.Row>
      )}
    </Grid>
  );
}

function renderHeader() {
  return (
    <Grid className="tableheader">
      <Grid.Row>
        <Grid.Column widht={1}>
          <p className="tableheadertitle" />
        </Grid.Column>
        <Grid.Column width={3}>
          <p className="tableheadertitle">time</p>
        </Grid.Column>
        <Grid.Column width={3}>
          <p className="tableheadertitle">action</p>
        </Grid.Column>
        <Grid.Column width={4}>
          <p className="tableheadertitle">description</p>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );
}
