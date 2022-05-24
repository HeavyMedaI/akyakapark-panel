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
    reject_reason: Yup.string().required("Lütfen reddetme nedeniniz yazın!")
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
            detail: null,
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
        await c.post("get-company-application-list.json", {})
        .then(({status, message, data}) => {

            columns = [    
                {
                    name: "Ünvan",
                    selector: "title",
                    sortable: true,
                    wrap: true
                }, 
                {
                    name: "Başvuran",
                    selector: "firstname",
                    width: "140px",
                    cell: params => {
                        return (
                            `${params.firstname} ${params.lastname}`
                        )
                    }
                },  
                {
                    name: "Şirket Yetkilisi",
                    selector: "authorized_person_name",
                    width: "140px"
                },                                
                {
                    name: "İl/İlçe",
                    selector: "title",
                    width: "120px",
                    center: true,
                    cell: params => {
                        return (
                            `${params.city_name}/${params.district_name}`
                        )
                    }
                },                   
                {
                    name: "Sektör",
                    selector: "category_name",
                    center: true,
                    width: "120px"
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
                    name: "Detay",
                    selector: "id",
                    width: "120px",
                    center: true,
                    cell: params => {
                        return (
                        <Button
                            className="btn btn-sm"
                            onClick={() => { this.setState({showDetail: true, detail: params}) }}
                            color="success"
                        >
                            Detay
                        </Button>          
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

            this.setState({finished: true, addOrEdit: false, base64: [], list: data, showDetail: false})
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
        c.post("delete-company-application.json", {id: this.state.deletedItemID})
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
    
    _approveApplication(id) {
        let c = new WebClient();
        c.post("approve-company-application.json", {id})
        .then(({status, message, data}) => {
            
            if (status) {
                toast.success(message)
                this._getList()
            } else {
                toast.error(message)
            }
        })
    }     

    render() {
        const { member } = this.props
        const { list, finished, addOrEdit, item, editing, base64, showDetail, detail, showReject } = this.state

        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom="mb-2"
                breadCrumbTitle="Üye İşyeri Başvuruları"
                breadCrumbParent="İçerik Yönetimi"
                breadCrumbActive="Haberler"
                showAddButton={false}
                showCancelButton={showDetail}
                onAddButtonClick={() => { this.setState({addOrEdit: true, item: null}) }}
                onCancelButtonClick={() => { this.setState({showDetail: false, detail: null}) }}
            />      
            </Col>

                {
                showDetail ?
                <Col lg="12" md="12">
                    <Card>
                        <CardBody>
                        <Row>
                            <Col sm="12 mb-2"><h4>Şirket Bilgileri</h4></Col>
                            <Col sm="3 mb-1"><strong>Ünvan</strong></Col>
                            <Col sm="3 mb-1">{detail.title}</Col>
                            <Col sm="3 mb-1"><strong>İl/İlçe</strong></Col>
                            <Col sm="3 mb-1">{detail.city_name} {detail.district_name}</Col>                            
                            <Col sm="3 mb-1"><strong>Adres</strong></Col>
                            <Col sm="9 mb-1">{detail.address}</Col>
                            <Col sm="3 mb-1"><strong>Vergi Numarası</strong></Col>
                            <Col sm="3 mb-1">{detail.tax_number}</Col>
                            <Col sm="3 mb-1"><strong>Vergi Dairesi</strong></Col>
                            <Col sm="3 mb-1">{detail.tax_adm}</Col>
                            <Col sm="3 mb-1"><strong>Sektör</strong></Col>
                            <Col sm="3 mb-1">{detail.category_name}</Col>
                            <Col sm="12 mb-2 mt-2"><h4>Yetkili Bilgileri</h4></Col>
                            <Col sm="3 mb-1"><strong>İsim Soyisim</strong></Col>
                            <Col sm="3 mb-1">{detail.authorized_person_name}</Col>
                            <Col sm="3 mb-1"><strong>Telefon Numarası</strong></Col>
                            <Col sm="3 mb-1">{detail.phone}</Col> 
                            <Col sm="12 mb-2 mt-2"><h4>Başvuruyu Yapan</h4></Col>
                            <Col sm="3 mb-1"><strong>İsim Soyisim</strong></Col>
                            <Col sm="3 mb-1">{detail.firstname} {detail.lastname}</Col>
                            <Col sm="3 mb-1"><strong>E-Posta Adresi</strong></Col>
                            <Col sm="3 mb-1">{detail.email}</Col>
                            <Col sm="3 mb-1"><strong>Başvuru Tarihi</strong></Col>
                            <Col sm="9 mb-1">{moment.unix(detail.create_time).format("DD.MM.YYYY HH:mm:ss")}</Col>       
                            {
                            detail?.reject_reason?.length > 0 && (
                            <>
                            <Col sm="12 mb-2 mt-2"><h4>Tekrar Onaya Gönderilmiş Kayıt</h4></Col>
                            <Col sm="3 mb-1"><strong>Önceki Reddedilme Sebebi</strong></Col>
                            <Col sm="9 mb-1">{detail.reject_reason}</Col>
                            <Col sm="3 mb-1"><strong>Reddedilme Tarihi</strong></Col>
                            <Col sm="9 mb-1">{moment.unix(detail.reject_date).format("DD.MM.YYYY HH:mm:ss")}</Col>                                
                            </>
                            )
                            }                            
                            <Col sm="12 mb-1 mt-2"><h4>İşlem</h4></Col>
                            <Col sm="2 mb-1">
                                <Button
                                    onClick={() => { this._approveApplication(detail.id) }}
                                    color="success"
                                    style={{ width: "100%", paddingLeft: 0, paddingRight: 0 }}
                                >
                                    Başvuruyu Onayla
                                </Button>                       
                            </Col>

                            <Col sm="2 mb-1">
                                <Button
                                    onClick={() => { this._reject(detail.id) }}
                                    color="danger"
                                    style={{ width: "100%", paddingLeft: 0, paddingRight: 0 }}
                                >
                                    Başvuruyu Reddet
                                </Button>                       
                            </Col> 

                            <Col sm="2 mb-1">
                                <Button
                                    onClick={() => { this._deleteItem(detail.id)  }}
                                    color="warning"
                                    style={{ width: "100%", paddingLeft: 0, paddingRight: 0 }}
                                >
                                    Başvuruyu Sil
                                </Button>                       
                            </Col>                                                        

                        </Row>
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
            isOpen={this.state.showReject}
            toggle={() => { this.setState({showReject: false}) }}
            className="modal-dialog-centered"
            >
            <ModalHeader toggle={() => { this.setState({showReject: false}) }}>
                Başvuruyu Reddet
            </ModalHeader>
            <ModalBody>
                    <Formik
                        initialValues={{
                            reject_reason: ""
                        }}
                        validationSchema={formSchema}
                        onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                let c = new WebClient();
                                c.post("reject-company-application.json", {
                                    id: this.state.deletedItemID,
                                    reject_reason: values.reject_reason
                                })
                                .then(({status, message, data}) => {

                                    if (status) {
                                        toast.success(message)
                                        this.setState({showDetail: false, detail: null, showReject: false})
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

                                <Col sm="12 mb-2">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Reddetme Nedeni</CLabel>
                                    <Field
                                        placeholder="Reddetme Nedeni"
                                        name="reject_reason"
                                        component="textarea"
                                        value={values.reject_reason}
                                        className={`form-control ${errors.reject_reason && touched.reject_reason && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.reject_reason && touched.reject_reason)} message={errors.reject_reason} />
                                    </FormGroup>
                                </Col>                                                                                                                                   

                                <Col sm="6">
                                    <FormGroup>
                                    <Button
                                        disabled={isSubmitting}
                                        color="primary"
                                        type="submit"
                                        style={{ width: "100%" }}
                                    >
                                        Başvuruyu Reddet
                                    </Button>
                                    </FormGroup>                                 
                                </Col>
                                <Col sm="6">
                                    <FormGroup>
                                    <Button
                                        onClick={() => { this.setState({showReject: false, deletedItemID: 0}) }}
                                        color="danger"
                                        type="button"
                                        style={{ width: "100%" }}
                                    >
                                        Vazgeç
                                    </Button>
                                    </FormGroup>                                    
                                </Col>                                
                                </Row>
                        </Form>
                        )}
                    </Formik>
            </ModalBody>
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
