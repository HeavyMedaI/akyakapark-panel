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
                <CardTitle>Sosyal Medya Linkleri <br /> <span style={{ fontSize: '0.8rem', color: 'red' }}>* karakteri bulunan alanların doldurulması zorunludur</span> </CardTitle>
                </CardHeader>
                <CardBody>
                {
                isFinished ?
                <Formik
                    initialValues={{
                        facebook: item?.facebook ?? "",
                        twitter: item?.twitter ?? "",
                        instagram: item?.instagram ?? "",
                        linkedin: item?.linkedin ?? "",
                        youtube: item?.youtube ?? "",
                        tiktok: item?.tiktok ?? "",
                    }}
                    onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                            let c = new WebClient();
                            c.post("update-social-media-links.json", {
                                linkedin: values.linkedin,
                                facebook: values.facebook,
                                twitter: values.twitter,
                                instagram: values.instagram,
                                youtube: values.youtube,
                                tiktok: values.tiktok
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

                            <Col sm="6">
                                <FormGroup>
                                <CLabel required for="nameVertical">Facebook</CLabel>
                                <Field
                                    placeholder="Facebook"
                                    name="facebook"
                                    value={values.facebook}
                                    className={`form-control ${errors.facebook && touched.facebook && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.facebook && touched.facebook)} message={errors.facebook} />
                                </FormGroup>
                            </Col> 

                            <Col sm="6">
                                <FormGroup>
                                <CLabel required for="nameVertical">Twitter</CLabel>
                                <Field
                                    placeholder="Twitter"
                                    name="twitter"
                                    value={values.twitter}
                                    className={`form-control ${errors.twitter && touched.twitter && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.twitter && touched.twitter)} message={errors.twitter} />
                                </FormGroup>
                            </Col> 

                            <Col sm="6">
                                <FormGroup>
                                <CLabel required for="nameVertical">Instagram</CLabel>
                                <Field
                                    placeholder="Instagram"
                                    name="instagram"
                                    value={values.instagram}
                                    className={`form-control ${errors.instagram && touched.instagram && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.instagram && touched.instagram)} message={errors.instagram} />
                                </FormGroup>
                            </Col>  

                            <Col sm="6">
                                <FormGroup>
                                <CLabel required for="nameVertical">LinkedIn</CLabel>
                                <Field
                                    placeholder="LinkedIn"
                                    name="linkedin"
                                    value={values.linkedin}
                                    className={`form-control ${errors.linkedin && touched.linkedin && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.linkedin && touched.linkedin)} message={errors.linkedin} />
                                </FormGroup>
                            </Col>    

                            <Col sm="6">
                                <FormGroup>
                                <CLabel required for="nameVertical">Youtube</CLabel>
                                <Field
                                    placeholder="Youtube"
                                    name="youtube"
                                    value={values.youtube}
                                    className={`form-control ${errors.youtube && touched.youtube && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.youtube && touched.youtube)} message={errors.youtube} />
                                </FormGroup>
                            </Col>  

                            <Col sm="6">
                                <FormGroup>
                                <CLabel required for="nameVertical">TikTok</CLabel>
                                <Field
                                    placeholder="TikTok"
                                    name="tiktok"
                                    value={values.tiktok}
                                    className={`form-control ${errors.tiktok && touched.tiktok && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.tiktok && touched.tiktok)} message={errors.tiktok} />
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
