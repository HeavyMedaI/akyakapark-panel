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
    // store_id: Yup.object().typeError("Lütfen etkinliğin yapılacağı tesisi seçin!").required("Lütfen etkinliğin yapılacağı tesisi seçin!"),
    preview_image: Yup.array().typeError("Önizleme fotoğrafı eklemeniz zorunludur!").required("Önizleme fotoğrafı eklemeniz zorunludur!"),
    cover_image: Yup.array().typeError("Kapak fotoğrafı eklemeniz zorunludur!").required("Kapak fotoğrafı eklemeniz zorunludur!"),
    event_start_date: Yup.number().typeError("Lütfen başlangıç ve bitiş tarihini seçin!").required("Lütfen başlangıç ve bitiş tarihini seçin!"),
    event_end_date: Yup.number().typeError("Lütfen başlangıç ve bitiş tarihini seçin!").required("Lütfen başlangıç ve bitiş tarihini seçin!"),
    about: Yup.string().required(messages.required_field),
    // image: Yup.object().shape({
    //     cover: Yup.array().typeError("Kapak fotoğrafı eklemeniz zorunludur!").required("Kapak fotoğrafı eklemeniz zorunludur!"),
    //     preview: Yup.array().typeError("Önizleme fotoğrafı eklemeniz zorunludur!").required("Önizleme fotoğrafı eklemeniz zorunludur!")
    // }),
});

