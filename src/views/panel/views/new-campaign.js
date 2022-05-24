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

import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss"

import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

let defaultPosition = {
    lat: 40.992926,
    lng: 29.1230032
  };

let columns = []

const formSchema = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    category_ids: Yup.array().required("Lütfen en az 1 tane kategori seçin!"),
    store_id: Yup.object().typeError("Lütfen mağaza seçin!").required("Lütfen mağaza seçin!"),
    discount_type: Yup.object().typeError("Lütfen indirim tipi seçin!").required("Lütfen indirim tipi seçin!"),
    image: Yup.array().typeError("Kapak fotoğrafı eklemeniz zorunludur!").required("Kapak fotoğrafı eklemeniz zorunludur!"),
    about: Yup.string().required(messages.required_field),
    discount: Yup.number().typeError(messages.required_field).required(messages.required_field).integer(messages.invalid_number),
    limit: Yup.number().typeError(messages.required_field).integer(messages.invalid_number)
        .test("test", "Minimum alışveriş tutarı indirim tutarından küçük olamaz.", function(value) {
            if (this.parent.discount_type?.value != 3) return true
            let v = value ?? 0
            let y = this.parent?.discount ?? 0
            if (y >= v) return false

            return true
        }),
    old_price: Yup.number().typeError(messages.required_field)
        .test("test", "İndirim tutarı eski fiyattan fazla olamaz!", function(value) {
            if (this.parent.discount_type?.value != 5) return true
            let v = value ?? 0
            let y = this.parent?.discount ?? 0
            if (y >= v) return false

            return true
        }),
    gift: Yup.string().typeError(messages.required_field)
        .test("test", "Lütfen hediye ürün adını yazın.", function(value) {
            if (this.parent.discount_type?.value != 4) return true
            if (value?.length <= 4) return false

            return true
        })
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

