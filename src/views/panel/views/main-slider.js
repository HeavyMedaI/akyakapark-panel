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

import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

let columns = []

const formSchema = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    image: Yup.array().typeError("Kapak fotoğrafı eklemeniz zorunludur!").required("Kapak fotoğrafı eklemeniz zorunludur!"),
    order_number: Yup.number().typeError(messages.invalid_number).required(messages.required_field).moreThan(-1, messages.invalid_number).integer(messages.invalid_number)       
})

const formSchemaEdit = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    order_number: Yup.number().typeError(messages.invalid_number).required(messages.required_field).moreThan(-1, messages.invalid_number).integer(messages.invalid_number)       
})


const types = [
    {value: 1, label: "Metin"},
    {value: 2, label: "Dış Bağlantı"}
]

const press_types = [
    {value: 1, label: "Bişey Yapılmasın"},
    {value: 2, label: "Uygulama İçi Sayfaya Yönlensin"},
    {value: 3, label: "İnternet Bağlantısına Gitsin"}
]

const locations = [
    {value: "News", label: "Haberler"},
    {value: "Surveys", label: "Anketler"},
    {value: "Offers", label: "Fırsatlar"},
    {value: "Events", label: "Etkinlikler"},
    {value: "NewsDetail", label: "Haber Detayı"},
    {value: "SurveyDetail", label: "Anket Detayı"},
    {value: "Notifications", label: "Bildirimler"}
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
            news: [],
            surveys: []
      }
    }

    componentDidMount() {     
        this._getResources()
        this._getList();
    }

    async _getList() {
        let c = new WebClient();
        await c.post("get-main-slider-list.json", {})
        .then(({status, message, data}) => {

            columns = [    
                {
                    name: "Resim",
                    selector: "image",
                    width: "140px",
                    cell: params => {
                      return (
                          <div style={{ width: "100%", height: "90%", backgroundColor: '#f1f1f1', backgroundImage: `url('${constants.base_img+params.image}')`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>

                          </div>
                      )
                    }
                    
                },                  
                {
                    name: "Başlık",
                    selector: "title",
                    sortable: true,
                    wrap: true
                },   
                {
                    name: "Tıklanınca",
                    selector: "when_press",
                    sortable: true,
                    width: "120px",
                    cell: params => {
                      if (params.when_press == 1) return "Birşey Yapılmasın"
                      if (params.when_press == 2) return "İç Sayfa Açılsın"
                      if (params.when_press == 3) return "İnternet Sayfası Açılsın"
                    }                    
                },  
                {
                    name: "Açılacak Hedef",
                    selector: "press_location",
                    sortable: true,
                    cell: params => {
                        if (params.press_location == "NewsDetail") return "Haber Detay"
                        if (params.press_location == "SurveyDetail") return "Anket Detay"
                        return params.press_location
                      }  
                }, 
                {
                    name: "Başlığı Göster",
                    selector: "show_title",
                    center: true,
                    width: "100px",
                    cell: params => {
                      return params.show_title == "1" ? (
                        <div className="badge badge-pill badge-light-success">
                          Evet
                        </div>
                      ) : params.show_title == "0" ? (
                        <div className="badge badge-pill badge-light-danger">
                          Hayır
                        </div>
                      ) : null
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
        c.post("delete-main-slider.json", {id: this.state.deletedItemID})
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
        c.post("clear-photo.json", {id, path, source: "ms"})
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

    _getResources() {
        
        let c = new WebClient();
        c.post("get-select-resources.json", 
            {
                news: true,
                survey: true
            })
        .then(({status, message, data}) => {
            
            if (status) {
                this.setState({news: data.news, surveys: data.surveys})
            }
        })
    }     

    render() {
        const { member } = this.props
        const { list, finished, addOrEdit, item, editing, base64, news, surveys } = this.state

        let location_id = ""

        if (item?.press_location == "NewsDetail") location_id = news.filter(x => x.value == item?.location_id)?.length > 0 ? news.filter(x => x.value == item?.location_id)[0] : ""
        if (item?.press_location == "SurveyDetail") location_id = surveys.filter(x => x.value == item?.location_id)?.length > 0 ? surveys.filter(x => x.value == item?.location_id)[0] : ""

        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom=""
                breadCrumbTitle="Ana Slider"
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
                                when_press: item?.when_press ? press_types.filter(x => x.value == item.when_press)[0] : press_types[0],
                                press_location: locations.filter(x => x.value == item?.press_location)?.length > 0 ? locations.filter(x => x.value == item?.press_location)[0] : (item?.press_location ?? ""),
                                location_id: location_id,
                                order_number: item?.order_number ?? 0,
                                status: item?.status ?? true,
                                show_title: item?.show_title ?? true
                            }}
                            validationSchema={item != null ? formSchemaEdit : formSchema}
                            onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {


                                    let c = new WebClient();
                                    c.post("add-main-slider.json", {
                                        id: item?.id ?? -1,
                                        title: values.title,
                                        when_press: values.when_press.value,
                                        press_location: values.press_location?.value ?? values.press_location,
                                        location_id: values?.location_id?.value ?? values.location_id,
                                        order_number: values.order_number,
                                        status: values.status ? 1 : 0,
                                        show_title: values.show_title ? 1 : 0,
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
                                </Col> 
                                )
                                }
                                    
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Başlık</CLabel>
                                    <Field
                                        placeholder="Başlık"
                                        name="title"
                                        value={values.title}
                                        className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                    </FormGroup>
                                </Col> 

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="EmailVertical">Tıklayınca</CLabel>
                                    <Select
                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        className={`form-control no-padding ${errors.when_press && touched.when_press && "is-invalid z-ind"}`}
                                        classNamePrefix="select"
                                        placeholder="Seçiniz..."
                                        onChange={(e) => { 
                                            setFieldValue("when_press", e)
                                            setFieldValue("press_location", "")
                                            setFieldValue("location_id", 0)
                                        }}
                                        value={values.when_press}
                                        name="when_press"
                                        options={press_types}
                                    />
                                    <IE show={Boolean(errors.when_press && touched.when_press)} message={errors.when_press} />
                                    </FormGroup>
                                </Col>    
                                
                                {
                                values.when_press?.value == 3 && (
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Açılacak Link</CLabel>
                                    <Field
                                        placeholder="Açılacak Link"
                                        name="press_location"
                                        value={values.press_location}
                                        className={`form-control ${errors.press_location && touched.press_location && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.press_location && touched.press_location)} message={errors.press_location} />
                                    </FormGroup>
                                </Col> 
                                )
                                }    

                                {
                                values.when_press?.value == 2 && (
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="EmailVertical">Açılacak Sayfa</CLabel>
                                    <Select
                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        className={`form-control no-padding ${errors.press_location && touched.press_location && "is-invalid z-ind"}`}
                                        classNamePrefix="select"
                                        placeholder="Seçiniz..."
                                        onChange={(e) => { 
                                            setFieldValue("press_location", e) 
                                            setFieldValue("location_id", 0)
                                        }}
                                        value={values.press_location}
                                        name="press_location"
                                        options={locations}
                                    />
                                    <IE show={Boolean(errors.press_location && touched.press_location)} message={errors.press_location} />
                                    </FormGroup>
                                </Col>                                      
                                )
                                }  

                                {
                                (values.when_press?.value == 2 && (values?.press_location?.value == "NewsDetail" || values?.press_location?.value == "SurveyDetail")) && (
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="EmailVertical">Detay Sayfasını Seçin</CLabel>
                                    <Select
                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        className={`form-control no-padding ${errors.location_id && touched.location_id && "is-invalid z-ind"}`}
                                        classNamePrefix="select"
                                        placeholder="Seçiniz..."
                                        onChange={(e) => { 
                                            setFieldValue("location_id", e) 
                                        }}
                                        value={values.location_id}
                                        name="location_id"
                                        options={values.press_location.value == "NewsDetail" ? news : surveys}
                                    />
                                    <IE show={Boolean(errors.location_id && touched.location_id)} message={errors.location_id} />
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

                                <Col sm="4">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Slider üzerinde başlık gösterilsin mi?</CLabel>
                                    <CToggle 
                                        name="show_title"
                                        trueLabel="Evet"
                                        falseLabel="Hayır"
                                        value={values.show_title} 
                                        onChange={() => { setFieldValue('show_title', !values.show_title) }} />
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
