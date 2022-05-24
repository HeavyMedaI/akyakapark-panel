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
                <CardTitle>Uygulama Ayarları</CardTitle>
                </CardHeader>
                <CardBody>
                {
                isFinished ?
                <Formik
                    initialValues={{
                        android_maintanence_mode: item?.android_maintenance_mode ?? false,
                        ios_maintanence_mode: item?.ios_maintenance_mode ?? false,
                        maintanence_mode: item?.maintenance_mode ?? false,
                        smtp_host: item?.smtp_host ?? "",
                        smtp_port: item?.smtp_port ?? "",
                        smtp_username: item?.smtp_username ?? "",
                        smtp_password: item?.smtp_password ?? "",
                        app_store_url: item?.app_store_url ?? "",
                        is_register_active: item?.is_register_active ?? false,
                        sms_verification_required: item?.sms_verification_required ?? false,
                        approved_required: item?.approved_required ?? false,
                        google_play_url: item?.google_play_url ?? "",
                    }}
                    onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                            let c = new WebClient();
                            c.post("update-settings.json", {
                                android_maintenance_mode: values.android_maintenance_mode ? 1 : 0,
                                ios_maintenance_mode: values.ios_maintenance_mode ? 1 : 0,
                                maintenance_mode: values.maintenance_mode ? 1 : 0,
                                smtp_host: values.smtp_host,
                                smtp_port: values.smtp_port,
                                smtp_username: values.smtp_username,
                                smtp_password: values.smtp_password,
                                app_store_url: values.app_store_url,
                                google_play_url: values.google_play_url,
                                sms_verification_required: values.sms_verification_required ? 1 : 0,
                                approved_required: values.approved_required ? 1 : 0,
                                is_register_active: values.is_register_active ? 1 : 0
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

                            <Col sm="3">
                                <FormGroup>
                                <CLabel required for="nameVertical">SMTP Host</CLabel>
                                <Field
                                    placeholder="SMTP Host"
                                    name="smtp_host"
                                    value={values.smtp_host}
                                    className={`form-control ${errors.smtp_host && touched.smtp_host && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.smtp_host && touched.smtp_host)} message={errors.smtp_host} />
                                </FormGroup>
                            </Col> 

                            <Col sm="3">
                                <FormGroup>
                                <CLabel required for="nameVertical">SMTP Port</CLabel>
                                <Field
                                    placeholder="SMTP Port"
                                    name="smtp_port"
                                    value={values.smtp_port}
                                    className={`form-control ${errors.smtp_port && touched.smtp_port && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.smtp_port && touched.smtp_port)} message={errors.smtp_port} />
                                </FormGroup>
                            </Col> 

                            <Col sm="3">
                                <FormGroup>
                                <CLabel required for="nameVertical">SMTP Kullanıcı Adı</CLabel>
                                <Field
                                    placeholder="SMTP Kullanıcı Adı"
                                    name="smtp_username"
                                    value={values.smtp_username}
                                    className={`form-control ${errors.smtp_username && touched.smtp_username && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.smtp_username && touched.smtp_username)} message={errors.smtp_username} />
                                </FormGroup>
                            </Col>  

                            <Col sm="3">
                                <FormGroup>
                                <CLabel required for="nameVertical">SMTP Şifre</CLabel>
                                <Field
                                    placeholder="SMTP Şifre"
                                    name="smtp_password"
                                    value={values.smtp_password}
                                    className={`form-control ${errors.smtp_password && touched.smtp_password && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.smtp_password && touched.smtp_password)} message={errors.smtp_password} />
                                </FormGroup>
                            </Col>                                                                                     

                            <Col sm="6">
                                <FormGroup>
                                <CLabel required for="nameVertical">App Store URL</CLabel>
                                <Field
                                    placeholder="App Store URL"
                                    name="app_store_url"
                                    value={values.app_store_url}
                                    className={`form-control ${errors.app_store_url && touched.app_store_url && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.app_store_url && touched.app_store_url)} message={errors.app_store_url} />
                                </FormGroup>
                            </Col> 

                            <Col sm="6">
                                <FormGroup>
                                <CLabel required for="nameVertical">Google Play URL</CLabel>
                                <Field
                                    placeholder="Google Play URL"
                                    name="google_play_url"
                                    value={values.google_play_url}
                                    className={`form-control ${errors.google_play_url && touched.google_play_url && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.google_play_url && touched.google_play_url)} message={errors.google_play_url} />
                                </FormGroup>
                            </Col>                                                                                                                                                                                                                              

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">Bakım Modu (Tüm Platformlar)</CLabel>
                                <CToggle 
                                    name="maintenance_mode"
                                    trueLabel="Aktif"
                                    falseLabel="Pasif"
                                    value={values.maintenance_mode} 
                                    onChange={() => { setFieldValue('maintenance_mode', !values.maintenance_mode) }} />
                                </FormGroup>
                            </Col>    

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">Bakım Modu (Android)</CLabel>
                                <CToggle 
                                    name="android_maintenance_mode"
                                    trueLabel="Aktif"
                                    falseLabel="Pasif"
                                    value={values.android_maintenance_mode} 
                                    onChange={() => { setFieldValue('android_maintenance_mode', !values.android_maintenance_mode) }} />
                                </FormGroup>
                            </Col> 

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">Bakım Modu (iOS)</CLabel>
                                <CToggle 
                                    name="ios_maintenance_mode"
                                    trueLabel="Aktif"
                                    falseLabel="Pasif"
                                    value={values.ios_maintenance_mode} 
                                    onChange={() => { setFieldValue('ios_maintenance_mode', !values.ios_maintenance_mode) }} />
                                </FormGroup>
                            </Col>  

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">Kayıt olma</CLabel>
                                <CToggle 
                                    name="is_register_active"
                                    trueLabel="Aktif"
                                    falseLabel="Pasif"
                                    value={values.is_register_active} 
                                    onChange={() => { setFieldValue('is_register_active', !values.is_register_active) }} />
                                </FormGroup>
                            </Col>

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">SMS Doğrulama</CLabel>
                                <CToggle 
                                    name="sms_verification_required"
                                    trueLabel="Aktif"
                                    falseLabel="Pasif"
                                    value={values.sms_verification_required} 
                                    onChange={() => { setFieldValue('sms_verification_required', !values.sms_verification_required) }} />
                                </FormGroup>
                            </Col>      

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">Üye Başvuruları Onaya Gelsin</CLabel>
                                <CToggle 
                                    name="approved_required"
                                    trueLabel="Evet"
                                    falseLabel="Hayır"
                                    value={values.approved_required} 
                                    onChange={() => { setFieldValue('approved_required', !values.approved_required) }} />
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
