import _ from 'lodash';
import React, { Component } from 'react';
import { Form, Grid, List, Label } from 'semantic-ui-react';
import TransactionsModal from '../../Shared/TransactionsModal';
import { numberToAsset, assetToNumber } from '../../../utils/asset';
import { InputFloat, InputAccount } from '../../Shared/EosComponents';
import MainContentContainer from '../../Shared/UI/MainContent';
import ScrollingTable from '../../Shared/UI/ScrollingTable';
import PermissionButton from '../../Shared/UI/PermissionButton';

const numeral = require('numeral');
const exactMath = require('exact-math');

const fraction10000 = 10000;

type Props = {
  account: {},
  delegates: {},
  transaction: {},
  actions: {}
};

export default class Undelegate extends Component<Props> {
  constructor(props) {
    super(props);

    const { account } = props;
    this.state = Object.assign(
      {
        openModal: false,
        cpuDelta: 0,
        netDelta: 0,
        recipient: '',
        cpu: 0,
        net: 0,
        permission: ''
      },
      this.getStakedValues(account.account_name)
    );
  }

  componentWillReceiveProps(nextProps) {
    const { account, delegates } = nextProps;
    if (!_.eq(this.props.delegates, account.account_name)) {
      const staked = this.getStakedValuesFor(account.account_name, delegates);
      Object.assign(this.state, {
        recipient: account.account_name,
        cpu: staked.cpu,
        net: staked.net
      });
    }
  }

  isDelegatedTo = name => {
    const { delegates } = this.props;
    return delegates.find(el => el.to === name) !== undefined;
  };

  getStakedValues = name => {
    const { delegates } = this.props;
    return this.getStakedValuesFor(name, delegates);
  };

  getStakedValuesFor = (name, delegates) => {
    const delegatee = delegates.find(el => el.to === name);
    if (delegatee) {
      return {
        cpu: assetToNumber(delegatee.cpu_weight, true),
        net: assetToNumber(delegatee.net_weight, true),
        recipient: name
      };
    }
    return {
      cpu: 0,
      net: 0,
      recipient: name
    };
  };

  handleDelegateSelect = (e, { name }) => {
    const { actions } = this.props;
    const stakes = this.getStakedValues(name);
    if (this.recipient !== name) {
      if (stakes) {
        this.setState({
          cpu: stakes.cpu,
          net: stakes.net,
          recipient: stakes.recipient,
          cpuDelta: 0,
          netDelta: 0
        });
      }
    }
    actions.setDelegateeAccount(stakes ? stakes.recipient : undefined);
  };

  handleRecipientChange = (e, { name, value }) => {
    const { actions } = this.props;
    this.setState({ [name]: value });
    const stakes = this.getStakedValues(value);
    if (stakes) {
      actions.setDelegateeAccount(stakes.recipient);
      this.setState({ cpu: stakes.cpu, net: stakes.net });
    } else {
      actions.setDelegateeAccount(undefined);
      this.setState({ cpu: 0, net: 0 });
    }
  };

  handleChange = (e, { name, value }) => {
    if (value === '' || name === 'permission') {
      this.setState({ [name]: value });
      return;
    }
    const staked = this.getStakedValues(this.state.recipient);

    const intValue = exactMath.mul(parseFloat(value), fraction10000);
    const delta = intValue - staked[name];

    this.setState({
      [name]: intValue,
      [`${name}Delta`]: delta
    });
  };

  handleSubmit = () => {
    const { cpuDelta, netDelta, recipient, permission } = this.state;
    const { account, actions } = this.props;
    const accountName = account.account_name;

    const cpu = numberToAsset(Math.abs(exactMath.div(cpuDelta, fraction10000)));
    const net = numberToAsset(Math.abs(exactMath.div(netDelta, fraction10000)));

    actions.checkAndRun(
      actions.undelegate,
      accountName,
      recipient,
      net,
      cpu,
      permission
    );

    this.setState({ openModal: true });
  };

  handleClose = () => {
    const { account, actions } = this.props;

    actions.resetState();
    actions.getAccount(account.account_name);
    this.setState({ openModal: false, cpuDelta: 0, netDelta: 0 });
  };

  validateFields = () => {
    const { cpuDelta, netDelta, recipient } = this.state;
    const { cpu, net } = this.state;

    if (!this.isDelegatedTo(recipient)) {
      return false;
    }

    if (cpuDelta === 0 && netDelta === 0) {
      return false;
    }

    if (cpu === '' || net === '') {
      return false;
    }

    return true;
  };

