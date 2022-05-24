import React from "react"
import { connect } from 'react-redux'
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
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  UncontrolledDropdown,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Collapse,
  Button,
  Alert
} from "reactstrap"
import axios from "axios"
import { Link } from 'react-router-dom'
import { ContextLayout } from "../../../utility/context/Layout"
import { AgGridReact } from "ag-grid-react"
import { history } from '../../../history'
import {
  Edit,
  Trash2,
  ChevronDown,
  Clipboard,
  Printer,
  Download,
  RotateCw,
  Search,
  X
} from "react-feather"
import classnames from "classnames"
import "../../../assets/scss/plugins/tables/_agGridStyleOverride.scss"
import "../../../assets/scss/pages/users.scss"
import Breadcrumbs from "../../../components/@vuexy/breadCrumbs/BreadCrumb"
import ProgressComponent from "../../../components/@vuexy/spinner/in-page-spinner"
import { WebClient, messages, constants } from '../../../utility/webclient'
import DeleteAlert from './sweet-alert.js'
import { ToastContainer } from "react-toastify"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../assets/scss/plugins/extensions/toastr.scss"
import HelpForms from './help-forms/index'
import Spinner from "../../../components/@vuexy/spinner/in-page-spinner"
import { Formik, Field, Form } from "formik"
import IE from './invalid-tooltip'
import CToggle from './ctoggle'
import * as Yup from "yup"
import CLabel from './clabel'
import DataTable from 'react-data-table-component';
import { customStyles } from './_datatable-styles2'
import ImageFileUpload from './image-file-upload'
import SunEditor, { buttonList } from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Select from 'react-select'

import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss"

import Report1 from './stats/analytics/report-1'
import Report2 from './stats/analytics/report-2'
import Report3 from './stats/analytics/report-3'
import Report4 from './stats/analytics/report-4'
import Report5 from './stats/analytics/report-5'

import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

let defaultPosition = {
    lat: 40.992926,
    lng: 29.1230032
  };

let columns = []

const formSchema = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    category_ids: Yup.array().required("Lütfen en az 1 tane kategori seçin!"),
    venue_id: Yup.object().typeError("Lütfen etkinliğin yapılacağı tesisi seçin!").required("Lütfen etkinliğin yapılacağı tesisi seçin!"),
    image: Yup.array().typeError("Kapak fotoğrafı eklemeniz zorunludur!").required("Kapak fotoğrafı eklemeniz zorunludur!"),
    event_start_date: Yup.number().typeError("Lütfen başlangıç ve bitiş tarihini seçin!").required("Lütfen başlangıç ve bitiş tarihini seçin!"),
    event_end_date: Yup.number().typeError("Lütfen başlangıç ve bitiş tarihini seçin!").required("Lütfen başlangıç ve bitiş tarihini seçin!"),
    about: Yup.string().required(messages.required_field),
})

const formSchemaEdit = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    category_ids: Yup.array().required("Lütfen en az 1 tane kategori seçin!"),
    about: Yup.string().required(messages.required_field),
})

const types = [
    {value: 1, label: "Metin"},
    {value: 2, label: "Dış Bağlantı"}
]

let $primary = "#ee2270",
  $danger = "#EA5455",
  $warning = "#FF9F43",
  $info = "#00cfe8",
  $primary_light = "#ee2270",
  $warning_light = "#FFC085",
  $danger_light = "#f29292",
  $info_light = "#1edec5",
  $stroke_color = "#e8e8e8",
  $label_color = "#e7eef7",
  $white = "#fff"

