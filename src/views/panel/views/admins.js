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
import "../../../assets/scss/plugins/tables/_agGridStyleOverride.scss"
import "../../../assets/scss/pages/users.scss"
import Breadcrumbs from "../../../components/@vuexy/breadCrumbs/BreadCrumb"
import ProgressComponent from "../../../components/@vuexy/spinner/in-page-spinner"
import { WebClient, messages } from '../../../utility/webclient'
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
import Select from 'react-select'

import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")


let columns = []

const formSchema = Yup.object().shape({
    firstname: Yup.string().required(messages.required_field),
    lastname: Yup.string().required(messages.required_field),
    user_type: Yup.string().required(messages.required_field),
    email: Yup.string().email(messages.invalid_email).required(messages.required_field),
    password: Yup.string().required(messages.required_field),
    password_repeat: Yup.string().required(messages.required_field)
    .test("match", messages.doesnt_match, function(value) {
        return this.parent.password === value
    }),
})

const formSchemaEdit = Yup.object().shape({
    firstname: Yup.string().required(messages.required_field),
    lastname: Yup.string().required(messages.required_field),
    user_type: Yup.string().required(messages.required_field),
    email: Yup.string().email(messages.invalid_email).required(messages.required_field),
    password_repeat: Yup.string()
    .test("match", messages.doesnt_match, function(value) {
        return this.parent.password === value
    }),
})

const rls = [
    {value: 20, label: "Gelişmiş Kullanıcı"},
    {value: 30, label: "Yönetici"}
]

