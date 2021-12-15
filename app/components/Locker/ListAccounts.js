// @flow
import React, { Component } from 'react';
import { List, Icon, Form, Button, Segment, Grid } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import compose from 'lodash/fp/compose';
import { setActiveAccount } from '../../actions/accounts';
import { clearConnection } from '../../actions/connection';

type Props = {
  clearConnection: () => {},
  setActiveAccount: string => {},
  accounts: {},
  history: {},
  states: {}
};

export class ListAccountsContainer extends Component<Props> {
  props: Props;

  componentDidUpdate() {
    const { history, states } = this.props;
    if (states.accountInfoRetrieved) {
      history.push('/wallet');
    }
  }

  onGoBack = () => {
    this.props.clearConnection();
  };

  gotoWallet = (e, { value }) => {
    const { accounts } = this.props;

    this.props.setActiveAccount(accounts.names.indexOf(value));
  };

  render() {
    const { accounts } = this.props;

    const accountRender = accounts.names.map(account => (
      <List.Item as="a" onClick={this.gotoWallet} key={account} value={account}>
        <Icon name="user" />
        <List.Content>
          <List.Description>{account}</List.Description>
        </List.Content>
      </List.Item>
    ));

    return (
      <Grid>
        <Grid.Row columns={3} className="container">
          <Grid.Column width={5} />
          <Grid.Column width={6}>
            <Form>
              <Segment>
                <List divided relaxed animated>
                  {accountRender}
                </List>
              </Segment>
              <div>
                <Button
                  icon="arrow alternate circle left"
                  content="Back"
                  onClick={this.onGoBack}
                />
              </div>
            </Form>
          </Grid.Column>
          <Grid.Column width={5} />
        </Grid.Row>
      </Grid>
    );
  }
}

function mapStateToProps(state) {
  return {
    accounts: state.accounts,
    states: state.states
  };
}

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      setActiveAccount,
      clearConnection,
      push
    },
    dispatch
  );

export default compose(
  withRouter,
  connect(mapStateToProps, mapDispatchToProps)
)(ListAccountsContainer);
