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

import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss"

import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

let columns = []

const formSchema = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    order_number: Yup.number().typeError(messages.invalid_number).required(messages.required_field).moreThan(-1, messages.invalid_number).integer(messages.invalid_number)
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
      }
    }

    componentDidMount() {     
        this._getList();
    }

    async _getList() {
        let c = new WebClient();
        await c.post("get-survey-list.json", {})
        .then(({status, message, data}) => {

            columns = [    
                {
                    name: "Anket Başlığı",
                    selector: "title",
                    sortable: true,
                    wrap: true
                },   
                {
                    name: "Başlangıç Tarihi",
                    selector: "start_time",
                    width: "160px",
                    center: true,
                    sortable: true,
                    cell: params => {
                        if (params.start_time == null) return "-"
                        return moment.unix(params.start_time).format("DD.MM.YYYY HH:mm")
                    }
                },
                {
                    name: "Bitiş Tarihi",
                    selector: "end_time",
                    width: "160px",
                    center: true,
                    sortable: true,
                    cell: params => {
                        if (params.end_time == null) return "-"
                        return moment.unix(params.end_time).format("DD.MM.YYYY HH:mm")
                    }
                },                
                {
                    name: "Kayıt Tarihi",
                    selector: "create_time",
                    width: "160px",
                    center: true,
                    sortable: true,
                    cell: params => {
                        if (params.create_time == null) return "-"
                        return moment.unix(params.create_time).format("DD.MM.YYYY HH:mm")
                    }
                },
                {
                    name: "Soru(lar)",
                    selector: "question_count",
                    width: "80px",
                    center: true,
                    cell: params => {
                        return (
                        <Button
                            className="btn"
                            size="sm"
                            onClick={() => { history.push(`/survey-questions/${params.id}`) }}
                            color="primary"
                        >
                            {params.question_count}
                        </Button>          
                        )
                    }
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
                    name: "Sonuçlar",
                    selector: "id",
                    width: "120px",
                    center: true,
                    cell: params => {
                        return (
                        <Button
                            className="btn"
                            size="sm"
                            onClick={() => { history.push(`/survey-detail/${params.id}`) }}
                            color="primary"
                        >
                            Sonuçlar
                        </Button>          
                        )
                    }
                },                                       
                {
                    name: "Güncelle",
                    selector: "id",
                    sortable: true,
                    center: true,
                    width: "80px",
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
                    width: "80px",
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
        c.post("delete-survey.json", {id: this.state.deletedItemID})
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
        c.post("clear-photo.json", {id, path, source: "s"})
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
                breadCrumbTitle="Anketler"
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
                                image: null,
                                title: item?.title ?? "",
                                start_time: item?.start_time ?? "",
                                end_time: item?.end_time ?? "",
                                order_number: item?.order_number ?? 0,
                                status: item?.status ?? true
                            }}
                            validationSchema={formSchema}
                            onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                    let c = new WebClient();
                                    c.post("add-survey.json", {
                                        id: item?.id ?? -1,
                                        title: values.title,
                                        start_time: values.start_time,
                                        end_time: values.end_time,
                                        order_number: values.order_number,
                                        status: values.status ? 1 : 0,
                                        image: base64.length == 0 ? null : base64[0]
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

                                {
                                item != null && item?.image?.length > 0 && (
                                <Col sm="4">
                                    <h6>Tanımlı Kapak Fotoğrafı</h6>
                                    <img className="mb-2" src={constants.base_img + item.image} style={{ width: "100%", height: "auto" }} />
                                    <FormGroup>
                                    <Button.Ripple
                                        color="danger"
                                        type="button"
                                        onClick={() => { this._clearPhoto(item.id, item.image) }}
                                    >
                                        Resmi Sil
                                    </Button.Ripple>
                                    </FormGroup>
                                </Col> 
                                )
                                }
                                    
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Anket Başlığı</CLabel>
                                    <Field
                                        placeholder="Anket Başlığı"
                                        name="title"
                                        value={values.title}
                                        className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                    </FormGroup>
                                </Col>  
                                
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Gösterim Başlangıç ve Bitiş Tarihi</CLabel>
                                    <Flatpickr
                                        className="form-control"
                                        name="date"
                                        placeholder="Başlangıç ve Bitiş Tarihi"
                                        options={{
                                            locale: Turkish,
                                            dateFormat: 'd-m-Y',
                                            mode: 'range',
                                            minDate: 'today',
                                            defaultDate: item != null ? [new Date(values.start_time * 1000), new Date(values.end_time * 1000)] : []
                                        }}
                                        onChange={date => {
                                            if (date.length > 1) {
                                                let start = moment(date[0]).format('x') / 1000
                                                let end = moment(date[1]).format('x') / 1000
                                                setFieldValue('start_time', start)
                                                setFieldValue('end_time', end)
                                            }
                                        }}
                                    />
                                    <IE show={Boolean(errors.start_time && touched.start_time)} message={errors.start_time} />
                                    <IE show={Boolean(errors.end_time && touched.end_time)} message={errors.end_time} />
                                    </FormGroup>
                                </Col>                                                              

                                <Col sm="12">
                                    <ImageFileUpload 
                                        title="Kapak Fotoğrafı"
                                        subTitle="Kapak fotoğrafı seçmek için buraya tıklayın."
                                        error={Boolean(errors.image && touched.image)}
                                        errorMessage={errors.image}
                                        base64={base64} 
                                        disabled={base64.length >= 1 ? true : false}
                                        showError={(e) => { toast.error(e) }}
                                        showSuccess={(e) => { toast.success(e) }}
                                        onAddImage={(e) => { 
                                            let a = [...base64]
                                            a.push(e)
                                            setFieldValue("image", a)
                                            this.setState({base64: a}) 
                                        }} 
                                        onRemoveImage={(e) => {
                                            setFieldValue("image", null)
                                            this.setState({base64: []})
                                        }} 
                                    />                    
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
