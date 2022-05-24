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


class PrivacyPolicy extends React.Component {

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
                <CardTitle>Gizlilik Sözleşmesi</CardTitle>
                </CardHeader>
                <CardBody>
                {
                isFinished ?
                <Formik
                    initialValues={{
                        privacy_title: item?.privacy_title ?? "",
                        privacy_policy: item?.privacy_policy ?? ""
                    }}
                    onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                            let c = new WebClient();
                            c.post("update-privacy-policy.json", {
                                privacy_title: values.privacy_title,
                                privacy_policy: values.privacy_policy
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

                            <Col sm="4">
                                <FormGroup>
                                <CLabel required for="nameVertical">Başlık</CLabel>
                                <Field
                                    placeholder="Başlık"
                                    name="privacy_title"
                                    value={values.privacy_title}
                                    className={`form-control ${errors.privacy_title && touched.privacy_title && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.privacy_title && touched.privacy_title)} message={errors.privacy_title} />
                                </FormGroup>
                            </Col>                             

                            <Col sm="12" className="mb-2">
                                <CLabel required for="nameVertical">Gizlilik Sözleşmesi</CLabel>
                                <SunEditor 
                                    name="privacy_policy"
                                    setOptions={{
                                        height: 320,
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
                                    setContents={values.privacy_policy}
                                    onChange={(e) => { setFieldValue("privacy_policy", e) }}
                                />
                                <IE show={Boolean(errors.privacy_policy && touched.privacy_policy)} message={errors.privacy_policy} />
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
export default PrivacyPolicy
