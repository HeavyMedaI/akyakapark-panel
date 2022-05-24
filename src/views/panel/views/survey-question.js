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
import { history } from '../../../history'
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
    order_number: Yup.number().typeError(messages.invalid_number).required(messages.required_field).moreThan(-1, messages.invalid_number).integer(messages.invalid_number)
})

const formSchemaEdit = Yup.object().shape({
    alt_text: Yup.string().required(messages.required_field),
    order_number: Yup.number().typeError(messages.invalid_number).required(messages.required_field).moreThan(-1, messages.invalid_number).integer(messages.invalid_number)
})

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
            nid: -1
      }
    }

    componentDidMount() {     
        let nid = this.props.match?.params?.news_id ?? -1
        this.setState({nid}, () => {
            this._getList();
        })
    }

    async _getList() {
        let nid = this.state.nid
        let c = new WebClient();
        await c.post("get-survey-question-list.json", {nid})
        .then(({status, message, data}) => {

            columns = [    
                {
                    name: "Soru",
                    selector: "title",
                    sortable: true,
                    wrap: true
                },   
                {
                    name: "Seçenek(ler)",
                    selector: "option_count",
                    width: "80px",
                    center: true,
                    cell: params => {
                        return (
                        <Button
                            className="btn"
                            onClick={() => { history.push(`/survey-options/${params.id}`) }}
                            color="primary"
                        >
                            {params.option_count}
                        </Button>          
                        )
                    }
                }, 
                {
                    name: "Sıra Numarası",
                    selector: "order_number",
                    width: "80px",
                    center: true
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
        c.post("delete-survey-question.json", {id: this.state.deletedItemID})
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
        c.post("clear-photo.json", {id, path, source: "sq"})
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
        const { list, finished, addOrEdit, item, editing, base64, nid } = this.state

        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom=""
                showBackButton={true}
                breadCrumbTitle="Anket Soruları"
                breadCrumbParent="İçerik Yönetimi"
                breadCrumbActive="Haberler"
                showAddButton={nid == -1 ? false : !addOrEdit}
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
                                order_number: item?.order_number ?? 0,
                                allow_empty: item?.allow_empty ?? false,
                                show_image: item?.show_image ?? false,
                                status: item?.status ?? true
                            }}
                            validationSchema={formSchema}
                            onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                    let c = new WebClient();
                                    c.post("add-survey-question.json", {
                                        id: item?.id ?? -1,
                                        survey_id: nid,
                                        title: values.title,
                                        order_number: values.order_number,
                                        allow_empty: values.allow_empty ? 1 : 0,
                                        show_image: values.show_image ? 1 : 0,
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
                                <Col sm="3">
                                    <h6>Tanımlı Resim</h6>
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
                                    <CLabel required for="nameVertical">Soru</CLabel>
                                    <Field
                                        placeholder="Soru"
                                        name="title"
                                        value={values.title}
                                        className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                    </FormGroup>
                                </Col>      

                                <Col sm="4">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Resim Gösterilsin</CLabel>
                                    <CToggle 
                                        name="show_image"
                                        trueLabel="Evet"
                                        falseLabel="Hayır"
                                        value={values.show_image} 
                                        onChange={() => { setFieldValue('show_image', !values.show_image) }} />
                                    </FormGroup>
                                </Col>                                                                                              

                                {
                                values.show_image && (
                                <Col sm="12">
                                    <ImageFileUpload 
                                        title="Resim"
                                        subTitle="Resim seçmek için buraya tıklayın."
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
                                )
                                }   

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
                                    <CLabel required for="nameVertical">Boş cevapları kabul et</CLabel>
                                    <CToggle 
                                        name="allow_empty"
                                        trueLabel="Evet"
                                        falseLabel="Hayır"
                                        value={values.allow_empty} 
                                        onChange={() => { setFieldValue('allow_empty', !values.allow_empty) }} />
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
