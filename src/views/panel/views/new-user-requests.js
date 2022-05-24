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
            {
                name: "Onay",
                selector: "id",
                center: true,
                width: "120px",
                cell: params => {
                    return (
                    <Button
                        className="btn-sm"
                        onClick={() => {  }}
                        color="success"
                    >
                        Onayla
                    </Button>          
                    )
                }
            }, 
            {
                name: "Reddet",
                selector: "id",
                center: true,
                width: "120px",
                cell: params => {
                    return (
                    <Button
                        className="btn-sm"
                        onClick={() => {  }}
                        color="danger"
                    >
                        Reddet
                    </Button>          
                    )
                }
            },                                          
        ]         

        this._getResources()
        this.checkFilter();
    }

    async checkFilter() {
      const { create_time, last_login, isLastGame, isGroupamaCustomer, platform, age_range, gender, sprofessions, shobbies, register_complete } = this.state

      let professions = sprofessions.map(e => e.value)
      let hobbies = shobbies.map(e => e.value)

      let c = new WebClient();
      await c.post("get-new-user-list.json", {
        create_time, 
        last_login, 
        platform, 
        gender,
        register_complete, 
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
      const { platform, create_time, last_login, playerCount, news, surveys, professions, hobbies, register_complete, age_range, gender, sprofessions, shobbies, list } = this.state
      return (
        <Row className="app-user-list">
          <Col sm="12">
          <Breadcrumbs
              marginBottom="mb-2"
              breadCrumbTitle="Kart Kullanıcı Talepleri"
              breadCrumbParent="Fırsat Kullanıcıları"
              breadCrumbActive="Tüm Kullanıcılar"
          />      
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