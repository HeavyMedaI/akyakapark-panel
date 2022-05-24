import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardBody,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  ListGroup,
  ListGroupItem,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button
} from "reactstrap"
import { ChevronDown } from "react-feather"
import { WebClient } from '../../../../../utility/webclient'
import Chart from "react-apexcharts"
import Spinner from "../../../../../components/@vuexy/spinner/in-page-spinner"
import Select from "react-select"
import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import "flatpickr/dist/themes/light.css";
import "../../../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss"
import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

class Productorders extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      showModal: false,
      activeMenu: "Yarışmaya Göre",
      start: 0,
      end: 0,
      tckn_match: 0,
      phone_match: 0,
      quizes: [],
      game_1: null,
      game_2: null,
      week_1: null,
      week_2: null,
      report_type: 1,
      weeks: [],
      modalType: 1,
      raw_series: {
        series1: 0,
        series2: 0,
        total: 0
      },
      options: {
        chart: {
          dropShadow: {
            enabled: false,
            blur: 5,
            left: 1,
            top: 1,
            opacity: 0.2
          },
          toolbar: {
            show: false
          }
        },
        colors: [this.props.primaryLight, this.props.danger],
        fill: {
          type: "gradient",
          gradient: {
            gradientToColors: [
              this.props.primary,
              this.props.dangerLight
            ]
          }
        },
        dataLabels: {
          enabled: true,
          color: '#fff'
        },
        legend: { show: false },
        stroke: {
          width: 0
        },
        labels: ["Android", "IOS"]
      },
      series: [0, 0]
    }
  }

    componentDidMount() {
        // this._getList();
        this._getReports();
    }

    async _getList() {
        let c = new WebClient();
        await c.post("v1/getResources", {all_quiz: true})
        .then(({success, message, data}) => {
            if (success) {
                this.setState({quizes: data.all_quizes, weeks: data.weeks})
                if (data.all_quizes.length >= 2) {
                    this.setState({game_1: data.all_quizes[1], game_2: data.all_quizes[0]}, () => {
                        this._getReports();
                    })
                }
            }
        })
    } 

    async _getReports() {
        this.setState({loading: true})
        let c = new WebClient();
        await c.post("get-dashboard-report.json", {
            report_type: this.state.report_type
          })
        .then(({status, message, data}) => {
            if (status) { 
                let a = [data.series1, data.series2]
                this.setState({raw_series: data, series: a})        
            } else {
                this.setState({raw_series: {series1: 0, series2: 0, total: 0}, series: [0,0]})  
            }
            this.setState({loading: false}) 
        })
    }      

  
  render() {
    const { loading, showModal, activeMenu, modalType, raw_series, quizes, weeks } = this.state
    return (
      <Card>
        <CardHeader>
          <CardTitle>Platforma Göre</CardTitle>    
          {/* <UncontrolledDropdown>
            <DropdownToggle tag="big" className="text-bold-500 cursor-pointer">
              {activeMenu} <ChevronDown size={18} />
            </DropdownToggle>
            <DropdownMenu right>
              {
              activeMenu != "Yarışmaya Göre" && (
                <DropdownItem onClick={() => { this.setState({activeMenu: "Yarışmaya Göre", report_type: 1}) }}>Yarışmaya Göre</DropdownItem>
              )
              }

              {
              activeMenu != "Haftaya Göre" && (
                <DropdownItem onClick={() => { this.setState({activeMenu: "Haftaya Göre", report_type: 2}) }}>Haftaya Göre</DropdownItem>
              )
              }           
            </DropdownMenu>
          </UncontrolledDropdown>             */}
        </CardHeader>
        <CardBody className="pt-2">
          <div style={{ width: "100%", height: 290 }}>
            {
            !loading && (
            <Chart
              options={this.state.options}
              series={this.state.series}
              type="pie"
              height={290}          
            />
            )
            }

          </div>
        </CardBody>

        <ListGroup flush>
          <ListGroupItem className="d-flex justify-content-between">
            <div className="item-primary">
              <div
                className="bg-primary"
                style={{
                  height: "10px",
                  width: "10px",
                  borderRadius: "50%",
                  display: "inline-block",
                  margin: "// 0 5px"
                }}
              />
              <span className="text-bold-600 ml-2">Android</span>
            </div>
            <div className="product-result">
              <span>{raw_series.series1}</span>
            </div>
          </ListGroupItem>  
          <ListGroupItem className="d-flex justify-content-between">
            <div className="item-warning">
              <div
                className="bg-warning"
                style={{
                  height: "10px",
                  width: "10px",
                  borderRadius: "50%",
                  display: "inline-block",
                  margin: "// 0 5px"
                }}
              />
              <span className="text-bold-600 ml-2">İOS</span>
            </div>
            <div className="product-result">
              <span>{raw_series.series2}</span>
            </div>
          </ListGroupItem>                  
        </ListGroup>        

        {
        loading && (
          <div style={{ width: "100%", height: "100%", position: 'absolute', left: 0, top: 0, backgroundColor: "#fff", display: "flex", alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}>
            <Spinner />
          </div>
        )
        }        

        

      </Card>
    )
  }
}
export default Productorders