const rls2 = [
    {value: 20, label: "Gelişmiş Kullanıcı"},
    {value: 30, label: "Yönetici"},
    {value: 40, label: "Sistem Yöneticisi"}
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
            list: []
      }
    }

    componentDidMount() {     
        this._getList();
    }

    async _getList() {
        let c = new WebClient();
        await c.post("get-admin-list.json", {})
        .then(({status, message, data}) => {

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
                    name: "Yetki",
                    selector: "user_type",
                    sortable: true,
                    center: true,
                    width: "120px",
                    cell: params => {
                      return params.user_type == "40" ? (
                        "Sistem Yöneticisi"
                      ) : params.user_type == "30" ? (
                        "Yönetici"
                      ) : "Gelişmiş Kullanıcı"
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
                    name: "Son Login",
                    selector: "last_login",
                    width: "180px",
                    center: true,
                    sortable: true,
                    cell: params => {
                        if (params.last_login == null) return "-"
                        return moment.unix(params.last_login).format("DD.MM.YYYY HH:mm")
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

            this.setState({finished: true, addOrEdit: false, list: data})
        })
    }    

    _deleteItem(deletedItemID) {
        this.setState({showAlert: true, deletedItemID})
    }

    _delete() {
        this.setState({showAlert: false})
        let c = new WebClient();
        c.post("delete-admin.json", {id: this.state.deletedItemID})
        .then(({status, message, data}) => {
            
            if (status) {
                toast.success(message)
                this._getList();
            } else {
                toast.error(message)
            }
        })
    }    

    render() {
        const { member } = this.props
        const { list, finished, addOrEdit, item, editing } = this.state
        const roles = member?.role == "super-admin" ? rls2 : rls
        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom=""
                breadCrumbTitle="Yöneticiler"
                breadCrumbParent="Yönetim"
                breadCrumbActive="Yöneticiler"
                showAddButton={!addOrEdit}
                showCancelButton={addOrEdit}
                onAddButtonClick={() => { this.setState({addOrEdit: true, item: null}) }}
                onCancelButtonClick={() => { this.setState({addOrEdit: false}) }}
            />      
            </Col>

                {
                addOrEdit ?
                <Col lg="12" md="12">
                    <Card>
                        <CardBody>
                        <Formik
                            initialValues={{
                                firstname: item?.firstname ?? "",
                                lastname: item?.lastname ?? "",
                                email: item?.email ?? "",
                                password: "",
                                password_repeat: "",
                                user_type: item?.user_type ? roles.filter(x => x.value == item.user_type)[0] : "",
                                status: item?.status ?? true
                            }}
                            validationSchema={item != null ? formSchemaEdit : formSchema}
                            onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                    let c = new WebClient();
                                    c.post("add-admin.json", {
                                        id: item?.uid ?? -1,
                                        firstname: values.firstname,
                                        lastname: values.lastname,
                                        email: values.email,
                                        password: values.password,
                                        user_type: values.user_type.value,
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
                                        <CLabel required for="EmailVertical">Yetki</CLabel>
                                        <Select
                                            className={`form-control no-padding ${errors.user_type && touched.user_type && "is-invalid"}`}
                                            classNamePrefix="select"
                                            placeholder="Seçiniz..."
                                            onChange={(e) => { 
                                                setFieldValue("user_type", e) 
                                            }}
                                            value={values.user_type}
                                            name="user_type"
                                            options={roles}
                                        />
                                        <IE show={Boolean(errors.user_type && touched.user_type)} message={errors.user_type} />
                                        </FormGroup>
                                    </Col>                                     

                                    <Col sm="6">
                                        <FormGroup>
                                        <CLabel required for="nameVertical">İsim</CLabel>
                                        <Field
                                            placeholder="İsim"
                                            name="firstname"
                                            value={values.firstname}
                                            className={`form-control ${errors.firstname && touched.firstname && "is-invalid"}`}
                                        />
                                        <IE show={Boolean(errors.firstname && touched.firstname)} message={errors.firstname} />
                                        </FormGroup>
                                    </Col> 

                                    <Col sm="6">
                                        <FormGroup>
                                        <CLabel required for="nameVertical">Soyisim</CLabel>
                                        <Field
                                            placeholder="Soyisim"
                                            name="lastname"
                                            value={values.lastname}
                                            className={`form-control ${errors.lastname && touched.lastname && "is-invalid"}`}
                                        />
                                        <IE show={Boolean(errors.lastname && touched.lastname)} message={errors.lastname} />
                                        </FormGroup>
                                    </Col>  

                                    <Col sm="12">
                                        <FormGroup>
                                        <CLabel required for="nameVertical">E-Posta Adresi</CLabel>
                                        <Field
                                            placeholder="E-Posta Adresi"
                                            name="email"
                                            value={values.email}
                                            className={`form-control ${errors.email && touched.email && "is-invalid"}`}
                                        />
                                        <IE show={Boolean(errors.email && touched.email)} message={errors.email} />
                                        </FormGroup>
                                    </Col> 
                                    
                                    {
                                    item != null && (
                                    <Col sm="12">
                                    <p>* Eğer şifreyi güncellemek isterseniz şifre alanını doldurun. Aksi durumda boş bırakabilirsiniz.</p>
                                    </Col>
                                    )
                                    }

                                    <Col sm="6">
                                        <FormGroup>
                                        <CLabel required for="nameVertical">Şifre</CLabel>
                                        <Field
                                            placeholder="Şifre"
                                            name="password"
                                            value={values.password}
                                            className={`form-control ${errors.password && touched.password && "is-invalid"}`}
                                        />
                                        <IE show={Boolean(errors.password && touched.password)} message={errors.password} />
                                        </FormGroup>
                                    </Col>   

                                    <Col sm="6">
                                        <FormGroup>
                                        <CLabel required for="nameVertical">Şifre (Tekrar)</CLabel>
                                        <Field
                                            placeholder="Şifre (Tekrar)"
                                            name="password_repeat"
                                            value={values.password_repeat}
                                            className={`form-control ${errors.password_repeat && touched.password_repeat && "is-invalid"}`}
                                        />
                                        <IE show={Boolean(errors.password_repeat && touched.password_repeat)} message={errors.password_repeat} />
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
