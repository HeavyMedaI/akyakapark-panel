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
  ArrowRight,
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

import LocationPicker from 'react-location-picker';

import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

let defaultPosition = {
    lat: 38.0749946,
    lng: 32.3553062
};

let columns = []

const formSchema = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    category_id: Yup.object().typeError(messages.required_select).required(messages.required_select),
    tax_number: Yup.string().required(messages.required_field),
    tax_adm: Yup.string().required(messages.required_field),
    city_id: Yup.object().typeError(messages.required_select).required(messages.required_select),
    district_id: Yup.object().typeError(messages.required_select).required(messages.required_select),
    address: Yup.string().required(messages.required_field),
    phone: Yup.string().required(messages.required_field)
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
            showDetail: false,
            showReject: false,
            showLocationModal: false,
            detail: null,
            item: null,
            formId: 0,
            list: [],
            base64: [],
            categories: [],
            cities: [],
            districts: []
      }
    }

    componentDidMount() {     
        this._getResources();
        this._getList();
    }

    _getResources() {
        
        let c = new WebClient();
        c.post("get-select-resources.json", 
            {
                campaign_category: true,
                city: true
            })
        .then(({status, message, data}) => {
            
            if (status) {
                this.setState({categories: data.campaign_categories, cities: data.cities})
            }
        })
    }  
    
    _getDistricts(city_id, district_id = null) {
        
        let c = new WebClient();
        c.post("get-select-resources.json", 
            {
                district: true,
                city_id
            })
        .then(({status, message, data}) => {
            
            if (status) {
                this.setState({districts: data.districts})

                if (district_id != null) {
                    this.formik.setFieldValue("district_id", data.districts.filter(x => x.value == district_id)[0])
                }

            }
        })
    }      

    async _getList() {
        let c = new WebClient();
        await c.post("get-company-list.json", {})
        .then(({status, message, data}) => {

            columns = [    
                {
                    name: "Ünvan",
                    selector: "title",
                    sortable: true,
                    wrap: true
                },                              
                {
                    name: "İl/İlçe",
                    selector: "title",
                    width: "180px",
                    center: true,
                    cell: params => {
                        return (
                            `${params.city_name}/${params.district_name}`
                        )
                    }
                },                   
                {
                    name: "Yöneticiler",
                    selector: "account_count",
                    width: "90px",
                    center: true,
                    cell: params => {
                        return (
                        <Button
                            className="btn"
                            onClick={() => { history.push(`/company-users/${params.id}`) }}
                            color="success"
                        >
                            {params?.account_count ?? 0}
                        </Button>          
                        )
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
                            onClick={() => { this.setState({addOrEdit: true, item: params}, () => { this._getDistricts(params.city_id, params.district_id) }) }}
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

    _reject(deletedItemID) {
        this.setState({showReject: true, deletedItemID})
    }    

    _delete() {
        this.setState({showAlert: false, showDetail: false, detail: null})
        let c = new WebClient();
        c.post("delete-company.json", {id: this.state.deletedItemID})
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
        const { list, finished, addOrEdit, item, editing, base64, showDetail, detail, categories, cities, districts, showLocationModal } = this.state

        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom="mb-2"
                breadCrumbTitle="Üye İşyerleri"
                breadCrumbParent="İçerik Yönetimi"
                breadCrumbActive="Haberler"
                addButtonText="Yeni Üye İşyeri Ekle"
                showAddButton={!addOrEdit}
                showCancelButton={showDetail}
                onAddButtonClick={() => { this.setState({addOrEdit: true, item: null}) }}
                onCancelButtonClick={() => { this.setState({showDetail: false, detail: null}) }}
            />      
            </Col>


            {
                addOrEdit ?
                <Col lg="12" md="12">
                    <Card>
                        <CardBody>
                        <Formik
                            innerRef={(e) => { this.formik = e }}
                            initialValues={{
                                image: null,
                                title: item?.title ?? "",
                                about: item?.about ?? "",
                                latitude: item?.latitude ?? "",
                                longitude: item?.longitude ?? "",
                                phone: item?.phone ?? "",
                                address: item?.address ?? "",
                                status: item?.status ?? true,
                                category_id: categories.filter(x => x.value == item?.category_id)?.length > 0 ? categories.filter(x => x.value == item?.category_id)[0] : "",
                                city_id: cities.filter(x => x.value == item?.city_id)?.length > 0 ? cities.filter(x => x.value == item?.city_id)[0] : "",
                                district_id: districts.filter(x => x.value == item?.district_id)?.length > 0 ? districts.filter(x => x.value == item?.district_id)[0] : "",
                                tax_number: item?.tax_number ?? "",
                                tax_adm: item?.tax_adm ?? ""
                            }}
                            validationSchema={formSchema}
                            onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                    let c = new WebClient();
                                    c.post("add-company.json", {
                                        id: item?.id ?? -1,
                                        title: values.title,
                                        about: values.about,
                                        latitude: values.latitude,
                                        longitude: values.longitude,
                                        phone: values.phone,
                                        address: values.address,
                                        city_id: values.city_id.value,
                                        district_id: values.district_id.value,
                                        address: values.address,
                                        tax_number: values.tax_number,
                                        tax_adm: values.tax_adm,
                                        category_id: values.category_id.value,
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
                                item != null && item?.cover_image?.length > 0 && (
                                <Col sm="4">
                                    <h6>Tanımlı Kapak Fotoğrafı</h6>
                                    <img className="mb-2" src={constants.base_img + item.cover_image} style={{ width: "100%", height: "auto" }} />
                                </Col> 
                                )
                                }
                                    
                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Şirket Ünvanı</CLabel>
                                    <Field
                                        placeholder="Şirket Ünvanı"
                                        name="title"
                                        value={values.title}
                                        className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                    </FormGroup>
                                </Col> 

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="EmailVertical">Sektör</CLabel>
                                    <Select
                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        className={`form-control no-padding ${errors.category_id && touched.category_id && "is-invalid z-ind"}`}
                                        classNamePrefix="select"
                                        placeholder="Seçiniz..."
                                        onChange={(e) => { 
                                            setFieldValue("category_id", e)
                                        }}
                                        value={values.category_id}
                                        name="category_id"
                                        options={categories}
                                    />
                                    <IE show={Boolean(errors.category_id && touched.category_id)} message={errors.category_id} />
                                    </FormGroup>
                                </Col>       
                                
                                <Col sm="6">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Vergi Numarası</CLabel>
                                    <Field
                                        placeholder="Vergi Numarası"
                                        name="tax_number"
                                        value={values.tax_number}
                                        className={`form-control ${errors.tax_number && touched.tax_number && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.tax_number && touched.tax_number)} message={errors.tax_number} />
                                    </FormGroup>
                                </Col>   

                                <Col sm="6">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Vergi Dairesi</CLabel>
                                    <Field
                                        placeholder="Vergi Dairesi"
                                        name="tax_adm"
                                        value={values.tax_adm}
                                        className={`form-control ${errors.tax_adm && touched.tax_adm && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.tax_adm && touched.tax_adm)} message={errors.tax_adm} />
                                    </FormGroup>
                                </Col>    

                                <Col sm="6">
                                    <FormGroup>
                                    <CLabel required for="EmailVertical">Şehir</CLabel>
                                    <Select
                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        className={`form-control no-padding ${errors.city_id && touched.city_id && "is-invalid z-ind"}`}
                                        classNamePrefix="select"
                                        placeholder="Seçiniz..."
                                        onChange={(e) => { 
                                            setFieldValue("city_id", e)
                                            setFieldValue("district_id", "")
                                            this._getDistricts(e.value)
                                        }}
                                        value={values.city_id}
                                        name="city_id"
                                        options={cities}
                                    />
                                    <IE show={Boolean(errors.city_id && touched.city_id)} message={errors.city_id} />
                                    </FormGroup>
                                </Col>   

                                <Col sm="6">
                                <FormGroup>
                                    <CLabel required for="EmailVertical">İlçe</CLabel>
                                    <Select
                                        menuPortalTarget={document.body} 
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        className={`form-control no-padding ${errors.district_id && touched.district_id && "is-invalid z-ind"}`}
                                        classNamePrefix="select"
                                        placeholder="Seçiniz..."
                                        onChange={(e) => { 
                                            setFieldValue("district_id", e)
                                        }}
                                        value={values.district_id}
                                        name="district_id"
                                        options={districts}
                                    />
                                    <IE show={Boolean(errors.district_id && touched.district_id)} message={errors.district_id} />
                                    </FormGroup>
                                </Col>       

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Adres</CLabel>
                                    <Field
                                        placeholder="Adres"
                                        name="address"
                                        component="textarea"
                                        value={values.address}
                                        className={`form-control ${errors.address && touched.address && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.address && touched.address)} message={errors.address} />
                                    </FormGroup>
                                </Col>     

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">İletişim Numarası</CLabel>
                                    <Field
                                        placeholder="İletişim Numarası"
                                        name="phone"
                                        value={values.phone}
                                        className={`form-control ${errors.phone && touched.phone && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.phone && touched.phone)} message={errors.phone} />
                                    </FormGroup>
                                </Col>                                                                                                                                                   

                                <Col sm="4">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Lokasyon (Enlem)</CLabel>
                                    <Field
                                        placeholder="Lokasyon (Enlem)"
                                        name="latitude"
                                        value={values.latitude}
                                        className={`form-control ${errors.latitude && touched.latitude && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.latitude && touched.latitude)} message={errors.latitude} />
                                    </FormGroup>
                                </Col>   

                                <Col sm="4">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Lokasyon (Boylam)</CLabel>
                                    <Field
                                        placeholder="Lokasyon (Boylam)"
                                        name="longitude"
                                        value={values.longitude}
                                        className={`form-control ${errors.longitude && touched.longitude && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.longitude && touched.longitude)} message={errors.longitude} />
                                    </FormGroup>
                                </Col>                                    

                                <Col sm="4">
                                    <FormGroup>
                                    <Button.Ripple
                                        onClick={() => { this.setState({showLocationModal: true}) }}
                                        color="primary"
                                        style={{ marginTop: "1.3rem" }}
                                        className="mr-1 mb-1"
                                    >
                                        Haritada İşaretle
                                    </Button.Ripple>
                                    </FormGroup>
                                </Col>                                                                                          
   
                                <Col sm="12" className="mb-2">
                                    <CLabel required for="nameVertical">Hakkında</CLabel>
                                    <SunEditor 
                                        name="about"
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
                                        setContents={values.about}
                                        onChange={(e) => { setFieldValue("about", e) }}
                                    />

                                    {
                                    Boolean(touched.about && errors.about) && (
                                    <p className="mt-1" style={{ color: 'red', fontSize: 12 }}>{errors.about}</p>
                                    )
                                    }

                                </Col>                                                                 

                                <Col sm="12">
                                    <ImageFileUpload 
                                        title="Şirket Logosu"
                                        subTitle="Logo seçmek için buraya tıklayın."
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


            <Modal
            isOpen={this.state.showLocationModal}
            toggle={() => { this.setState({showLocationModal: false}) }}
            className="modal-dialog-centered"
            >
            <ModalHeader toggle={() => { this.setState({showLocationModal: false}) }}>
                Lokasyon Seç
            </ModalHeader>
            <ModalBody>
                <LocationPicker
                    containerElement={ <div style={ {height: '100%'} } /> }
                    mapElement={ <div style={ {height: '400px'} } /> }
                    defaultPosition={defaultPosition}
                    onChange={(e) => { this.setState({latitude: e.position.lat, longitude: e.position.lng}) }}
                />
                <p className="mt-2">Adres : {this.state.address}</p>
                <p>Koordinat : {this.state.latitude},{this.state.longitude}</p>
            </ModalBody>
            <ModalFooter>
                <Button.Ripple
                    color="danger"
                    className="mr-1 mb-1"
                >
                    Vazgeç
                </Button.Ripple>                 
                <Button.Ripple
                    color="primary"
                    className="mr-1 mb-1"
                    onClick={() => { 
                        this.setState({showLocationModal: false}, 
                            () => { 
                                // this.formik.setFieldValue('address', this.state.address) 
                                this.formik.setFieldValue('latitude', this.state.latitude) 
                                this.formik.setFieldValue('longitude', this.state.longitude) 
                            }) 
                    }}
                >
                    Seçimi Tamamla
                </Button.Ripple>              
            </ModalFooter>
            </Modal>              

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