class Admins extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
            addOrEdit: false,
            editing: false,
            finished: false,
            read: false,
            status: 0,
            message: null,
            closeModal: false,
            deleteModal: false,
            showLocationModal: false,
            item: null,
            formId: 0,
            list: [],
            base64: [],
            address: null,
            latitude: 0,
            longitude: 0,
            event_categories: [],
            venues: [],
            report_type: -1
      }
    }

    componentDidMount() {     

    }

    _getResources() {
        
        let c = new WebClient();
        c.post("get-select-resources.json", 
            {
                event_category: true,
                venue: true
            })
        .then(({status, message, data}) => {
            
            if (status) {
                this.setState({event_categories: data.event_categories, venues: data.venues})
            }
        })
    }       

    render() {
        const { member } = this.props
        const { report_type } = this.state

        return (
            <>
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom="mb-2"
                breadCrumbTitle="Raporlar"
            />      
            </Col>
            </Row>
            <Row>
                <Col sm="3">
                    <Row>
                        <Col sm="12" className="mb-2">
                            <div 
                                onClick={() => {
                                    if (report_type != 1) this.setState({report_type: 1})
                                }}
                                className={report_type == 1 ? "bg-primary" : "bg-white"} style={{ cursor: "pointer", width: "100%", height: "100%", display: "flex", borderRadius: 16, flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "1rem", boxSizing: "border-box" }}>
                                <span className={report_type == 1 ? "text-white" : "text-primary"}>Tarihe Göre</span>
                                <span className={report_type == 1 ? "text-white" : "text-primary"} style={{ fontWeight: "700", fontSize: 16 }}>Yeni Kullanıcı Kayıtları</span>
                            </div>
                        </Col>
                        <Col sm="12" className="mb-2">
                            <div 
                                onClick={() => {
                                    if (report_type != 2) this.setState({report_type: 2})
                                }}                    
                                className={report_type == 2 ? "bg-primary" : "bg-white"} style={{ cursor: "pointer", width: "100%", height: "100%", display: "flex", borderRadius: 16, flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "1rem", boxSizing: "border-box" }}>
                                <span className={report_type == 2 ? "text-white" : "text-primary"}>Tarihe Göre</span>
                                <span className={report_type == 2 ? "text-white" : "text-primary"} style={{ fontWeight: "700", fontSize: 16 }}>Uygulama Girişleri</span>
                            </div>
                        </Col>  
                        <Col sm="12" className="mb-2">
                            <div 
                                onClick={() => {
                                    if (report_type != 3) this.setState({report_type: 3})
                                }}                        
                                className={report_type == 3 ? "bg-primary" : "bg-white"} style={{ cursor: "pointer", width: "100%", height: "100%", display: "flex", borderRadius: 16, flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "1rem", boxSizing: "border-box" }}>
                                <span className={report_type == 3 ? "text-white" : "text-primary"}>Tarihe Göre</span>
                                <span className={report_type == 3 ? "text-white" : "text-primary"} style={{ fontWeight: "700", fontSize: 16 }}>Satış İşlemleri</span>
                            </div>
                        </Col> 
                        <Col sm="12" className="mb-2">
                            <div 
                                onClick={() => {
                                    if (report_type != 4) this.setState({report_type: 4})
                                }}                        
                                className={report_type == 4 ? "bg-primary" : "bg-white"} style={{ cursor: "pointer", width: "100%", height: "100%", display: "flex", borderRadius: 16, flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "1rem", boxSizing: "border-box" }}>
                                <span className={report_type == 4 ? "text-white" : "text-primary"}>Üye İşyerine Göre</span>
                                <span className={report_type == 4 ? "text-white" : "text-primary"} style={{ fontWeight: "700", fontSize: 16 }}>Satış İşlemleri</span>
                            </div>
                        </Col>  
                        <Col sm="12" className="mb-2">
                            <div 
                                onClick={() => {
                                    if (report_type != 5) this.setState({report_type: 5})
                                }}                        
                                className={report_type == 5 ? "bg-primary" : "bg-white"} style={{ cursor: "pointer", width: "100%", height: "100%", display: "flex", borderRadius: 16, flexDirection: "column", alignItems: "flex-start", justifyContent: "center", padding: "1rem", boxSizing: "border-box" }}>
                                <span className={report_type == 5 ? "text-white" : "text-primary"}>Kullanıcıya Göre</span>
                                <span className={report_type == 5 ? "text-white" : "text-primary"} style={{ fontWeight: "700", fontSize: 16 }}>Satış İşlemleri</span>
                            </div>
                        </Col>  
                    </Row>
                </Col>  
                <Col md="9">
                    <Card>
                        {
                        report_type == -1 && (
                        <CardBody>
                            <Alert color="light" className="mb-0">
                                <p>Sol taraftan almak istediğiniz raporu seçiniz.</p>
                            </Alert>
                        </CardBody>
                        )
                        }

                        {
                        report_type == 1 && (
                        <CardBody>
                            <Report1 labelColor={$label_color} primary={$primary} />
                        </CardBody>
                        )
                        }  

                        {
                        report_type == 2 && (
                        <CardBody>
                            <Report2 labelColor={$label_color} primary={$primary} />
                        </CardBody>
                        )
                        }  

                        {
                        report_type == 3 && (
                        <CardBody>
                            <Report3 labelColor={$label_color} primary={$primary} />
                        </CardBody>
                        )
                        }  

                        {
                        report_type == 4 && (
                        <CardBody>
                            <Report4 labelColor={$label_color} primary={$primary} />
                        </CardBody>
                        )
                        }  

                        {
                        report_type == 5 && (
                        <CardBody>
                            <Report5 labelColor={$label_color} primary={$primary} />
                        </CardBody>
                        )
                        }                                                                                                                        
                    </Card>
                </Col>
            </Row>
            </>            
        )
    }
}

const msp = (state) => {
    return {
        member: state.member
    }
}

export default connect(msp)(Admins)
