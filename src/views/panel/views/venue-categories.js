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
import { customStyles } from './_datatable-styles'
import ImageFileUpload from './image-file-upload'
import SunEditor, { buttonList } from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';
import Select from 'react-select'

import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

let columns = []

const formSchema = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    icon_name: Yup.string().required(messages.required_field)
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
            item: null,
            formId: 0,
            list: [],
            base64: [],
            venues: [],
            event_categories: []
      }
    }

    componentDidMount() {     
        this._getList();
    } 

    async _getList() {
        let c = new WebClient();
        await c.post("get-venue-category-list.json", {})
        .then(({status, message, data}) => {

            columns = [    
                {
                    name: "Başlık",
                    selector: "title",
                    sortable: true,
                    wrap: true
                },   
                {
                    name: "Sıra Numarası",
                    selector: "order_number",
                    sortable: true,
                    wrap: true
                },                                                                              
                {
                    name: "Durum",
                    selector: "status",
                    sortable: true,
                    center: true,
                    width: "120px",
                    cell: params => {
                      return params.status == "1" ? (
                        <div className="badge badge-pill badge-light-success">
                          Aktif
                        </div>
                      ) : params.status == "0" ? (
                        <div className="badge badge-pill badge-light-danger">
                          Pasif
                        </div>
                      ) : null
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
        c.post("delete-venue-category.json", {id: this.state.deletedItemID})
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
        c.post("clear-photo.json", {id, path, source: "n"})
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
        const { list, finished, addOrEdit, item, editing, base64 } = this.state

        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom=""
                breadCrumbTitle="Tesis Kategorileri"
                breadCrumbParent="İçerik Yönetimi"
                breadCrumbActive="Haberler"
                showAddButton={!addOrEdit}
                showCancelButton={addOrEdit}
                onAddButtonClick={() => { this.setState({addOrEdit: true, item: null}) }}
                onCancelButtonClick={() => { this.setState({addOrEdit: false, base64: []}) }}
            />      
            </Col>

                {
                addOrEdit ?
                <Col lg="12" md="12">
                    <Card>
                        <CardBody>
                        <Formik
                            initialValues={{
                                title: item?.title ?? "",
                                icon_name: item?.icon_name ?? "",
                                order_number: item?.order_number ?? 0,
                                color_code: item?.color_code ?? "",
                                status: item?.status ?? true,
                            }}
                            validationSchema={formSchema}
                            onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                    let c = new WebClient();
                                    c.post("add-venue-category.json", {
                                        id: item?.id ?? -1,
                                        title: values.title,
                                        icon_name: values.icon_name,
                                        order_number: values.order_number,
                                        color_code: values.color_code,
                                        status: values.status ? 1 : 0
                                    })
                                    .then(({status, message, data}) => {

                                        if (status) {
                                            toast.success(message)
                                            this._getList();
                                        } else {
                                            toast.error(message)
                                        }

                                        setSubmitting(false)
                                        // this.setState({discounts: []})
                    
                                    })
                                    .catch((error) => {
                                        setSubmitting(false)
                                        toast.error("Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyerek tekrar deneyin")
                                    })
                            
                            }}
                        >
                            {({ errors, touched, values, isSubmitting, handleChange, handleBlur, setFieldValue }) => (
                            <Form noValidate={true} autoComplete="off">
                                <Row>  
                                    
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Kategori Adı</CLabel>
                                    <Field
                                        placeholder="Kategori Adı"
                                        name="title"
                                        value={values.title}
                                        className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                    </FormGroup>
                                </Col>        

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">İkon Adı</CLabel>
                                    <Field
                                        placeholder="İkon Adı"
                                        name="icon_name"
                                        value={values.icon_name}
                                        className={`form-control ${errors.icon_name && touched.icon_name && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.icon_name && touched.icon_name)} message={errors.icon_name} />
                                    </FormGroup>
                                </Col>  

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Renk</CLabel>
                                    <Field
                                        placeholder="Renk"
                                        name="color_code"
                                        value={values.color_code}
                                        className={`form-control ${errors.color_code && touched.color_code && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.color_code && touched.color_code)} message={errors.color_code} />
                                    </FormGroup>
                                </Col>                                  

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Sıra Numarası</CLabel>
                                    <Field
                                        placeholder="Sıra Numarası"
                                        name="order_number"
                                        value={values.order_number}
                                        className={`form-control ${errors.order_number && touched.order_number && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.order_number && touched.order_number)} message={errors.order_number} />
                                    </FormGroup>
                                </Col>                                                                                                                               

                                <Col sm="4">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Durum</CLabel>
                                    <CToggle 
                                        name="status"
                                        trueLabel="Aktif"
                                        falseLabel="Pasif"
                                        value={values.status} 
                                        onChange={() => { setFieldValue('status', !values.status) }} />
                                    </FormGroup>
                                </Col>                                                                                                                                     

                                <Col sm="12">
                                    <FormGroup>
                                    <Button.Ripple
                                        disabled={isSubmitting}
                                        color="primary"
                                        type="submit"
                                        className="mr-1 mb-1"
                                    >
                                        Kaydet
                                    </Button.Ripple>
                                    </FormGroup>
                                </Col>

                                </Row>
                            </Form>
                            )}
                        </Formik>
                        </CardBody>
                    </Card>
                </Col>            
                :
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
                }

            {
            this.state.showAlert && (
            <DeleteAlert 
                message="Seçtiğiniz kayıt silinecektir. Devam etmek istiyor musunuz?"
                confirmButtonText="Evet"
                onConfirm={() => { this._delete() }} 
                onClose={() => { this.setState({showAlert: false, deletedItemID: 0}) }} />
            )
            }

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
