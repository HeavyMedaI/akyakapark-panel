import React from "react"
import StatisticsCard from "../../../../../components/@vuexy/statisticsCard/StatisticsCard"
import { Package } from "react-feather"
import { ordersReceived, ordersReceivedSeries } from "./StatisticsData"

class OrdersReceived extends React.Component {
  render() {
    return (
      <StatisticsCard
        icon={<Package className="warning" size={22} />}
        iconBg="warning"
        stat={this.props.val}
        statTitle="Yarışmaya Katılan Toplam Kullanıcı Sayısı"
        options={ordersReceived}
        series={ordersReceivedSeries}
        hideChart
        type="area"
      />
    )
  }
}
export default OrdersReceived
