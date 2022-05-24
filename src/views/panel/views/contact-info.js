import React from "react"
import {
    Card,
    CardHeader,
    CardTitle,
    CardBody,
    FormGroup,
    Row,
    Col,
    Button,
    Alert,
    InputGroup,
    InputGroupAddon,
    InputGroupText
} from "reactstrap"
import {
    Edit,
    Trash2,
    ChevronDown,
    Clipboard,
    Printer,
    Download,
    RotateCw,
    X,
    Check
  } from "react-feather"
import Select from "react-select"
import IE from './invalid-tooltip'
import { WebClient } from '../../../utility/webclient'
import Spinner from "../../../components/@vuexy/spinner/in-page-spinner"
import CLabel from './clabel'
import CToggle from './ctoggle'
import { Formik, Field, Form } from "formik"
import * as Yup from "yup"
import { ToastContainer } from "react-toastify"
import { toast } from "react-toastify"
import Checkbox from "../../../components/@vuexy/checkbox/CheckboxesVuexy"
import Radio from "../../../components/@vuexy/radio/RadioVuexy"
import "react-toastify/dist/ReactToastify.css"
import "../../../assets/scss/plugins/extensions/toastr.scss"
import ImageFileUpload from './image-file-upload'
import SunEditor, { buttonList } from 'suneditor-react';
import 'suneditor/dist/css/suneditor.min.css';


class Settings extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            result: {
              show: false,
              status: false,
              message: null
            },
            discounts: [],
            item: null,
            isFinished: false,
            message: null,
            notFound: false,
            companies: [],
            quizes: [],
            base64: [],
            selectedOption: -1
          }
    }

    componentDidMount() {
        this._getList();
    }

    async _getList() {
        let c = new WebClient();
        await c.post("get-settings.json", {})
        .then(({status, message, data}) => {
            this.setState({isFinished: true, notFound: !status, message: message, item: data})
        })
    } 

  render() {
      const { isFinished, message, notFound, base64, item, quizes } = this.state
    return (
      <React.Fragment>
        <Row>
          <Col lg="12" md="12">
            <Card>
                <CardHeader>
                <CardTitle>İletişim Bilgileri</CardTitle>
                </CardHeader>
                <CardBody>
                {
                isFinished ?
                <Formik
                    initialValues={{
                        about: item?.about ?? "",
                        website: item?.website ?? "",
                        contact_phone: item?.contact_phone ?? "",
                        contact_email: item?.contact_email ?? "",
                        address: item?.address ?? "",
                    }}
                    onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                            let c = new WebClient();
                            c.post("update-contact-info.json", {
                                about: values.about,
                                website: values.website,
                                contact_phone: values.contact_phone,
                                contact_email: values.contact_email,
                                address: values.address
                            })
                            .then(({status, message, data}) => {

                                if (status) {
                                    toast.success(message)
                                    // this._getList();
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

                            <Col sm="12" className="mb-2">
                                <CLabel required for="nameVertical">Uygulama Hakkında</CLabel>
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
                                <IE show={Boolean(errors.about && touched.about)} message={errors.about} />
                            </Col> 

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">E-Posta Adresi</CLabel>
                                <Field
                                    placeholder="E-Posta Adresi"
                                    name="contact_email"
                                    value={values.contact_email}
                                    className={`form-control ${errors.contact_email && touched.contact_email && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.contact_email && touched.contact_email)} message={errors.contact_email} />
                                </FormGroup>
                            </Col> 

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">Telefon Numarası</CLabel>
                                <Field
                                    placeholder="Telefon Numarası"
                                    name="contact_phone"
                                    value={values.contact_phone}
                                    className={`form-control ${errors.contact_phone && touched.contact_phone && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.contact_phone && touched.contact_phone)} message={errors.contact_phone} />
                                </FormGroup>
                            </Col>  

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">Web Sitesi</CLabel>
                                <Field
                                    placeholder="Web Sitesi"
                                    name="website"
                                    value={values.website}
                                    className={`form-control ${errors.website && touched.website && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.website && touched.website)} message={errors.website} />
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
                :
                (
                notFound ?
                <Alert color="warning">{message}</Alert>
                :
                <Spinner />
                )
                }
                </CardBody>
            </Card>
          </Col>
        </Row>
      </React.Fragment>
    )
  }
}
export default Settings
