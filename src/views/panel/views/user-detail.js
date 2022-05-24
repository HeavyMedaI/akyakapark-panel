import React from "react"
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
  UncontrolledDropdown,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Collapse,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Alert
} from "reactstrap"
import axios from "axios"
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
  X
} from "react-feather"
import classnames from "classnames"
import { history } from "../../../history"
import "../../../assets/scss/plugins/tables/_agGridStyleOverride.scss"
import "../../../assets/scss/pages/users.scss"
import Breadcrumbs from "../../../components/@vuexy/breadCrumbs/BreadCrumb"
import { WebClient } from '../../../utility/webclient'
import DeleteAlert from './sweet-alert.js'
import { ToastContainer } from "react-toastify"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../assets/scss/plugins/extensions/toastr.scss"
import HelpForms from './help-forms/index'
import Spinner from "../../../components/@vuexy/spinner/in-page-spinner"
import { Formik, Field, Form } from "formik"
import * as Yup from "yup"
import IE from './invalid-tooltip'
import CLabel from './clabel'
import CToggle from './ctoggle'
import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss"
import Select from 'react-select'
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';

import DataTable from 'react-data-table-component';
import { customStyles } from './_datatable-styles'

import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

let columns = []

const formSchema = Yup.object().shape({
  title: Yup.string().required("Bu alanı boş bırakmayın"),
  message: Yup.string().required("Bu alanı boş bırakmayın")
})

