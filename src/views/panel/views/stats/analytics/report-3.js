import React from "react"
import {
  Card,
  CardBody,
  Row,
  Col,
  FormGroup,
  Label,
  Input,
  Button,
  UncontrolledDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Progress,
  Alert
} from "reactstrap"
import Chart from "react-apexcharts"
import { ChevronsRight, ChevronDown } from "react-feather"
import { WebClient, constants } from '../../../../../utility/webclient'
import Spinner from "../../../../../components/@vuexy/spinner/in-page-spinner"
import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import "flatpickr/dist/themes/light.css";
import "../../../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss"
import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

class AvgSessions extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: true,
      start: 0,
      end: 0,
      phone_match: 0,
      tckn_match: 0,
      export_loading: false,
      options: {
        chart: {
          toolbar: { show: false },
          type: 'line'
        },
        xaxis: {
          categories: []
        }
      },
      series: [
        {
          name: "series-1",
          data: []
        }
      ]      
    }
  }

  componentDidMount() {
    this._getReports(0, 0, 0, 0)
  }

  async _getReports(start, end, phone_match, tckn_match) {
    this.setState({loading: true})
    let c = new WebClient();
    await c.post("report-3.json", {start, end, phone_match, tckn_match})
    .then(({status, message, data}) => {
      if (status) {
        let a = {
          chart: {
            toolbar: { show: false },
            type: 'line',
            zoom: {
              enabled: false
            }
          },
          stroke: {
            curve: 'straight'
          },
          xaxis: {
            categories: data.categories
          },
          yaxis: {
            labels: {
              formatter: function(value) {
                return parseInt(value)
              }
            }
          }
        }
  
        let b = [
          {
            name: "Giriş Sayısı",
            data: data.series
          }
        ]
  
        this.setState({options: a, series: b})        
      } else {
        this.setState({series: [{data: []}]})  
      }
      this.setState({loading: false})
    }).catch((e) => {
        this.setState({series: [{data: []}], loading: false})
    })
  }

  async _exportReports(start, end, phone_match, tckn_match) {
    this.setState({export_loading: true})
    let c = new WebClient();
    await c.post("v2/exportDailyInstallReports", {start, end, phone_match, tckn_match})
    .then(({success, message, data}) => {
      if (success) {
        const link = document.createElement('a');
        link.href = constants.base + "excl/" + data + ".xlsx"
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        this._deleteCreatedFile(data)     
      }
      this.setState({export_loading: false})
    })
  }

  _deleteCreatedFile(fn) {
      setTimeout(() => {
          let c = new WebClient();
          c.post("v1/deleteCreatedFile", {fn})
      }, 1000)
  }   

  render() {
    const { loading } = this.state
    return (
        <Row className="pb-50">
        <Col md="12">
            <Col md="12">
            <Row>
                <Col md="12">
                <FormGroup className="mb-0">
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
                            this.setState({start, end}, () => {
                            this._getReports(start, end, this.state.phone_match, this.state.tckn_match)
                            })
                        }
                    }}
                />
                </FormGroup>                   
                </Col>

                {/* <Col md="3">
                <FormGroup className="mb-0">
                    <Label for="verified">T.C.Kimlik Numarası</Label>
                    <Input
                        type="select"
                        name="tckn"
                        id="tckn"
                        value={this.state.tckn_match}
                        onChange={e => {
                        this.setState(
                            {
                            tckn_match: e.target.value
                            },
                            () => {
                                this._getReports(this.state.start, this.state.end, this.state.phone_match, this.state.tckn_match)
                            })
                        }}
                    >
                        <option value="0">Tümü</option>
                        <option value="1">T.C.Kimlik Numarası Eşleşenler</option>
                        <option value="2">T.C.Kimlik Numarası Eşleşmeyenler</option>
                    </Input>
                    </FormGroup>                    
                </Col>                    

                <Col md="3">
                <FormGroup className="mb-0">
                    <Label for="verified">Telefon Numarası</Label>
                    <Input
                        type="select"
                        name="status"
                        id="status"
                        value={this.state.phone_match}
                        onChange={e => {
                        this.setState(
                            {
                            phone_match: e.target.value
                            },
                            () => {
                                this._getReports(this.state.start, this.state.end, this.state.phone_match, this.state.tckn_match)
                            })
                        }}
                    >
                        <option value="0">Tümü</option>
                        <option value="1">Telefon Numarası Eşleşenler</option>
                        <option value="2">Telefon Numarası Eşleşmeyenler</option>
                    </Input>
                    </FormGroup>                 
                </Col>  

                <Col lg="2" md="2" sm="12">
                <FormGroup>
                <Button
                    onClick={() => { this._exportReports(this.state.start, this.state.end, this.state.phone_match, this.state.tckn_match) }}
                    disabled={Boolean(this.state.series[0].data.length == 0) || this.state.export_loading}
                    color="success"
                    type="button"
                    style={{ marginTop: '1.3rem', width: "100%" }}
                >
                    {
                    this.state.export_loading ?
                    "Aktarılıyor.."
                    :
                    "Excele Aktar"
                    }
                    
                </Button>
                </FormGroup>
                </Col>                                                    */}

            </Row>
            </Col>           
        </Col>
        <Col sm="12">
            {
            loading ?
            <Spinner />
            :
            (
            this.state.series[0].data.length > 0 ?
            <Chart
                options={this.state.options}
                series={this.state.series}
                height={400}
            />                
            :
            <Row>
                <Col sm="12" className="p-2">
                <Alert color="warning">Kriterlere uygun kayıt bulunamadı!</Alert>
                </Col>
            </Row>
            )
            }          
        </Col>
        </Row>
    )
  }
}
export default AvgSessions
