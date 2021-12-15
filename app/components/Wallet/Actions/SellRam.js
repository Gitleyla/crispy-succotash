// @flow
import React, { Component } from 'react';
import { Form } from 'semantic-ui-react';
import TransactionsModal from '../../Shared/TransactionsModal';
import PermissionButton from '../../Shared/UI/PermissionButton';
import { InputFloat } from '../../Shared/EosComponents';

type Props = {
  account: {},
  transaction: {},
  actions: {}
};

export default class BuyRam extends Component<Props> {
  state = {
    quantity: 0,
    openModal: false,
    permission: ''
  };

  handleChange = (e, { name, value }) => {
    const object = { [name]: value };
    if (name === 'option' && value !== this.state.option) {
      Object.assign(object, { quantity: 0 });
    }
    this.setState(object);
  };

  handleSubmit = () => {
    const { quantity, permission } = this.state;
    const { actions } = this.props;
    actions.checkAndRun(actions.sellram, parseInt(quantity, 10), permission);
    this.setState({ openModal: true });
  };

  handleClose = () => {
    const { account, actions } = this.props;

    actions.resetState();
    actions.getAccount(account.account_name);
    this.setState({ openModal: false, quantity: 0 });
  };

  render() {
    const { transaction, account } = this.props;
    const { quantity, openModal } = this.state;
    const available = account.ram_quota - 4096;
    const disabled = quantity === 0;

    return (
      <div>
        <TransactionsModal
          open={openModal}
          transaction={transaction}
          handleClose={this.handleClose}
        />
        <Form onSubmit={this.handleSubmit}>
          <Form.Group widths="equal">
            <InputFloat
              label="Bytes"
              name="quantity"
              step={1}
              min={0}
              max={available}
              value={quantity}
              type="number"
              onChange={this.handleChange}
            />
          </Form.Group>
          <Form.Group id="form-button-control-public">
            <PermissionButton 
              content="Sell RAM"
              disabled={disabled}
              account={account}
              onChange={this.handleChange}
            />
          </Form.Group>
        </Form>
      </div>
    );
  }
}
