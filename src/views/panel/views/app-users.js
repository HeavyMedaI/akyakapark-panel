import React from "react"
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  UncontrolledDropdown,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Collapse,
  Button
} from "reactstrap"
import axios from "axios"
import { ContextLayout } from "../../../utility/context/Layout"
import { AgGridReact } from "ag-grid-react"
import {
  Edit,
  Trash2,
  ChevronDown,
  Clipboard,
  Printer,
  Download,
  RotateCw,
  X
} from "react-feather"
import classnames from "classnames"
import { history } from "../../../history"
import "../../../assets/scss/plugins/tables/_agGridStyleOverride.scss"
import "../../../assets/scss/pages/users.scss"
import Breadcrumbs from "../../../components/@vuexy/breadCrumbs/BreadCrumb"
import { WebClient } from '../../../utility/webclient'
import DeleteAlert from './sweet-alert.js'
import { ToastContainer } from "react-toastify"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../assets/scss/plugins/extensions/toastr.scss"
import HelpForms from './help-forms/index'
import Spinner from "../../../components/@vuexy/spinner/in-page-spinner"
import { Formik, Field, Form } from "formik"
import * as Yup from "yup"
import IE from './invalid-tooltip'
import CLabel from './clabel'
import CToggle from './ctoggle'
import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss"
import Select from 'react-select'
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import DataTable from 'react-data-table-component';
import { customStyles } from './_datatable-styles'

import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

let columns = []

const formSchema = Yup.object().shape({
  title: Yup.string().required("Bu alanı boş bırakmayın"),
  message: Yup.string().required("Bu alanı boş bırakmayın"),
  target_type: Yup.string().required("Bu alanı boş bırakmayın"),
  target_url: Yup.string().test("match", "Bu alanı boş bırakmayın", function(value) {
    if (this.parent.target_type === "1" && value === undefined) {
      return false
    } else {
      return true
    }
  }),
})

