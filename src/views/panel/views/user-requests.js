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
  Button,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter
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
  note: Yup.string().required("Bu alanı boş bırakmayın")
})

class UsersList extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        finished: false,
        list: [],
        status: 0,
        showDetail: false,
        detailItem: null,
        showAlert: false,
        showClose: false,
        showNote: false,
        deletedItemID: 0
      }
    }

    componentDidMount() {
        this.checkFilter();
    }

    async checkFilter() {
      let c = new WebClient();
      await c.post("get-user-forms.json", {status: this.state.status})
      .then(({status, message, data}) => {
          if (status) {

            if (this.state.status == 0) {

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
                        name: "E-Posta",
                        selector: "email",
                        sortable: true
                    },                  
                    {
                        name: "Telefon",
                        selector: "phone",
                        sortable: true,
                        cell: params => {
                            if (params.phone !== undefined && params.phone !== null) return params.phone
                            else return "-"
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
                        name: "Detay",
                        selector: "id",
                        center: true,
                        width: "120px",
                        cell: params => {
                            return (
                            <Button
                                className="btn-sm"
                                onClick={() => { this.setState({showDetail: true, detailItem: params}) }}
                                color="info"
                            >
                                Oku
                            </Button>    
                            )
                        }
                    },    
                    {
                        name: "Kapat",
                        selector: "id",
                        center: true,
                        width: "120px",
                        cell: params => {
                            return (
                            <Button
                                className="btn-sm"
                                onClick={() => { this.setState({showClose: true, detailItem: params}) }}
                                color="success"
                            >
                                Kapat
                            </Button>    
                            )
                        }
                    }                                                 
                ]                  

            } else if (this.state.status == 1) {

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
                        name: "E-Posta",
                        selector: "email",
                        sortable: true
                    },                  
                    {
                        name: "Telefon",
                        selector: "phone",
                        sortable: true,
                        cell: params => {
                            if (params.phone !== undefined && params.phone !== null) return params.phone
                            else return "-"
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
                        name: "Detay",
                        selector: "id",
                        center: true,
                        width: "120px",
                        cell: params => {
                            return (
                            <Button
                                className="btn-sm"
                                onClick={() => { this.setState({showDetail: true, detailItem: params}) }}
                                color="info"
                            >
                                Oku
                            </Button>    
                            )
                        }
                    },    
                    {
                        name: "İşlem Tarihi",
                        selector: "process_date",
                        width: "180px",
                        center: true,
                        sortable: true,
                        cell: params => {
                            if (params.process_date == null) return "-"
                            return moment.unix(params.process_date).format("DD.MM.YYYY HH:mm")
                        }
                    },  
                    {
                        name: "Not",
                        selector: "id",
                        center: true,
                        width: "120px",
                        cell: params => {
                            return (
                            <Button
                                className="btn-sm"
                                onClick={() => { this.setState({showNote: true, detailItem: params}) }}
                                color="info"
                            >
                                Not
                            </Button>    
                            )
                        }
                    },                     
                    {
                        name: "Arşivle",
                        selector: "id",
                        center: true,
                        width: "120px",
                        cell: params => {
                            return (
                            <Button
                                className="btn-sm"
                                onClick={() => { this.setState({showAlert: true, deletedItemID: params.id}) }}
                                color="danger"
                            >
                                Arşivle
                            </Button>    
                            )
                        }
                    },                                                
                ]                  
              
            } else if (this.state.status == 2) {


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
                        name: "E-Posta",
                        selector: "email",
                        sortable: true
                    },                  
                    {
                        name: "Telefon",
                        selector: "phone",
                        sortable: true,
                        cell: params => {
                            if (params.phone !== undefined && params.phone !== null) return params.phone
                            else return "-"
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
                        name: "Detay",
                        selector: "id",
                        center: true,
                        width: "120px",
                        cell: params => {
                            return (
                            <Button
                                className="btn-sm"
                                onClick={() => { this.setState({showDetail: true, detailItem: params}) }}
                                color="info"
                            >
                                Oku
                            </Button>    
                            )
                        }
                    },    
                    {
                        name: "İşlem Tarihi",
                        selector: "process_date",
                        width: "180px",
                        center: true,
                        sortable: true,
                        cell: params => {
                            if (params.process_date == null) return "-"
                            return moment.unix(params.process_date).format("DD.MM.YYYY HH:mm")
                        }
                    },  
                    {
                        name: "Not",
                        selector: "id",
                        center: true,
                        width: "120px",
                        cell: params => {
                            return (
                            <Button
                                className="btn-sm"
                                onClick={() => { this.setState({showNote: true, detailItem: params}) }}
                                color="info"
                            >
                                Not
                            </Button>    
                            )
                        }
                    }                                               
                ]                               
            }  

            this.setState({list: data})
          }
      })
    } 

    _delete() {
        this.setState({showAlert: false, showDetail: false, detail: null})
        let c = new WebClient();
        c.post("delete-form.json", {id: this.state.deletedItemID})
        .then(({status, message, data}) => {
            
            if (status) {
                toast.success(message)
                this.checkFilter();
            } else {
                toast.error(message)
            }
        })
    }     

    render() {
      const { status, list, showDetail, detailItem, showClose } = this.state
      return (
        <Row className="app-user-list">
          <Col sm="12">
          <Breadcrumbs
              marginBottom="mb-2"
              breadCrumbTitle="Kullanıcı Talepleri"
              breadCrumbParent="Fırsat Kullanıcıları"
              breadCrumbActive="Tüm Kullanıcılar"
          />      
          </Col>

          <Col sm="12">
          <Card>
              <CardBody>
                <Row>
                  <Col md="4" sm="12">
                    <Button
                        onClick={() => {
                            this.setState({status: 0}, () => {
                                this.checkFilter()
                            })
                        }}
                        color={status == 0 ? "primary" : "light"}
                        style={{ width: "100%" }}
                    >
                        Açık Talepler
                    </Button> 
                  </Col>    
                  <Col md="4" sm="12">
                    <Button
                        onClick={() => {
                            this.setState({status: 1}, () => {
                                this.checkFilter()
                            })
                        }}
                        color={status == 1 ? "primary" : "light"}
                        style={{ width: "100%" }}
                    >
                        Kapalı Talepler
                    </Button> 
                  </Col> 
                  <Col md="4" sm="12">
                    <Button
                        onClick={() => {
                            this.setState({status: 2}, () => {
                                this.checkFilter()
                            })
                        }}
                        color={status == 2 ? "primary" : "light"}
                        style={{ width: "100%" }}
                    >
                        Arşiv
                    </Button> 
                  </Col>                                        
                </Row>              
              </CardBody>
          </Card>
        </Col>

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

        {
        this.state.showAlert ?
        <DeleteAlert 
            message="Seçtiğiniz kayıt arşivlenecektir. Devam etmek istiyor musunuz?"
            confirmButtonText="Evet"
            onConfirm={() => { this._delete() }} 
            onClose={() => { this.setState({showAlert: false, deletedItemID: 0}) }} />
        :
        null
        }        

            <Modal
            isOpen={this.state.showDetail}
            toggle={() => { this.setState({showDetail: false}) }}
            className="modal-dialog-centered"
            >
            <ModalHeader toggle={() => { this.setState({showDetail: false}) }}>
                Mesaj
            </ModalHeader>
            <ModalBody>

                <Formik
                    initialValues={{
                        title: "",
                        message: ""
                    }}
                    onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {
                    
                    }}
                >
                    {({ errors, touched, values, isSubmitting, handleChange, handleBlur, setFieldValue }) => (
                    <Form noValidate={true} autoComplete="off">
                        <Row>

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Konu</CLabel>
                                <Field
                                    placeholder="Konu"
                                    name="title"
                                    disabled={true}
                                    value={detailItem?.subject ?? ""}
                                    className={`form-control`}
                                />
                                </FormGroup>
                            </Col>   

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Mesaj</CLabel>
                                <Field
                                    placeholder="Mesaj"
                                    name="message"
                                    disabled={true}
                                    component="textarea"
                                    style={{ height: "120px" }}
                                    value={detailItem?.message ?? ""}
                                    className={`form-control`}
                                />
                                </FormGroup>
                            </Col>  

                        </Row>
                    </Form>
                    )}
                </Formik>                           

            </ModalBody>
            <ModalFooter>
                <Button.Ripple
                    color="danger"
                    onClick={() => { this.setState({showDetail: false}) }}
                    className="mr-1 mb-1"
                >
                    Kapat
                </Button.Ripple>            
            </ModalFooter>
            </Modal>      

            <Modal
            isOpen={this.state.showNote}
            toggle={() => { this.setState({showNote: false}) }}
            className="modal-dialog-centered"
            >
            <ModalHeader toggle={() => { this.setState({showNote: false}) }}>
                Not
            </ModalHeader>
            <ModalBody>

                <Formik
                    initialValues={{
                        title: "",
                        message: ""
                    }}
                    onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {
                    
                    }}
                >
                    {({ errors, touched, values, isSubmitting, handleChange, handleBlur, setFieldValue }) => (
                    <Form noValidate={true} autoComplete="off">
                        <Row>

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">İşlem Tarihi</CLabel>
                                <Field
                                    placeholder="İşlem Tarihi"
                                    name="title"
                                    disabled={true}
                                    value={moment.unix(detailItem?.process_date ?? "").format("DD.MM.YYYY HH:mm:ss")}
                                    className={`form-control`}
                                />
                                </FormGroup>
                            </Col>   

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Not</CLabel>
                                <Field
                                    placeholder="Not"
                                    name="note"
                                    disabled={true}
                                    component="textarea"
                                    style={{ height: "120px" }}
                                    value={detailItem?.note ?? ""}
                                    className={`form-control`}
                                />
                                </FormGroup>
                            </Col>  

                        </Row>
                    </Form>
                    )}
                </Formik>                           

            </ModalBody>
            <ModalFooter>
                <Button.Ripple
                    color="danger"
                    onClick={() => { this.setState({showDetail: false}) }}
                    className="mr-1 mb-1"
                >
                    Kapat
                </Button.Ripple>            
            </ModalFooter>
            </Modal>                   

            <Modal
            isOpen={this.state.showClose}
            toggle={() => { this.setState({showClose: false}) }}
            className="modal-dialog-centered"
            >
            <ModalHeader toggle={() => { this.setState({showClose: false}) }}>
                Not Ekle ve Kapat
            </ModalHeader>
            <ModalBody>

                <Formik
                    initialValues={{
                        note: ""
                    }}
                    validationSchema={formSchema}
                    onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {
                        let c = new WebClient();
                        c.post("close-form.json", {
                            id: detailItem?.id ?? 0,
                            note: values.note
                        })
                        .then(({status, message, data}) => {

                            if (status) {
                                toast.success(message)
                                this.setState({showClose: false, detailItem: null})
                                this.checkFilter()
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
                                <CLabel required for="nameVertical">Not</CLabel>
                                <Field
                                    placeholder="Not"
                                    name="note"
                                    component="textarea"
                                    style={{ height: "120px" }}
                                    value={values.note}
                                    className={`form-control ${errors.note && touched.note && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.note && touched.note)} message={errors.note} />
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

export default UsersList