class UsersList extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        list: [],
        notFound: false,
        item: null,
        showClose: false,
        showAlert: false,
        showWarning: false,
        showTransactions: false
      }
    }

    componentDidMount() {
        
        columns = [    
            {
                name: "Kampanya Adı",
                selector: "title",
                sortable: true,
                wrap: true
            }, 
            {
                name: "Firma Adı",
                selector: "company_name",
                sortable: true
            },                   
            {
                name: "Alışveriş Tutarı",
                selector: "amount",
                sortable: true,
                center: true,
                cell: params => {
                    return params.amount + " TL"
                }    
            },
            {
                name: "İndirimden Sonra",
                selector: "after_discount",
                sortable: true,
                center: true,
                cell: params => {
                    return params.after_discount + " TL"
                }                
            },    
            {
                name: "Kazanç",
                selector: "amount",
                sortable: true,
                center: true,
                cell: params => {
                    return params.amount - params.after_discount + " TL"
                }
            },                        
            {
                name: "Durum",
                selector: "status",
                sortable: true,
                center: true,
                width: "140px",
                cell: params => {
                  return params.status == "1" ? (
                    <div className="badge badge-pill badge-light-success">
                      TAMAMLANDI
                    </div>
                  ) : params.status == "0" ? (
                    <div className="badge badge-pill badge-light-danger">
                      TAMAMLANMADI
                    </div>
                  ) : null
                }
            },            
            {
                name: "Oluşturma Tarihi",
                selector: "create_time",
                width: "140px",
                center: true,
                sortable: true,
                cell: params => {
                    if (params.create_time == null) return "-"
                    return moment.unix(params.create_time).format("DD.MM.YYYY HH:mm")
                }
            },  
            {
                name: "Alışveriş Tarihi",
                selector: "result_time",
                width: "140px",
                center: true,
                sortable: true,
                cell: params => {
                    if (params.result_time == null) return "-"
                    return moment.unix(params.result_time).format("DD.MM.YYYY HH:mm")
                }
            }                                             
        ]         

        let nid = this.props.match?.params?.id ?? -1

        if (nid == -1) {
            history.push("/")
        } else {
            this.setState({nid}, () => {
                this._getUseDetail();
            })
        }
    }

    _getUseDetail() {
        let c = new WebClient();
        c.post("get-user-detail.json", 
            {
                uid: this.state.nid
            })
        .then(({status, message, data}) => {
            console.log(data)
            if (status) {
                this.setState({item: data, list: data?.transactions ?? []})
            } else {
                this.setState({notFound: true})
            }

        })
    }  
    
    _delete() {
        this.setState({showAlert: false})
        let c = new WebClient();
        c.post("delete-user.json", 
            {
                uid: this.state.nid
            })
        .then(({status, message, data}) => {
            
            if (status) {
                toast.success(message)
                history.push("/app-users")
            } else {
                toast.error(message)
            }

        })
    } 
    
    _changeStatus() {
        this.setState({showWarning: false})
        let c = new WebClient();
        c.post("change-user-status.json", 
            {
                uid: this.state.nid
            })
        .then(({status, message, data}) => {
            
            if (status) {
                toast.success(message)
                this._getUseDetail();
            } else {
                toast.error(message)
            }

        })
    }     

    render() {
      const { notFound, item, showTransactions, list } = this.state
      return (
        <Row className="app-user-list">
          <Col sm="12">
          <Breadcrumbs
              marginBottom="mb-2"
              breadCrumbTitle="Kullanıcı Detayı"
              breadCrumbParent="Fırsat Kullanıcıları"
              breadCrumbActive="Tüm Kullanıcılar"
          />      
          </Col>

            {
            notFound ?
            <Col sm="12">
                <Card>
                <CardBody>
                    
                    <Alert color="light" className="mb-0" style={{ textAlign: "center" }}>
                        Aktif kullanıcı bulunamadı!
                    </Alert> 

                </CardBody>
                </Card>
            </Col>              
            :
            <Col sm="12">
                <Card>
                
                <CardBody>

                    <Col sm="12" className="mb-2">
                        <h1>{item?.firstname} {item?.lastname}</h1>
                    </Col>

                    <Row className="mb-2">
                        <Col md="3">
                            <Button
                                onClick={() => { this.setState({showClose: true}) }}
                                style={{ width: "100%" }}
                                color="primary"
                            >
                                Bildirim Gönder
                            </Button>                            
                        </Col>

                        <Col md="3">
                            <Button
                                onClick={() => { this.setState({showAlert: true}) }}
                                style={{ width: "100%" }}
                                color="danger"
                            >
                                Kullanıcıyı Sil
                            </Button>                            
                        </Col>  

                        <Col md="3">
                            <Button
                                style={{ width: "100%" }}
                                onClick={() => { this.setState({showWarning: true}) }}
                                color="warning"
                            >
                                {item?.status == 1 ? "Hesabı Pasif Yap" : "Hesabı Aktif Yap"}
                            </Button>                            
                        </Col>  

                        <Col md="3">
                            <Button
                                onClick={() => { 
                                    this.setState({showTransactions: !showTransactions}) 
                                }}
                                style={{ width: "100%" }}
                                color="success"
                            >
                                {showTransactions ? "Kullanıcı Bilgileri" : "Kullanıcı Hareketleri"}
                            </Button>                            
                        </Col>                                                                        
                    </Row>    

                    {
                    showTransactions ?
                    <Row>
                        <Col>
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
                        </Col>
                    </Row>
                    :
                    <Row>
                        <Col md="6" className="mb-2">
                            <BoxItem title="E-Posta Adresi" value={item?.email} />
                        </Col>

                        <Col md="6" className="mb-2">
                            <BoxItem title="Telefon Numarası" value={item?.phone} />
                        </Col> 

                        <Col md="6" className="mb-2">
                            <BoxItem title="Yaş" value={item?.age} />
                        </Col>                         

                        <Col md="6" className="mb-2">
                            <BoxItem title="Cinsiyet" value={item?.gender == -1 ? "Belirtilmedi" : item?.gender} />
                        </Col>  

                        <Col md="6" className="mb-2">
                            <BoxItem title="Doğum Tarihi" value={moment.unix(item?.birthdate).format("DD.MM.YYYY")} />
                        </Col> 

                        <Col md="6" className="mb-2">
                            <BoxItem title="Kayıt Tarihi" value={moment.unix(item?.create_time).format("DD.MM.YYYY HH:mm:ss")} />
                        </Col>  

                        <Col md="6" className="mb-2">
                            <BoxItem title="İl" value={item?.city_name} />
                        </Col>  

                        <Col md="6" className="mb-2">
                            <BoxItem title="İlçe" value={item?.district_name} />
                        </Col>                   

                        <Col md="6" className="mb-2">
                            <BoxItem title="Meslek" value={item?.profession} />
                        </Col>  

                        <Col md="6" className="mb-2">
                            <BoxItem title="Hobiler" value={item?.hobbies} />
                        </Col> 

                        <Col md="6" className="mb-2">
                            <BoxItem title="Cihaz Platform" value={item?.device_platform} />
                        </Col>

                        <Col md="6" className="mb-2">
                            <BoxItem title="Cihaz Marka" value={item?.device_brand} />
                        </Col>     

                        <Col md="6" className="mb-2">
                            <BoxItem title="Cihaz Model" value={item?.device_model} />
                        </Col>                                                     

                        <Col md="6" className="mb-2">
                            <BoxItem title="Uygulama Versiyonu" value={item?.app_version} />
                        </Col>

                        <Col md="6" className="mb-2">
                            <BoxItem title="Uygulama Sürümü" value={item?.build_number} />
                        </Col>  

                        <Col md="6" className="mb-2">
                            <BoxItem title="Kayıt Durumu" value={item?.registration_complete == 1 ? "Tamamlandı" : "Tamamlanmadı"} />
                        </Col>
                        {
                        item?.registration_complete == 1 && (
                         <Col md="6" className="mb-2">
                            <BoxItem title="Kayıt Tamamlama Tarihi" value={moment.unix(item?.registration_complete_time).format("DD.MM.YYYY HH:mm:ss")} />
                        </Col>                             
                        )
                        }

                         <Col md="6" className="mb-2">
                            <BoxItem title="Son Login Tarihi" value={moment.unix(item?.last_login).format("DD.MM.YYYY HH:mm:ss")} />
                        </Col>                         
                        
                    </Row>  
                    }                                 

                </CardBody>

                </Card>
            </Col>              
            }             

        {
        this.state.showAlert ?
        <DeleteAlert 
            message="Seçtiğiniz kullanıcı silinecektir. Devam etmek istiyor musunuz?"
            confirmButtonText="Evet"
            onConfirm={() => { this._delete() }} 
            onClose={() => { this.setState({showAlert: false}) }} />
        :
        null
        }

        {
        this.state.showWarning ?
        <DeleteAlert 
            message="Kullanıcının durumu değiştirilecektir. Devam etmek istiyor musunuz?"
            confirmButtonText="Evet"
            onConfirm={() => { this._changeStatus() }} 
            onClose={() => { this.setState({showWarning: false}) }} />
        :
        null
        }        

            <Modal
            isOpen={this.state.showClose}
            toggle={() => { this.setState({showClose: false}) }}
            className="modal-dialog-centered"
            >
            <ModalHeader toggle={() => { this.setState({showClose: false}) }}>
                Bildirim Gönder
            </ModalHeader>
            <ModalBody>

                <Formik
                    initialValues={{
                        title: "",
                        message: ""
                    }}
                    validationSchema={formSchema}
                    onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {
                        let c = new WebClient();
                        c.post("send-notification-to-user.json", {
                            id: item?.uid,
                            title: values.title,
                            message: values.message
                        })
                        .then(({status, message, data}) => {

                            if (status) {
                                toast.success(message)
                                this.setState({showClose: false})
                            } else {
                                toast.error(message)
                            }

                            setSubmitting(false)
        
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

                            <Col sm="12" className="mb-2">
                                <FormGroup>
                                <CLabel required for="nameVertical">Mesaj</CLabel>
                                <Field
                                    placeholder="Mesaj"
                                    name="message"
                                    component="textarea"
                                    style={{ height: "120px" }}
                                    value={values.message}
                                    className={`form-control ${errors.message && touched.message && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.message && touched.message)} message={errors.message} />
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
                                    Gönder
                                </Button.Ripple>
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

class BoxItem extends React.Component {

    static defaultProps = {
        title: "",
        value: ""
    }

    render() {

        const { value, title } = this.props

        return (
        <div style={{ width: "100%", height: 56, borderWidth: 1, borderColor: '#ccc', borderStyle: 'solid', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ width: "40%", height: "100%", display: 'flex', backgroundColor: '#efefef', alignItems: 'center', justifyContent: 'center', borderWidth: 0, borderRightWidth: 1, borderStyle: "solid", borderColor: "#ccc" }}>
                {title}
            </div>
            <div style={{ width: "60%", height: "100%", display: 'flex', alignItems: 'center', justifyContent: 'flex-start', boxSizing: 'border-box', paddingLeft: 10, paddingRight: 10, fontWeight: "600" }}>
                {value ?? "-"}
            </div>                            
        </div>            
        )
    }
}

export default UsersList