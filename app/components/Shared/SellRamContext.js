import React, { Component } from 'react';
import { Table } from 'semantic-ui-react';

type Props = {
  context: {}
};

class SellRamContext extends Component<Props> {
  renderText = () => {
    const { context } = this.props;
    return (
      <p className="dashed-border">
        You are about to sell <strong>{context.bytes}</strong> bytes of RAM.
        Transaction details are listed below.
      </p>
    );
  }

  renderDetails = () => {
    const { context } = this.props;
    return (
      <Table basic="very" className="verify-content">
        <Table.Body>
          <Table.Row>
            <Table.Cell width={3}>Contract</Table.Cell>
            <Table.Cell>Action</Table.Cell>
            <Table.Cell>Receiver</Table.Cell>
            <Table.Cell>Bytes</Table.Cell>
          </Table.Row>
          <Table.Row>
            <Table.Cell>{context.contract}</Table.Cell>
            <Table.Cell>{context.action}</Table.Cell>
            <Table.Cell>{context.receiver}</Table.Cell>
            <Table.Cell>{context.bytes}</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }

  render() {
    const { context } = this.props;

    let content;
    if (context !== null) {
      content = (
        <div>
          {this.renderText()}
          {this.renderDetails()}
        </div>
      );
    }

    return content;
  }
}

export default SellRamContext;
