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
        await c.post("get-notification-list.json", {})
        .then(({status, message, data}) => {

            columns = [    
                {
                    name: "Başlık",
                    selector: "title",
                    sortable: true,
                    wrap: true
                }, 
                {
                    name: "Mesaj",
                    selector: "notification",
                    sortable: true,
                    wrap: true
                },  
                {
                    name: "Alıcı Sayısı",
                    selector: "receiver_count",
                    sortable: true,
                    width: "100px",
                    cell: params => {
                        return (
                            params.user_id == "all" ? 
                            "Herkes"
                            :
                            params.receiver_count
                        )
                    }
                },                  
                {
                    name: "Gönderim Tarihi",
                    selector: "create_time",
                    sortable: true,
                    center: true,
                    width: "120px",
                    cell: params => {
                        return (
                            moment.unix(params.create_time).format('DD.MM.YYYY HH:mm:ss')
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
        c.post("delete-notification.json", {id: this.state.deletedItemID})
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
              marginBottom="mb-2"
              breadCrumbTitle="Gönderilen Bildirimler"
              breadCrumbParent="Yönetim"
              breadCrumbActive="Sıkça Sorulan Sorular"
              showAddButton={false}
              showCancelButton={addOrEdit}
              onAddButtonClick={() => { this.setState({addOrEdit: true, item: null}) }}
              onCancelButtonClick={() => { this.setState({addOrEdit: false}) }}
          />      
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
