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
import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")


let columns = []

const formSchema = Yup.object().shape({
    question: Yup.string()
    .required(messages.required_field),
    answer: Yup.string()
    .required(messages.required_field),
    order_number: Yup.number().typeError(messages.invalid_number).required(messages.required_field).moreThan(-1, messages.invalid_number).integer(messages.invalid_number)
})

class UsersList extends React.Component {

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
        await c.post("get-faq-list.json", {})
        .then(({status, message, data}) => {

            columns = [    
                {
                    name: "Soru",
                    selector: "question",
                    sortable: true,
                    wrap: true
                }, 
                {
                    name: "Sıra",
                    selector: "order_number",
                    sortable: true,
                    width: "100px",
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

            this.setState({finished: true, addOrEdit: false, list: data})
        })
    }    

    _deleteItem(deletedItemID) {
        this.setState({showAlert: true, deletedItemID})
    }

    _delete() {
        this.setState({showAlert: false})
        let c = new WebClient();
        c.post("delete-faq.json", {id: this.state.deletedItemID})
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
      const { list, finished, addOrEdit, item, editing } = this.state
      return (
        <Row className="app-user-list">
          <Col sm="12">
          <Breadcrumbs
              marginBottom=""
              breadCrumbTitle="Sıkça Sorulan Sorular"
              breadCrumbParent="Yönetim"
              breadCrumbActive="Sıkça Sorulan Sorular"
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
                            question: item?.question ?? "",
                            answer: item?.answer ?? "",
                            order_number: item?.order_number ?? 0,
                            status: item?.status ?? true
                        }}
                        validationSchema={formSchema}
                        onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                let c = new WebClient();
                                c.post("add-faq.json", {
                                    id: item?.id ?? -1,
                                    question: values.question,
                                    answer: values.answer,
                                    order_number: values.order_number,
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
                                    <CLabel required for="nameVertical">Soru</CLabel>
                                    <Field
                                        placeholder="Soru"
                                        name="question"
                                        value={values.question}
                                        className={`form-control ${errors.question && touched.question && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.question && touched.question)} message={errors.question} />
                                    </FormGroup>
                                </Col> 

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Cevap</CLabel>
                                    <Field
                                        placeholder="Cevap"
                                        name="answer"
                                        component="textarea"
                                        value={values.answer}
                                        className={`form-control ${errors.answer && touched.answer && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.answer && touched.answer)} message={errors.answer} />
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

export default UsersList
