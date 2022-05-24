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
  Button
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
            venues: []
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

    async _getList() {
        let c = new WebClient();
        await c.post("get-event-list.json", {})
        .then(({status, message, data}) => {

            columns = [  
                {
                    name: "Resim",
                    selector: "cover_image",
                    width: "140px",
                    cell: params => {
                      return (
                          <div style={{ width: "100%", height: "90%", backgroundColor: '#f1f1f1', backgroundImage: `url('${constants.base_img+params.cover_image}')`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>

                          </div>
                      )
                    }
                    
                },                    
                {
                    name: "Tesis Adı",
                    selector: "title",
                    sortable: true,
                    wrap: true
                },   
                {
                    name: "Dış Bağlantılar",
                    selector: "link_count",
                    width: "80px",
                    center: true,
                    cell: params => {
                        return (
                        <Button
                            className="btn"
                            onClick={() => { history.push(`/event-links/${params.id}`) }}
                            color="primary"
                        >
                            {params.link_count}
                        </Button>          
                        )
                    }
                },  
                {
                    name: "Başlama Tarihi",
                    selector: "event_start_date",
                    width: "140px",
                    center: true,
                    sortable: true,
                    cell: params => {
                        return (
                            <p>{moment.unix(params.event_start_date).format('DD.MM.YYYY HH:mm')}</p>     
                        )
                    }
                },      
                {
                    name: "Bitiş Tarihi",
                    selector: "event_start_date",
                    width: "140px",
                    center: true,
                    sortable: true,
                    cell: params => {
                        return (
                            <p>{moment.unix(params.event_end_date).format('DD.MM.YYYY HH:mm')}</p>     
                        )
                    }
                },                                                                                    
                {
                    name: "Durum",
                    selector: "status",
                    center: true,
                    width: "160px",
                    cell: params => {
                        return (
                            <div style={{ width: "100%", height: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                            <div className={`badge badge-pill badge-light-${params.status == 1 ? "success" : "danger"}`}>{params.status == 1 ? "Aktif" : "Pasif"}`</div>
                            {
                            params.free_of_charge == 1 && (
                                <div className={`badge badge-pill badge-light-success`}>Ücretsiz</div>
                            )
                            }
                            {
                            params.to_everybody == 1 && (
                                <div className={`badge badge-pill badge-light-success`}>Herkes Katılabilir</div>
                            )
                            }                            
                            
                            </div>
                        )
                    }
                },                        
                {
                    name: "Güncelle",
                    selector: "id",
                    sortable: true,
                    center: true,
                    width: "120px",
                    cell: params => {
                        return (
                        <Button.Ripple
                            className="rounded-circle btn-icon"
                            onClick={() => { this.setState({addOrEdit: true, item: params}) }}
                            color="flat-success"
                        >
                            <Edit />
                        </Button.Ripple>          
                        )
                    }
                },   
                {
                    name: "Sil",
                    selector: "id",
                    sortable: true,
                    center: true,
                    width: "120px",
                    cell: params => {
                        return (
                        <Button.Ripple
                            className="rounded-circle btn-icon"
                            onClick={() => { this._deleteItem(params.id) }}
                            color="flat-danger"
                        >
                            <Trash2 />
                        </Button.Ripple>          
                        )
                    }
                },                  
            ]           

            this.setState({finished: true, addOrEdit: false, base64: [], list: data})
        })
    }    

    _deleteItem(deletedItemID) {
        this.setState({showAlert: true, deletedItemID})
    }

    _delete() {
        this.setState({showAlert: false})
        let c = new WebClient();
        c.post("delete-event.json", {id: this.state.deletedItemID})
        .then(({status, message, data}) => {
            
            if (status) {
                toast.success(message)
                this._getList();
            } else {
                toast.error(message)
            }
        })
    } 
    
    _clearPhoto(id, path) {
        let c = new WebClient();
        c.post("clear-photo.json", {id, path, source: "v"})
        .then(({status, message, data}) => {
            
            if (status) {
                toast.success(message)
                let a = this.state.item
                let b = [...this.state.list];
                let c = b.indexOf(a)
                b[c].cover_photo = null;
                a.cover_photo = null;
                this.setState({item: a, list: b})
            } else {
                toast.error(message)
            }
        })
    }     

    render() {
        const { member } = this.props
        const { list, finished, addOrEdit, item, editing, base64, event_categories, venues } = this.state

        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom="mb-2"
                breadCrumbTitle="Kullanıcı Raporları"
                breadCrumbParent="İçerik Yönetimi"
                breadCrumbActive="Haberler"
                showAddButton={false}
                showCancelButton={addOrEdit}
                onAddButtonClick={() => { this.setState({addOrEdit: true, item: null}) }}
                onCancelButtonClick={() => { this.setState({addOrEdit: false, base64: []}) }}
            />      
            </Col>
            
            <Col>
            <p>Yapım aşamasında</p>
            </Col>

            </Row>
        )
    }
}

const msp = (state) => {
    return {
        member: state.member
    }
}

export default connect(msp)(Admins)