const formSchemaEdit = Yup.object().shape({
    title: Yup.string().required(messages.required_field),
    category_ids: Yup.array().required("Lütfen en az 1 tane kategori seçin!"),
    about: Yup.string().required(messages.required_field),
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
            showLocationModal: false,
            item: null,
            formId: 0,
            list: [],
            cover_image_base64: [],
            preview_image_base64: [],
            address: null,
            latitude: 0,
            longitude: 0,
            event_categories: [],
            stores: []
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
                event_category: true,
                store: true
            })
        .then(({status, message, data}) => {

            if (status) {
                this.setState({event_categories: data.event_categories, stores: data.stores})
            }
        })
    }

    async _getList() {
        let c = new WebClient();
        await c.post("get-event-list.json", {})
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
                    name: "Tesis Adı",
                    selector: "title",
                    sortable: true,
                    wrap: true
                },
                {
                    name: "Dış Bağlantılar",
                    selector: "link_count",
                    width: "80px",
                    center: true,
                    cell: params => {
                        return (
                        <Button
                            className="btn"
                            onClick={() => { history.push(`/event-links/${params.id}`) }}
                            color="primary"
                        >
                            {params.link_count}
                        </Button>
                        )
                    }
                },
                {
                    name: "Başlama Tarihi",
                    selector: "event_start_date",
                    width: "140px",
                    center: true,
                    sortable: true,
                    cell: params => {
                        return (
                            <p>{moment.unix(params.event_start_date).format('DD.MM.YYYY HH:mm')}</p>
                        )
                    }
                },
                {
                    name: "Bitiş Tarihi",
                    selector: "event_start_date",
                    width: "140px",
                    center: true,
                    sortable: true,
                    cell: params => {
                        return (
                            <p>{moment.unix(params.event_end_date).format('DD.MM.YYYY HH:mm')}</p>
                        )
                    }
                },
                {
                    name: "Durum",
                    selector: "status",
                    center: true,
                    width: "160px",
                    cell: params => {
                        return (
                            <div style={{ width: "100%", height: "100%", display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-evenly' }}>
                            <div className={`badge badge-pill badge-light-${params.status == 1 ? "success" : "danger"}`}>{params.status == 1 ? "Aktif" : "Pasif"}`</div>
                            {
                            params.free_of_charge == 1 && (
                                <div className={`badge badge-pill badge-light-success`}>Ücretsiz</div>
                            )
                            }
                            {
                            params.to_everybody == 1 && (
                                <div className={`badge badge-pill badge-light-success`}>Herkes Katılabilir</div>
                            )
                            }

                            </div>
                        )
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

            this.setState({finished: true, addOrEdit: false, cover_image_base64: [], preview_image_base64: [], list: data})
        })
    }

    _deleteItem(deletedItemID) {
        this.setState({showAlert: true, deletedItemID})
    }

    _delete() {
        this.setState({showAlert: false})
        let c = new WebClient();
        c.post("delete-event.json", {id: this.state.deletedItemID})
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
        const { list, finished, addOrEdit, item, editing, cover_image_base64, preview_image_base64, event_categories, stores } = this.state

        return (
            <Row className="app-user-list">
            <Col sm="12">
            <Breadcrumbs
                marginBottom="mb-2"
                breadCrumbTitle="Etkinlikler"
                breadCrumbParent="İçerik Yönetimi"
                breadCrumbActive="Haberler"
                showAddButton={!addOrEdit}
                showCancelButton={addOrEdit}
                onAddButtonClick={() => { this.setState({addOrEdit: true, item: null}) }}
                onCancelButtonClick={() => { this.setState({addOrEdit: false, cover_image_base64: [], preview_image_base64: []}) }}
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
                                cover_image: null,
                                preview_image: null,
                                title: item?.title ?? "",
                                about: item?.about ?? "",
                                event_start_date: item?.event_start_date ?? "",
                                event_end_date: item?.event_end_date ?? "",
                                status: item?.status ?? true,
                                free_of_charge: item?.free_of_charge ?? true,
                                to_everybody: item?.to_everybody ?? true,
                                category_ids: JSON.parse(item?.category_ids ?? "[]"),
                                // store_id: stores.filter(x => x.value == item?.store_id)?.length > 0 ? stores.filter(x => x.value == item?.store_id)[0] : ""
                            }}
                            validationSchema={item != null ? formSchemaEdit : formSchema}
                            onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                                    let c = new WebClient();
                                    c.post("add-event.json", {
                                        id: item?.id ?? -1,
                                        title: values.title,
                                        about: values.about,
                                        event_start_date: values.event_start_date,
                                        event_end_date: values.event_end_date,
                                        category_ids: JSON.stringify(values.category_ids),
                                        // store_id: values.store_id.value,
                                        status: values.status ? 1 : 0,
                                        to_everybody: values.to_everybody ? 1 : 0,
                                        free_of_charge: values.free_of_charge ? 1 : 0,
                                        cover_image: cover_image_base64.length == 0 ? null : cover_image_base64[0],
                                        preview_image: preview_image_base64.length == 0 ? null : preview_image_base64[0],
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
                                    item != null && item?.cover_image?.length > 0 && (<Col sm="4">
                                        <h6>Tanımlı Kapak Fotoğrafı</h6>
                                        <img className="mb-2" src={constants.base_img + item.cover_image} style={{ width: "100%", height: "auto" }} />
                                    </Col>)
                                }

                                {
                                    item != null && item?.preview_image?.length > 0 && (<Col sm="4">
                                        <h6>Tanımlı Önizleme Fotoğrafı</h6>
                                        <img className="mb-2" src={constants.base_img + item.preview_image} style={{ width: "100%", height: "auto" }} />
                                    </Col>)
                                }

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Etkinlik Adı</CLabel>
                                    <Field
                                        placeholder="Etkinlik Adı"
                                        name="title"
                                        value={values.title}
                                        className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                    />
                                    <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                    </FormGroup>
                                </Col>

                                {/*<Col sm="12">*/}
                                {/*    <FormGroup>*/}
                                {/*    <CLabel required for="EmailVertical">Etkinliğin Yapılacağı Tesis</CLabel>*/}
                                {/*    <Select*/}
                                {/*        menuPortalTarget={document.body}*/}
                                {/*        styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}*/}
                                {/*        className={`form-control no-padding ${errors.store_id && touched.store_id && "is-invalid z-ind"}`}*/}
                                {/*        classNamePrefix="select"*/}
                                {/*        placeholder="Seçiniz..."*/}
                                {/*        onChange={(e) => {*/}
                                {/*            setFieldValue("store_id", e)*/}
                                {/*        }}*/}
                                {/*        value={values.store_id}*/}
                                {/*        name="store_id"*/}
                                {/*        options={stores}*/}
                                {/*    />*/}
                                {/*    <IE show={Boolean(errors.store_id && touched.store_id)} message={errors.store_id} />*/}
                                {/*    </FormGroup>*/}
                                {/*</Col>*/}

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="EmailVertical">Etkinlik Kategorisi</CLabel>
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
                                        options={event_categories}
                                    />
                                    <IE show={Boolean(errors.category_ids && touched.category_ids)} message={errors.category_ids} />
                                    </FormGroup>
                                </Col>

                                <Col sm="12">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Etkinlik Başlangıç ve Bitişi</CLabel>
                                    <Flatpickr
                                        className={`form-control ${errors.event_start_date && touched.event_start_date && "is-invalid"}`}
                                        name="date"
                                        placeholder="Etkinlik Başlangıç ve Bitişi"
                                        options={{
                                            locale: Turkish,
                                            dateFormat: 'd-m-Y H:i',
                                            enableTime: true,
                                            mode: 'range',
                                            minDate: 'today',
                                            defaultDate: item != null ? [new Date(values.event_start_date * 1000), new Date(values.event_end_date * 1000)] : []
                                        }}
                                        onChange={date => {
                                            if (date.length > 1) {
                                                let start = moment(date[0]).format('x') / 1000
                                                let end = moment(date[1]).format('x') / 1000
                                                setFieldValue('event_start_date', start)
                                                setFieldValue('event_end_date', end)
                                            }
                                        }}
                                    />
                                    </FormGroup>
                                    {
                                    Boolean(touched.event_start_date && errors.event_start_date) && (
                                    <p style={{ color: 'red', fontSize: 12 }}>{errors.event_start_date}</p>
                                    )
                                    }
                                </Col>

                                <Col sm="12" className="mb-2">
                                    <CLabel required for="nameVertical">Etkinlik Hakkında</CLabel>
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

                                <Col sm="6">
                                    <ImageFileUpload
                                        title="Kapak Fotoğrafı"
                                        subTitle="Kapak fotoğrafı seçmek için buraya tıklayın."
                                        error={Boolean(errors.cover_image && touched.cover_image)}
                                        errorMessage={errors.cover_image}
                                        base64={cover_image_base64}
                                        disabled={cover_image_base64.length >= 1 ? true : false}
                                        showError={(e) => { toast.error(e) }}
                                        showSuccess={(e) => { toast.success(e) }}
                                        onAddImage={(e) => {
                                            let a = [...cover_image_base64]
                                            a.push(e)
                                            setFieldValue("cover_image", a)
                                            this.setState({cover_image_base64: a})
                                        }}
                                        onRemoveImage={(e) => {
                                            setFieldValue("cover_image", null)
                                            this.setState({cover_image_base64: []})
                                        }}
                                    />
                                </Col>

                                <Col sm="6">
                                    <ImageFileUpload
                                        title="Önizleme Fotoğrafı"
                                        subTitle="Önizleme fotoğrafı seçmek için buraya tıklayın."
                                        error={Boolean(errors.preview_image && touched.preview_image)}
                                        errorMessage={errors.preview_image}
                                        base64={preview_image_base64}
                                        disabled={preview_image_base64.length >= 1 ? true : false}
                                        showError={(e) => { toast.error(e) }}
                                        showSuccess={(e) => { toast.success(e) }}
                                        onAddImage={(e) => {
                                            let a = [...preview_image_base64]
                                            a.push(e)
                                            setFieldValue("preview_image", a)
                                            this.setState({preview_image_base64: a})
                                        }}
                                        onRemoveImage={(e) => {
                                            setFieldValue("preview_image", null)
                                            this.setState({preview_image_base64: []})
                                        }}
                                    />
                                </Col>

                                <Col sm="4">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Ücretsiz</CLabel>
                                    <CToggle
                                        name="free_of_charge"
                                        trueLabel="Evet"
                                        falseLabel="Hayır"
                                        value={values.free_of_charge}
                                        onChange={() => { setFieldValue('free_of_charge', !values.free_of_charge) }} />
                                    </FormGroup>
                                </Col>

                                <Col sm="4">
                                    <FormGroup>
                                    <CLabel required for="nameVertical">Herkes katılabilir</CLabel>
                                    <CToggle
                                        name="to_everybody"
                                        trueLabel="Evet"
                                        falseLabel="Hayır"
                                        value={values.to_everybody}
                                        onChange={() => { setFieldValue('to_everybody', !values.to_everybody) }} />
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
