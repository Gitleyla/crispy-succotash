// @flow
import React, { Component } from 'react';
import _ from 'lodash';
import { assetToNumber } from '../../utils/asset';
import StakeChart from '../Shared/StakeChart';
import MainContentContainer from './../Shared/UI/MainContent';

type Props = {
  account: {},
  delegates: {},
  delegatee: any
};

class StakedStats extends Component<Props> {
  render() {
    const { delegates, account, delegatee } = this.props;
    const refunds = unstakingBalance(account);

    const active = _.findIndex(delegates, el => el.to === delegatee);

    const cpuStakes = _.map(delegates, el => assetToNumber(el.cpu_weight));
    const cpuStake = _.sum(cpuStakes);

    const netStakes = _.map(delegates, el => assetToNumber(el.net_weight));
    const netStake = _.sum(netStakes);

    const cpuRefund = refunds.cpu;
    const netRefund = refunds.net;

    return (
      <MainContentContainer 
        title="Staked Information" 
        subtitle=""
        className="adjust-top-margin"
        content={(
          <div className='side-padding'>
            <StakeChart
              stakes={cpuStakes}
              max={cpuStake + cpuRefund}
              active={active}
            />
            <p>Staked CPU {parseFloat(cpuStake).toFixed(4)}</p>

            <StakeChart stakes={[cpuRefund]} max={cpuStake + cpuRefund} />
            <p>Refund CPU {parseFloat(cpuRefund).toFixed(4)}</p>

            <StakeChart
              stakes={netStakes}
              max={netStake + netRefund}
              active={active}
            />
            <p>Staked NET {parseFloat(netStake).toFixed(4)}</p>

            <StakeChart stakes={[netRefund]} max={netStake + netRefund} />
            <p>Refund NET {parseFloat(netRefund).toFixed(4)}</p>
          </div>
        )}
      />
    )
  }
}

function unstakingBalance(account) {
  const request = account.refund_request;
  if (request && request !== null) {
    const requestTime = new Date(request.request_time);
    requestTime.setDate(requestTime.getDate() + 3);
    if (requestTime - Date.now() < 0) return { cpu: 0, net: 0 };
    return {
      cpu: assetToNumber(request.cpu_amount),
      net: assetToNumber(request.net_amount)
    };
  }
  return { cpu: 0, net: 0 };
}

export default StakedStats;