const discount_types = [
    {value: 2, label: "Yüzde (Sipariş tutarından belirttiğiniz oranda indirim yapılır)"},
    {value: 3, label: "Tutar (Sipariş tutarından belirttiğiniz tutarda indirim yapılır)"},
    {value: 4, label: "Hediye Ürün"},
    {value: 5, label: "Özel Fiyat (Kampanyaya özel fiyat belirtmenizi sağlar. Eski fiyattan indirim tutarını düşerek kullanıcıya gösterir)"},
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
            showLocationModal: false,
            item: null,
            formId: 0,
            list: [],
            base64: [],
            address: null,
            latitude: 0,
            longitude: 0,
            event_categories: [],
            venues: []
      }
    }

    componentDidMount() {
        this._getResources();
        // this._getList();
    }

    _getResources() {

        let c = new WebClient();
        c.post("get-select-resources.json",
            {
                campaign_category: true,
                store: true
            })
        .then(({status, message, data}) => {

            if (status) {
                this.setState({campaign_categories: data.campaign_categories, stores: data.stores})
            }
        })
    }

    render() {
        const { member } = this.props
        const { list, finished, addOrEdit, item, editing, base64, campaign_categories, stores } = this.state

        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom="mb-2"
                breadCrumbTitle="Yeni Kampanya"
                breadCrumbParent="İçerik Yönetimi"
                breadCrumbActive="Haberler"
                showAddButton={false}
                showCancelButton={addOrEdit}
                onAddButtonClick={() => { this.setState({addOrEdit: true, item: null}) }}
                onCancelButtonClick={() => { this.setState({addOrEdit: false, base64: []}) }}
            />
            </Col>


            <Col lg="12" md="12">
                <Card>
                    <CardBody>
                    <Formik
                        innerRef={(e) => { this.formik = e }}
                        initialValues={{
                            image: null,
                            title: "",
                            about: "",
                            status: true,
                            discount: 0,
                            limit: 0,
                            old_price: 0,
                            gift: "",
                            category_ids: [],
                            discount_type: discount_types[0],
                            store_id: "",
                            special_text: ""
                        }}
                        validationSchema={formSchema}
                        onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                let c = new WebClient();
                                c.post("add-campaign.json", {
                                    title: values.title,
                                    about: values.about,
                                    discount: values.discount,
                                    category_ids: JSON.stringify(values.category_ids),
                                    store_id: values.store_id.value,
                                    status: values.status ? 1 : 0,
                                    discount_type: values.discount_type.value,
                                    limit: values.limit,
                                    gift: values.gift,
                                    old_price: values.old_price,
                                    special_text: values.special_text,
                                    image: base64.length == 0 ? null : base64[0]
                                })
                                .then(({status, message, data}) => {

                                    if (status) {
                                        toast.success(message)
                                        history.push("/campaigns")
                                    } else {
                                        toast.error(message)
                                        setSubmitting(false)
                                    }
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
                                <CLabel required for="EmailVertical">Mağaza</CLabel>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    className={`form-control no-padding ${errors.store_id && touched.store_id && "is-invalid z-ind"}`}
                                    classNamePrefix="select"
                                    placeholder="Seçiniz..."
                                    onChange={(e) => {
                                        setFieldValue("store_id", e)
                                    }}
                                    value={values.store_id}
                                    name="store_id"
                                    options={stores}
                                />
                                <IE show={Boolean(errors.store_id && touched.store_id)} message={errors.store_id} />
                                </FormGroup>
                            </Col>

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Kampanya Adı veya Ürün Adı</CLabel>
                                <Field
                                    placeholder="Kampanya Adı veya Ürün Adı"
                                    name="title"
                                    value={values.title}
                                    className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                </FormGroup>
                            </Col>

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="EmailVertical">İndirim Tipi</CLabel>
                                <Select
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                                    className={`form-control no-padding ${errors.discount_type && touched.discount_type && "is-invalid z-ind"}`}
                                    classNamePrefix="select"
                                    placeholder="Seçiniz..."
                                    onChange={(e) => {
                                        setFieldValue("discount_type", e)
                                    }}
                                    value={values.discount_type}
                                    name="discount_type"
                                    options={discount_types}
                                />
                                <IE show={Boolean(errors.discount_type && touched.discount_type)} message={errors.discount_type} />
                                </FormGroup>
                            </Col>

                            {
                            values.discount_type?.value == 5 && (
                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Eski Fiyat</CLabel>
                                <Field
                                    placeholder="Eski Fiyat"
                                    name="old_price"
                                    value={values.old_price}
                                    className={`form-control ${errors.old_price && touched.old_price && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.old_price && touched.old_price)} message={errors.old_price} />
                                </FormGroup>
                            </Col>
                            )
                            }

                            {
                            (values.discount_type?.value != 1 && values.discount_type?.value != 4) && (
                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">{values.discount_type.value == 2 ? "İndirim Oranı" : "İndirim Tutarı"}</CLabel>
                                <Field
                                    placeholder="İndirim Oranı"
                                    name="discount"
                                    value={values.discount}
                                    className={`form-control ${errors.discount && touched.discount && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.discount && touched.discount)} message={errors.discount} />
                                </FormGroup>
                            </Col>
                            )
                            }

                            {
                            values.discount_type?.value == 3 && (
                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Minimum Alışveriş Tutarı</CLabel>
                                <Field
                                    placeholder="Minimum Alışveriş Tutarı"
                                    name="limit"
                                    value={values.limit}
                                    className={`form-control ${errors.limit && touched.limit && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.limit && touched.limit)} message={errors.limit} />
                                </FormGroup>
                            </Col>
                            )
                            }

                            {
                            values.discount_type?.value == 4 && (
                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Hediye Ürün Adı</CLabel>
                                <Field
                                    placeholder="Hediye Ürün Adı"
                                    name="gift"
                                    value={values.gift}
                                    className={`form-control ${errors.gift && touched.gift && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.gift && touched.gift)} message={errors.gift} />
                                </FormGroup>
                            </Col>
                            )
                            }

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Özel Durum (Varsa belirtiniz.)</CLabel>
                                <Field
                                    placeholder="Özel Durum"
                                    name="special_text"
                                    value={values.special_text}
                                    className={`form-control ${errors.special_text && touched.special_text && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.special_text && touched.special_text)} message={errors.special_text} />
                                </FormGroup>
                                <p>* Örnek; "Haftasonu Geçerli", "Öğlen 12:00 - 14:00 saatleri arasında geçerli" gibi</p>
                            </Col>

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="EmailVertical">Kategori</CLabel>
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
                                    options={campaign_categories}
                                />
                                <IE show={Boolean(errors.category_ids && touched.category_ids)} message={errors.category_ids} />
                                </FormGroup>
                            </Col>

                            <Col sm="12" className="mb-2">
                                <CLabel required for="nameVertical">Kampanya Hakkında</CLabel>
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