  validateStakes = (min, val, staked, isCpu) => {
    const stakedVal = exactMath.div(
      staked[isCpu ? 'cpu' : 'net'],
      fraction10000
    );
    const state = { isInvalid: true, className: 'invalid' };

    if (val < min) {
      state.message = `Its not recomended to have ${
        isCpu ? 'CPU' : 'NET'
      } below ${numberToAsset(min)}`;
      state.isInvalid = false;
      return state;
    } else if (val > stakedVal) {
      state.message = `Cannot exceed ${numberToAsset(stakedVal)}`;
      return state;
    }

    return {
      isInvalid: false
    };
  };

  renderForm = () => {
    const { transaction, account } = this.props;
    const { openModal, recipient } = this.state;
    let { cpu, net } = this.state;
    if (typeof cpu === 'number') {
      cpu = exactMath.div(cpu, fraction10000);
    }
    if (typeof net === 'number') {
      net = exactMath.div(net, fraction10000);
    }

    const staked = this.getStakedValues(recipient);

    const min = staked.recipient === account.account_name ? 0.5 : 0;
    const validCpu = this.validateStakes(min, cpu, staked, true);
    const validNet = this.validateStakes(min, net, staked, false);
    const enableRequest =
      this.validateFields() && !validCpu.isInvalid && !validNet.isInvalid;

    return (
      <Form onSubmit={this.handleSubmit}>
        <TransactionsModal
          open={openModal}
          transaction={transaction}
          handleClose={this.handleClose}
        />
        <Form.Field>
          <InputAccount
            id="form-input-control-recipient"
            label="From"
            name="recipient"
            readOnly
            value={recipient}
            onChange={this.handleRecipientChange}
          />
          <InputFloat
            label={validCpu.message ? validCpu.message : 'CPU (EOS)'}
            name="cpu"
            step="0.0001"
            min={0}
            max={Number.MAX_SAFE_INTEGER}
            value={cpu}
            type="number"
            className={validCpu.className}
            onChange={this.handleChange}
          />
          <InputFloat
            label={validNet.message ? validNet.message : 'NET (EOS)'}
            name="net"
            step="0.0001"
            min={0}
            max={Number.MAX_SAFE_INTEGER}
            value={net}
            type="number"
            className={validNet.className}
            onChange={this.handleChange}
          />
        </Form.Field>
        <Form.Group id="form-button-control-public">
          <PermissionButton 
            content="Undelegate"
            disabled={!enableRequest}
            account={account}
            onChange={this.handleChange}
          />
        </Form.Group>
      </Form>
    );
  };

  renderDelegate = (delegate, colorClass) => {
    const cpu = numeral(assetToNumber(delegate.cpu_weight)).format('0,0.0000');
    const net = numeral(assetToNumber(delegate.net_weight)).format('0,0.0000');
    return (
      <Grid>
        <Grid.Row>
          <Grid.Column width={6}>
            <span>
              <Label circular empty className={colorClass} /> {delegate.to}
            </span>
          </Grid.Column>
          <Grid.Column textAlign="right" width={5}>
            {cpu}
          </Grid.Column>
          <Grid.Column textAlign="right" width={5}>
            {net}
          </Grid.Column>
        </Grid.Row>
      </Grid>
    );
  };

  renderHeader = () => (
    <Grid className="tableheader">
      <Grid.Row>
        <Grid.Column width={6}>
          <p className="tableheadertitle">delegated to</p>
        </Grid.Column>
        <Grid.Column textAlign="center" width={5}>
          <p className="tableheadertitle">cpu, eos</p>
        </Grid.Column>
        <Grid.Column textAlign="right" width={5}>
          <p className="tableheadertitle">net, eos</p>
        </Grid.Column>
      </Grid.Row>
    </Grid>
  );

  renderDelegates = () => {
    const { recipient } = this.state;
    let { delegates } = this.props;
    if (delegates && delegates === null) {
      delegates = [];
    } else if (delegates.length > 1) {
      const index = delegates.findIndex(el => el.to === el.from);
      if (index > 0) {
        delegates.splice(0, 0, delegates.splice(index, 1)[0]);
      }
    }

    return (
      <ScrollingTable
        header={this.renderHeader()}
        content={
          <List selection divided>
            {_.map(delegates, (delegate, i) => (
              <List.Item
                key={delegate.to}
                name={delegate.to}
                onClick={this.handleDelegateSelect}
                active={recipient === delegate.to}
              >
                <List.Content>
                  {this.renderDelegate(
                    delegate,
                    `delegate-background-color-${i % delegates.length}`
                  )}
                </List.Content>
              </List.Item>
            ))}
          </List>
        }
      />
    );
  };

  render() {
    return (
      <MainContentContainer
        title="Stake Management"
        subtitle="Here you can undelegate your resources from accounts"
        className="adjust-content"
        content={
          <div className="stake">
            <div className="stake-form">{this.renderForm()}</div>
            <div className="stake-delegation-table">
              {this.renderDelegates()}
            </div>
          </div>
        }
      />
    );
  }
}