class UsersList extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        finished: false,
        list: [],
        playerCount: 0,
        isGroupamaCustomer: false,
        isLastGame: false,
        platform: "all",
        gender: "all",
        send_type: "all",
        register_complete: "all",
        user_type: "all",
        status: "all",
        news: [],
        surveys: [],
        professions: [],
        hobbies: [],
        sprofessions: [],
        shobbies: [],
        age_range: [0,99],
        create_time: {
          start: 0,
          end: 0
        },
        last_login: {
          start: 0,
          end: 0
        }
      }
    }

    componentDidMount() {

        columns = [    
            {
                name: "İsim",
                selector: "firstname",
                sortable: true
            }, 
            {
                name: "Soyisim",
                selector: "lastname",
                sortable: true
            },  
            {
                name: "E-Posta",
                selector: "email",
                sortable: true
            },                  
            {
                name: "Telefon",
                selector: "phone",
                sortable: true,
                cell: params => {
                    if (params.phone !== undefined && params.phone !== null) return params.phone
                    else return "-"
                }
            },
            {
                name: "Detay",
                selector: "id",
                center: true,
                width: "120px",
                cell: params => {
                    return (
                    <Button
                        className="btn-sm"
                        onClick={() => { history.push(`/user-detail/${params.uid}`) }}
                        color="info"
                    >
                        Detay
                    </Button>          
                    )
                }
            },                  
        ]         

        this._getResources()
        this.checkFilter();
    }

    async checkFilter() {
      const { create_time, last_login, isLastGame, isGroupamaCustomer, platform, age_range, gender, sprofessions, shobbies, register_complete, user_type, status } = this.state

      let professions = sprofessions.map(e => e.value)
      let hobbies = shobbies.map(e => e.value)

      let c = new WebClient();
      await c.post("get-app-user-list.json", {
        create_time, 
        last_login, 
        platform, 
        gender,
        register_complete,
        user_type,
        status,
        age_start: age_range[0],
        age_end: age_range[1],
        professions,
        hobbies
      })
      .then(({status, message, data}) => {
          if (status) {
            this.setState({list: data})
          }
      })
    } 

    _getResources() {
        let c = new WebClient();
        c.post("get-select-resources.json", 
            {
                news: true,
                survey: true,
                profession: true,
                hobby: true
            })
        .then(({status, message, data}) => {
            
            if (status) {
                this.setState({news: data.news, surveys: data.surveys, professions: data.professions, hobbies: data.hobbies})
            }
        })
    }  

    render() {
      const { platform, create_time, last_login, playerCount, news, surveys, professions, hobbies, register_complete, user_type, status, age_range, gender, sprofessions, shobbies, list } = this.state
      return (
        <Row className="app-user-list">
          <Col sm="12">
          <Breadcrumbs
              marginBottom="mb-2"
              breadCrumbTitle="Tüm Kullanıcılar"
              breadCrumbParent="Uygulama Kullanıcıları"
              breadCrumbActive="Tüm Kullanıcılar"
          />      
          </Col>

          <Col sm="12">
          <Card>
            <CardHeader>
              <CardTitle>Filtre</CardTitle>
            </CardHeader>

              <CardBody>
                <Row>
                  <Col md="4" sm="12">
                    <FormGroup className="mb-0">
                      <Label for="verified">Platform</Label>
                      <Input
                        type="select"
                        name="platform"
                        id="platform"
                        value={this.state.platform}
                        onChange={e => {
                          this.setState({platform: e.target.value}, () => { this.checkFilter() })
                        }}
                      >
                        <option value="all">Tümü</option>
                        <option value="android">Android</option>
                        <option value="ios">iOS</option>
                      </Input>
                    </FormGroup>
                  </Col>    

                  <Col md="4" sm="12">
                      <FormGroup className="mb-0">
                      <Label for="verified" className="mb-1">Yaş Aralığı ({this.state.age_range[0]} - {this.state.age_range[1]})</Label>
                      <Range 
                        defaultValue={[0,99]} min={0} max={99} 
                        onChange={(e) => {
                          this.setState({age_range: e})
                        }}
                        onAfterChange={(e) => { 
                          this.checkFilter()
                        }}
                        value={this.state.age_range}
                      />
                      </FormGroup>
                  </Col>  

                  <Col md="4" sm="12">
                    <FormGroup className="mb-0">
                      <Label for="verified">Kayıt Durumu</Label>
                      <Input
                        type="select"
                        name="register_complete"
                        id="register_complete"
                        value={this.state.register_complete}
                        onChange={e => {
                          this.setState({register_complete: e.target.value}, () => { this.checkFilter() })
                        }}
                      >
                        <option value="all">Tümü</option>
                        <option value="1">Sadece kaydını tamamlamış kullanıcılar</option>
                        <option value="0">Sadece kaydını tamamlamamış kullanıcılar</option>
                      </Input>
                    </FormGroup>
                  </Col>        

                  <Col md="4" sm="12" className="mt-1">
                    <FormGroup className="mb-0">
                      <Label for="verified">Cinsiyet</Label>
                      <Input
                        type="select"
                        name="gender"
                        id="gender"
                        value={this.state.gender}
                        onChange={e => {
                          this.setState({gender: e.target.value}, () => { this.checkFilter() })
                        }}
                      >
                        <option value="all">Tümü</option>
                        <option value="-1">Belirtilmemiş</option>
                        <option value="Kadın">Kadın</option>
                        <option value="Erkek">Erkek</option>
                      </Input>
                    </FormGroup>
                  </Col>                                                                 
                
                  <Col md="4" sm="12" className="mt-1">
                    <FormGroup className="mb-0">
                      <Label for="department">Kayıt Tarihi</Label>
                      <Flatpickr
                          className="form-control"
                          name="date"
                          placeholder="Kayıt Tarihi"
                          options={{
                              locale: Turkish,
                              dateFormat: 'd-m-Y',
                              mode: 'range'
                          }}
                          onChange={date => {
                              if (date.length > 1) {
                                let start = moment(date[0]).format('x') / 1000
                                let end = moment(date[1]).format('x') / 1000
                                let a = this.state.create_time
                                a.start = start;
                                a.end = end;
                                this.setState({create_time: a}, () => { this.checkFilter() })
                              }
                          }}
                      />
                    </FormGroup>
                  </Col>                   

                  <Col md="4" sm="12" className="mt-1">
                    <FormGroup className="mb-0">
                      <Label for="department">Son Login Tarihi</Label>
                      <Flatpickr
                          className="form-control"
                          name="date"
                          placeholder="Son Login Tarihi"
                          options={{
                              locale: Turkish,
                              dateFormat: 'd-m-Y',
                              mode: 'range'
                          }}
                          onChange={date => {
                              if (date.length > 1) {
                                let start = moment(date[0]).format('x') / 1000
                                let end = moment(date[1]).format('x') / 1000
                                let a = this.state.last_login
                                a.start = start;
                                a.end = end;
                                this.setState({last_login: a}, () => { this.checkFilter() })
                              }
                          }}
                      />
                    </FormGroup>
                  </Col>   

                  <Col md="3" sm="12" className="mt-1">
                      <FormGroup>
                          <CLabel required for="EmailVertical">Meslek</CLabel>
                          <Select
                              menuPortalTarget={document.body}
                              styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                              className={`form-control no-padding`}
                              classNamePrefix="select"
                              placeholder="Seçiniz..."
                              isMulti={true}
                              onChange={(e) => {
                                this.setState({sprofessions: e ?? []}, () => { this.checkFilter() })
                              }}
                              value={this.state.sprofessions}
                              name="venue_id"
                              options={professions}
                          />
                      </FormGroup>
                  </Col> 

                  <Col md="3" sm="12" className="mt-1">
                      <FormGroup>
                      <CLabel required for="EmailVertical">İlgi Alanları</CLabel>
                      <Select
                          menuPortalTarget={document.body} 
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          className={`form-control no-padding`}
                          classNamePrefix="select"
                          placeholder="Seçiniz..."
                          isMulti={true}
                          onChange={(e) => {
                            this.setState({shobbies: e ?? []}, () => { this.checkFilter() })
                          }}
                          value={this.state.shobbies}
                          name="hobby"
                          options={hobbies}
                      />
                      </FormGroup>
                  </Col>

                  <Col md="3" sm="12" className="mt-1">
                      <FormGroup className="mb-0">
                          <Label for="verified">Kullanıcı Tipi</Label>
                          <Input
                              type="select"
                              name="user_type"
                              id="user_type"
                              value={this.state.user_type}
                              onChange={e => {
                                  this.setState({user_type: e.target.value}, () => { this.checkFilter() })
                              }}
                          >
                              <option value="all">Tümü</option>
                              <option value="10">Müşteriler</option>
                              <option value="20">Mağaza Kullanıcıları</option>
                          </Input>
                      </FormGroup>
                  </Col>

                  <Col md="3" sm="12" className="mt-1">
                        <FormGroup className="mb-0">
                            <Label for="verified">Durumu</Label>
                            <Input
                                type="select"
                                name="status"
                                id="status"
                                value={this.state.status}
                                onChange={e => {
                                    this.setState({status: e.target.value}, () => { this.checkFilter() })
                                }}
                            >
                                <option value="all">Tümü</option>
                                <option value="1">Aktif</option>
                                <option value="0">Deaktif</option>
                            </Input>
                        </FormGroup>
                    </Col>

                </Row>
                <Row>
                <Col md="12">
                  <p>Bu kriterlere uyan {list.length} adet kullanıcı bulundu.</p>
                </Col>  
                </Row>                 
              </CardBody>
          </Card>
        </Col>

        <Col sm="12">
            <Card>
            <CardBody>
                
                <DataTable
                columns={columns}
                title={""}
                customStyles={customStyles}
                pagination
                data={list}
                striped={true}
                noHeader={true}
                highlightOnHover
                />

            </CardBody>
            </Card>
        </Col>      

        {
        this.state.showAlert ?
        <DeleteAlert 
            message="Seçtiğiniz kayıt silinecektir. Devam etmek istiyor musunuz?"
            confirmButtonText="Evet"
            onConfirm={() => { this._delete() }} 
            onClose={() => { this.setState({showAlert: false, deletedItemID: 0}) }} />
        :
        null
        }

        </Row>
      )
    }
}

export default UsersList
