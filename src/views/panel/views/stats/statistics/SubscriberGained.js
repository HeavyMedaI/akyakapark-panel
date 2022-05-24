import React from "react"
import StatisticsCard from "../../../../../components/@vuexy/statisticsCard/StatisticsCard"
import { Users } from "react-feather"
import { subscribersGained, subscribersGainedSeries } from "./StatisticsData"

class SubscriberGained extends React.Component {
  render() {
    return (
      <StatisticsCard
        icon={<Users className="primary" size={72} />}
        stat={this.props.val}
        statTitle="Toplam Uygulama Kullanıcısı"
        options={subscribersGained}
        hideChart
        series={subscribersGainedSeries}
        type="area"
      />
    )
  }
}
export default SubscriberGained
