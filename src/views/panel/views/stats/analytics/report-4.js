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
  Alert,
  Table
} from "reactstrap"
import Chart from "react-apexcharts"
import { ChevronsRight, ChevronDown } from "react-feather"
import { WebClient, constants } from '../../../../../utility/webclient'
import Spinner from "../../../../../components/@vuexy/spinner/in-page-spinner"
import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import CLabel from '../../clabel'
import Select from 'react-select'
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
      companies: [],
      selected_company: null,
      list: []  
    }
  }

  componentDidMount() {
    // this._getReports(0, 0, 0, 0)
    this._getResources()
  }

  _getResources() {
    let c = new WebClient();
    c.post("get-select-resources.json", 
        {
            company: true
        })
    .then(({status, message, data}) => {
        if (status) {
            this.setState({ companies: data.companies, loading: false })
        }
    })
}    

  async _getReports() {
    this.setState({loading: true})
    console.log({start: this.state.start, end: this.state.end, company_id: this.state.selected_company?.value ?? 0})
    let c = new WebClient();
    await c.post("report-4.json", {start: this.state.start, end: this.state.end, company_id: this.state.selected_company?.value ?? 0})
    .then(({status, message, data}) => {
        console.log(data)
      if (status) {
        this.setState({list: data})
      }
      this.setState({loading: false})
    }).catch((e) => {
        this.setState({series: [{data: []}], loading: false})
    })
  }

  async _exportReports(start, end, selected_company) {
    this.setState({export_loading: true})
    let c = new WebClient();
    await c.post("v2/exportDailyInstallReports", {start, end, company_id: selected_company})
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
    const { loading, companies, list } = this.state
    return (
        <Row className="pb-50">
        <Col md="12">
            <Col md="12">
            <Row>
                <Col md="6">
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
                            this._getReports()
                            })
                        }
                    }}
                />
                </FormGroup>                   
                </Col>

                <Col sm="6">
                      <FormGroup>
                      <CLabel required for="EmailVertical">Üye İşyeri</CLabel>
                      <Select
                          menuPortalTarget={document.body} 
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          className={`form-control no-padding`}
                          classNamePrefix="select"
                          placeholder="Seçiniz..."
                          onChange={(e) => {
                                this.setState({selected_company: e}, () => {
                                    this._getReports()
                                })
                          }}
                          value={this.state.selected_company}
                          name="company"
                          options={companies}
                      />
                      </FormGroup>
                  </Col>

            </Row>
            </Col>           
        </Col>
        <Col sm="12">
            {
            loading ?
            <Spinner />
            :
            (
            list.length > 0 ?
            <Table responsive striped>
                <thead>
                    <tr>
                        <th>Kampanya</th>
                        <th>Tarih</th>
                        <th>Tutar</th>
                        <th>İndirim Tutarı</th>
                    </tr>
                </thead>
                <tbody>
                    {
                    list.map((e, index) => {
                        return (
                        <tr key={index}>
                            <td>{e.title}</td>
                            <td>{moment.unix(e.result_time).format("DD.MM.YYYY HH:mm:ss")}</td>
                            <td>{e.amount} TL</td>
                            <td>{e.amount - e.after_discount} TL</td>
                        </tr>
                        )
                    })
                    }
                </tbody>
            </Table>        
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
