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
      activeMenu: "Bu Hafta",
      start: 0,
      end: 0,
      tckn_match: 0,
      phone_match: 0,
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
        labels: ["Aktif Kullanıcı Sayısı", "Aktif Olmayan Kullanıcı Sayısı"]
      },
      series: [0, 0]
    }
  }

  componentDidMount() {
    this._getReports(0, 0, 0, 0, 0)
  }

  async _getReports(type, start, end, phone_match, tckn_match) {
    this.setState({loading: true})
    let c = new WebClient();
    await c.post("get-user-activities.json", {type, start, end, phone_match, tckn_match})
    .then(({status, message, data}) => {
      if (status) { 
        let a = [data.series1, data.series2]
        this.setState({raw_series: data, series: a})        
      } else {
        this.setState({raw_series: {series1: 0, series2: 0, total: 0}, series: [0,0]})  
      }
      this.setState({loading: false, start: 0, end: 0, tckn_match: 0, phone_match: 0})
    })
  }  

  
  render() {
    const { loading, showModal, activeMenu, modalType, raw_series } = this.state
    return (
      <Card>
        <CardHeader>
          <CardTitle>Kullanıcı Aktivitesi</CardTitle>
          <UncontrolledDropdown>
            <DropdownToggle tag="big" className="text-bold-500 cursor-pointer">
              {activeMenu} <ChevronDown size={18} />
            </DropdownToggle>
            <DropdownMenu right>
              {
              activeMenu != "Bu Hafta" && (
                <DropdownItem onClick={() => { this.setState({activeMenu: "Bu Hafta"}, () => { this._getReports(0, 0, 0, 0, 0) }) }}>Bu Hafta</DropdownItem>
              )
              }

              {
              activeMenu != "Önceki Hafta" && (
                <DropdownItem onClick={() => { this.setState({activeMenu: "Önceki Hafta"}, () => { this._getReports(2, 0, 0, 0, 0) }) }}>Önceki Hafta</DropdownItem>
              )
              }           

              {
              activeMenu != "Bu Ay" && (
                <DropdownItem onClick={() => { this.setState({activeMenu: "Bu Ay"}, () => { this._getReports(3, 0, 0, 0, 0) }) }}>Bu Ay</DropdownItem>
              )
              }           

              {
              activeMenu != "Önceki Ay" && (
                <DropdownItem onClick={() => { this.setState({activeMenu: "Önceki Ay"}, () => { this._getReports(4, 0, 0, 0, 0) }) }}>Önceki Ay</DropdownItem>
              )
              }           

              {
              activeMenu != "Tarihe Göre" && (
                <DropdownItem onClick={() => { this.setState({showModal: true, modalType: 1}) }}>Tarihe Göre</DropdownItem>
              )
              }           

              {/* {
              activeMenu != "Yarışmaya Göre" && (
                <DropdownItem onClick={() => { this.setState({activeMenu: "Yarışmaya Göre", showModal: true, modalType: 2}) }}>Yarışmaya Göre</DropdownItem>
              )
              }                                                                       */}

            </DropdownMenu>
          </UncontrolledDropdown>
        </CardHeader>
        <CardBody className="pt-0">
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
            <div className="item-info">
              <div
                className="bg-info"
                style={{
                  height: "10px",
                  width: "10px",
                  borderRadius: "50%",
                  display: "inline-block",
                  margin: "// 0 5px"
                }}
              />
              <span className="text-bold-600 ml-2">Toplam Kullanıcı Sayısı</span>
            </div>
            <div className="product-result">
              <span>{raw_series.total}</span>
            </div>
          </ListGroupItem>        
          <ListGroupItem className="d-flex justify-content-between">
            <div className="item-info">
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
              <span className="text-bold-600 ml-2">Aktif Kullanıcı Sayısı</span>
            </div>
            <div className="product-result">
              <span>{raw_series.series1}</span>
            </div>
          </ListGroupItem>
        </ListGroup>

        {
        showModal && (
          <div style={{ width: "100%", height: "100%", position: 'absolute', left: 0, top: 0, backgroundColor: '#fff', borderRadius: 4 }}>
            {
            modalType == 1 && (
            <Row className="p-3">

              <Col md="12">
                <FormGroup>
                <Label for="department">Tarih Aralığı</Label>
                <Flatpickr
                    className="form-control"
                    name="date"
                    placeholder="Tarih Aralığına Göre"
                    options={{
                        locale: Turkish,
                        dateFormat: 'd-m-Y',
                        mode: 'range',
                        maxDate: new Date()
                    }}
                    onChange={date => {
                        if (date.length > 1) {
                          let start = moment(date[0]).format('x') / 1000
                          let end = moment(date[1]).format('x') / 1000
                          this.setState({start, end})
                        }
                    }}
                />
                </FormGroup>                   
              </Col>  

              <Col sm="12">
                  
                  <Button.Ripple
                      color="primary"
                      onClick={() => {
                        this.setState({activeMenu: "Tarihe Göre", showModal: false}, () => {
                          this._getReports(5, this.state.start, this.state.end, this.state.tckn_match, this.state.phone_match)
                        })
                      }}
                      type="submit"
                      className="mr-1 mb-1"
                  >
                      Filtrele
                  </Button.Ripple>
                  
                  
                  <Button.Ripple
                      color="danger"
                      onClick={() => { this.setState({showModal: false}) }}
                      type="button"
                      className="mr-1 mb-1"
                  >
                      Vazgeç
                  </Button.Ripple>
                  
              </Col>                                            

            </Row> 
            )
            }       
          </div>
        )
        }

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
