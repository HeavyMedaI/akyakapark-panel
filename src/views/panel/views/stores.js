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
    category_ids: Yup.array().required("Lütfen en az 1 tane kategori seçin!"),
    image: Yup.array().typeError("Kapak fotoğrafı eklemeniz zorunludur!").required("Kapak fotoğrafı eklemeniz zorunludur!"),
    about: Yup.string().required(messages.required_field),
})

const formSchemaEdit = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    category_ids: Yup.array().required("Lütfen en az 1 tane kategori seçin!"),
    about: Yup.string().required(messages.required_field),
})

const types = [
    {value: 1, label: "Metin"},
    {value: 2, label: "Dış Bağlantı"}
]

class Stores extends React.Component {

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
            showLocationModal: false,
            item: null,
            formId: 0,
            list: [],
            base64: [],
            address: null,
            latitude: 0,
            longitude: 0,
            store_categories: []
      }
    }

    componentDidMount() {
        this._getResources();
        this._getList();
    }

    _getResources() {

        let c = new WebClient();
        c.post("get-select-resources.json", {store_category: true})
        .then(({status, message, data}) => {

            if (status) {
                this.setState({store_categories: data.store_categories})
            }
        })
    }

    async _getList() {
        let c = new WebClient();
        await c.post("get-store-list.json", {})
        .then(({status, message, data}) => {

            columns = [
                {
                    name: "Resim",
                    selector: "cover_image",
                    width: "140px",
                    cell: params => {
                      return (
                          <div style={{ width: "100%", height: "90%", backgroundColor: '#f1f1f1', backgroundImage: `url('${constants.base_img+params.cover_image}')`, backgroundPosition: 'center', backgroundSize: 'cover', backgroundRepeat: 'no-repeat' }}>

                          </div>
                      )
                    }

                },
                {
                    name: "Mağaza Adı",
                    selector: "title",
                    sortable: true,
                    wrap: true
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
                            onClick={() => { history.push(`/store-images/${params.id}`) }}
                            color="primary"
                        >
                            {params.image_count}
                        </Button>
                        )
                    }
                },
                {
                    name: "Sıra Numarası",
                    selector: "order_number",
                    width: "180px",
                    center: true,
                    sortable: true
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
        c.post("delete-store.json", {id: this.state.deletedItemID})
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
        c.post("clear-photo.json", {id, path, source: "v"})
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
        const { list, finished, addOrEdit, item, editing, base64, store_categories } = this.state

        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom=""
                breadCrumbTitle="Mağazalar"
                breadCrumbParent="Mağaza & Etkinlikler"
                breadCrumbActive="Mağazalar"
                showAddButton={!addOrEdit}
                showCancelButton={addOrEdit}
                onAddButtonClick={() => { this.setState({addOrEdit: true, item: {}}) }}
                onCancelButtonClick={() => { this.setState({addOrEdit: false, base64: []}) }}
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
                                order_number: item?.order_number ?? "",
                                daily_limit: item.daily_limit ?? 0.0,
                                weekly_limit: item.weekly_limit ?? 0.0,
                                monthly_limit: item.monthly_limit ?? 0.0,
                                comission_rate: item.comission_rate ?? 0.0,
                                contact_phone: item?.contact_phone ?? "",
                                contact_email: item?.contact_email ?? "",
                                address: item?.address ?? "",
                                external_link: item?.external_link ?? "",
                                status: item?.status ?? true,
                                category_ids: JSON.parse(item?.category_ids ?? "[]")
                            }}
                            validationSchema={item != null ? formSchemaEdit : formSchema}
                            onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                    let c = new WebClient();
                                    c.post("add-store.json", {
                                        id: item?.id ?? -1,
                                        title: values.title,
                                        about: values.about,
                                        external_link: values.external_link,
                                        latitude: values.latitude,
                                        longitude: values.longitude,
                                        order_number: values.order_number,
                                        daily_limit: values.daily_limit,
                                        weekly_limit: values.weekly_limit,
                                        monthly_limit: values.monthly_limit,
                                        comission_rate: values.comission_rate,
                                        contact_phone: values.contact_phone,
                                        contact_email: values.contact_email,
                                        address: values.address,
                                        category_ids: JSON.stringify(values.category_ids),
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
                                    <CLabel required for="nameVertical">Mağaza Adı</CLabel>
                                    <Field
                                        placeholder="Mağaza Adı"
                                        name="title"
                                        value={values.title}
                                        className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                    </FormGroup>
                                </Col>

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="EmailVertical">Mağaza Kategorisi</CLabel>
                                    <Select
                                        menuPortalTarget={document.body}
                                        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                        className={`form-control no-padding ${errors.category_ids && touched.category_ids && "is-invalid z-ind"}`}
                                        classNamePrefix="select"
                                        placeholder="Seçiniz..."
                                        isMulti={true}
                                        onChange={(e) => {
                                            setFieldValue("category_ids", e)
                                        }}
                                        value={values.category_ids}
                                        name="category_ids"
                                        options={store_categories}
                                    />
                                    <IE show={Boolean(errors.category_ids && touched.category_ids)} message={errors.category_ids} />
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
                                        Lokasyon Seç
                                    </Button.Ripple>
                                    </FormGroup>
                                </Col>

                                <Col sm="12" className="mb-2">
                                    <CLabel required for="nameVertical">Mağaza Hakkında</CLabel>
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
                                    <FormGroup>
                                    <CLabel required for="external_link">Dış Bağlantı</CLabel>
                                    <Field
                                        placeholder="Dış Bağlantı"
                                        name="external_link"
                                        value={values.external_link}
                                        className={`form-control ${errors.external_link && touched.external_link && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.external_link && touched.external_link)} message={errors.external_link} />
                                    </FormGroup>
                                </Col>

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

                                <Col sm="2">
                                    <FormGroup>
                                    <CLabel required for="order_number">Sıra Numarası</CLabel>
                                    <Field
                                        type={"number"} min="1" step="1"
                                        placeholder="Sıra Numarası"
                                        name="order_number"
                                        value={values.order_number}
                                        className={`form-control ${errors.order_number && touched.order_number && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.order_number && touched.order_number)} message={errors.order_number} />
                                    </FormGroup>
                                </Col>
                                <Col sm="2">
                                    <FormGroup>
                                        <CLabel required for="daily_limit">Günlük Limit</CLabel>
                                        <Field
                                            type={"number"} min="0.01" step=".01"
                                            placeholder="Günlük Limit"
                                            name="daily_limit"
                                            value={values.daily_limit}
                                            className={`form-control ${errors.daily_limit && touched.daily_limit && "is-invalid"}`}
                                        />
                                        <IE show={Boolean(errors.daily_limit && touched.daily_limit)} message={errors.daily_limit} />
                                    </FormGroup>
                                </Col>
                                <Col sm="2">
                                    <FormGroup>
                                        <CLabel required for="weekly_limit">Haftalık Limit</CLabel>
                                        <Field
                                            type={"number"} min="0.01" step=".01"
                                            placeholder="Haftalık Limit"
                                            name="weekly_limit"
                                            value={values.weekly_limit}
                                            className={`form-control ${errors.weekly_limit && touched.weekly_limit && "is-invalid"}`}
                                        />
                                        <IE show={Boolean(errors.weekly_limit && touched.weekly_limit)} message={errors.weekly_limit} />
                                    </FormGroup>
                                </Col>
                                <Col sm="2">
                                    <FormGroup>
                                        <CLabel required for="monthly_limit">Aylık Limit</CLabel>
                                        <Field
                                            type={"number"} min="0.01" step=".01"
                                            placeholder="Aylık Limit"
                                            name="monthly_limit"
                                            value={values.monthly_limit}
                                            className={`form-control ${errors.monthly_limit && touched.monthly_limit && "is-invalid"}`}
                                        />
                                        <IE show={Boolean(errors.monthly_limit && touched.monthly_limit)} message={errors.monthly_limit} />
                                    </FormGroup>
                                </Col>
                                <Col sm="2">
                                    <FormGroup>
                                        <CLabel required for="comission_rate">Hediye Puan Oranı</CLabel>
                                        <Field
                                            type={"number"} min="0.01" step=".01"
                                            placeholder="Hediye Puan Oranı"
                                            name="comission_rate"
                                            value={values.comission_rate}
                                            className={`form-control ${errors.comission_rate && touched.comission_rate && "is-invalid"}`}
                                        />
                                        <IE show={Boolean(errors.comission_rate && touched.comission_rate)} message={errors.comission_rate} />
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

export default connect(msp)(Stores)
