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
    news_type: Yup.object().required(messages.required_field),
    image: Yup.array().typeError("Kapak fotoğrafı eklemeniz zorunludur!").required("Kapak fotoğrafı eklemeniz zorunludur!"),
    content: Yup.string()
    .test("match2", "Lütfen haber içeriği ekleyin!", function(value) {
        if (this.parent.news_type.value == 1) {

            if (value == undefined || value == null || value?.length == 0) return false
            else return true

        } else {
            return true
        }
    }),
    external_link: Yup.string()
    .test("match", messages.required_field, function(value) {
        if (this.parent.news_type.value == 2) {

            if (value == undefined || value == null || value?.length == 0) return false
            else return true

        } else {
            return true
        }
    }),
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
        await c.post("get-news-list.json", {})
        .then(({status, message, data}) => {

            columns = [    
                {
                    name: "Haber Başlığı",
                    selector: "title",
                    sortable: true,
                    wrap: true
                },   
                {
                    name: "Haber Tipi",
                    selector: "news_type",
                    sortable: true,
                    center: true,
                    width: "120px",
                    cell: params => {
                      return params.news_type == 1 ? (
                        "Metin"
                      ) : params.news_type == 2 ? (
                        "Dış Bağlantı"
                      ) : null
                    }
                },   
                {
                    name: "Kayıt Tarihi",
                    selector: "create_time",
                    width: "180px",
                    center: true,
                    sortable: true,
                    cell: params => {
                        if (params.create_time == null) return "-"
                        return moment.unix(params.create_time).format("DD.MM.YYYY HH:mm")
                    }
                },
                {
                    name: "Resim(ler)",
                    selector: "image_count",
                    width: "80px",
                    center: true,
                    cell: params => {
                        if (params.news_type == 2) return "-"
                        return (
                        <Button
                            className="btn"
                            onClick={() => { history.push(`/news-images/${params.id}`) }}
                            color="primary"
                        >
                            {params.image_count}
                        </Button>          
                        )
                    }
                }, 
                {
                    name: "Ekstra Link",
                    selector: "link_count",
                    width: "80px",
                    center: true,
                    cell: params => {
                        if (params.news_type == 2) return "-"
                        return (
                        <Button
                            className="btn"
                            onClick={() => { history.push(`/news-links/${params.id}`) }}
                            color="success"
                        >
                            {params.link_count}
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
        c.post("delete-news.json", {id: this.state.deletedItemID})
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
                breadCrumbTitle="Haberler"
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
                                content: item?.content ?? "",
                                external_link: item?.external_link ?? "",
                                status: item?.status ?? true,
                                news_type: item?.news_type ? types.filter(x => x.value == item.news_type)[0] : types[0],
                            }}
                            validationSchema={formSchema}
                            onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                    let c = new WebClient();
                                    c.post("add-news.json", {
                                        id: item?.id ?? -1,
                                        title: values.title,
                                        content: values.content,
                                        external_link: values.external_link,
                                        news_type: values.news_type.value,
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
                                item != null && item?.cover_photo?.length > 0 && (
                                <Col sm="4">
                                    <h6>Tanımlı Kapak Fotoğrafı</h6>
                                    <img className="mb-2" src={constants.base_img + item.cover_photo} style={{ width: "100%", height: "auto" }} />
                                </Col> 
                                )
                                }
                                    
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Haber Başlığı</CLabel>
                                    <Field
                                        placeholder="Haber Başlığı"
                                        name="title"
                                        value={values.title}
                                        className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                    </FormGroup>
                                </Col> 

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="EmailVertical">Haber Tipi</CLabel>
                                    <Select
                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        className={`form-control no-padding ${errors.news_type && touched.news_type && "is-invalid z-ind"}`}
                                        classNamePrefix="select"
                                        placeholder="Seçiniz..."
                                        onChange={(e) => { 
                                            setFieldValue("news_type", e) 
                                        }}
                                        value={values.news_type}
                                        name="news_type"
                                        options={types}
                                    />
                                    <IE show={Boolean(errors.news_type && touched.news_type)} message={errors.news_type} />
                                    </FormGroup>
                                </Col>    

                                {
                                values.news_type.value == 1 && (
                                <Col sm="12" className="mb-2">
                                    <CLabel required for="nameVertical">Haber İçeriği</CLabel>
                                    <SunEditor 
                                        name="content"
                                        setOptions={{
                                            height: 160,
                                            buttonList: [
                                                // default
                                                ['undo', 'redo'],
                                                ['font', 'fontSize', 'formatBlock', 'paragraphStyle', 'blockquote'],
                                                ['bold', 'underline', 'italic', 'strike', 'subscript', 'superscript'],
                                                ['fontColor', 'hiliteColor', 'textStyle'],
                                                ['removeFormat'],
                                                ['outdent', 'indent'],
                                                ['align', 'horizontalRule', 'list', 'lineHeight']
                                            ],
                                            font: ['Nunito']
                                        }} 
                                        setContents={values.content}
                                        onChange={(e) => { setFieldValue("content", e) }}
                                    />

                                    {
                                    Boolean(touched.content && errors.content) && (
                                    <p className="mt-1" style={{ color: 'red', fontSize: 12 }}>{errors.content}</p>
                                    )
                                    }

                                </Col> 
                                )
                                }
                                
                                {
                                values.news_type.value == 2 && (
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Açılacak Link</CLabel>
                                    <Field
                                        placeholder="Açılacak Link"
                                        name="external_link"
                                        value={values.external_link}
                                        className={`form-control ${errors.external_link && touched.external_link && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.external_link && touched.external_link)} message={errors.external_link} />
                                    </FormGroup>
                                </Col> 
                                )
                                }                                                                     

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
