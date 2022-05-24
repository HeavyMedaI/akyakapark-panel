import React from "react"
import { Link } from "react-router-dom"
import { CardBody, FormGroup, Input, Button, Label, Alert } from "reactstrap"
import Checkbox from "../../../../components/@vuexy/checkbox/CheckboxesVuexy"
import { Mail, Lock, Check } from "react-feather"
import { loginWithJWT } from "../../../../redux/actions/auth/loginActions"
import * as Redux from '../../../../utility/redux'
import { connect } from "react-redux"
import { history } from "../../../../history"
import { WebClient } from '../../../../utility/webclient'
import { Formik, Field, Form } from "formik"
import * as Yup from "yup"
import { ToastContainer } from "react-toastify"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../../assets/scss/plugins/extensions/toastr.scss"

const formSchema = Yup.object().shape({
  address: Yup.string().required("Lütfen kullanıcı adınızı yazınız."),
  pass: Yup.string().required("Lütfen şifrenizi yazınız.")
})

class LoginJWT extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      result: {
        show: false,
        status: false,
        message: null
      }
    }
  }

  componentDidMount() {

  }

  render() {

    const { result } = this.state

    return (
      <React.Fragment>
        <div className="p-1">
        <Formik
            initialValues={{
              address: localStorage.getItem("username") ?? "",
              pass: localStorage.getItem("password") ?? "",
              remember_me: localStorage.getItem("username") !== null ? true : false
            }}
            validationSchema={formSchema}
            onSubmit={(values, {setSubmitting, resetForm, setError}) => {
                setSubmitting(true)

                let c = new WebClient();
                c.post("login.json", {
                  email: values.address,
                  password: values.pass
                })
                .then(({status, message, data}) => {

                    console.log(status);
                    console.log(message);
                    console.log(data);

                    if (status) {

                      if (values.remember_me) {
                        localStorage.setItem("username", values.address)
                        localStorage.setItem("password", values.pass)
                      }

                      // toast.success(message)
                      // this.props.loginWithJWT(data, "/", values.remember_me)
                      Redux.setMemberData(data)
                    } else {
                      toast.error(message)
                      setSubmitting(false)
                    }
                })
                .catch((error) => {
                  setSubmitting(false)
                  toast.error("Beklenmeyen bir hata oluştu. Lütfen daha sonra tekrar deneyin.")
                })
            }}
          >
            {({ errors, touched, values, isSubmitting, handleChange, handleBlur, setFieldValue }) => (
              <Form noValidate={true} autoComplete="off">
                <FormGroup className="form-label-group position-relative has-icon-left">
                  <Field
                    name="address"
                    type="email"
                    placeholder="E-Posta Adresi"
                    value={values.address}
                    className={`form-control ${errors.address && touched.address ? "is-invalid" : ""}`}
                  />
                  <div className="form-control-position">
                    <Mail size={15} />
                  </div>
                  <Label>E-Posta Adresi</Label>
                  {/* <IE show={Boolean(errors.email && touched.email)} message={errors.email} /> */}
                </FormGroup>
                <FormGroup className="form-label-group position-relative has-icon-left">
                  <Field
                    type="password"
                    name="pass"
                    placeholder="Şifre"
                    value={values.pass}
                    className={`form-control ${errors.pass && touched.pass ? "is-invalid" : ""}`}
                  />
                  <div className="form-control-position">
                    <Lock size={15} />
                  </div>
                  <Label>Şifre</Label>
                  {/* <IE show={Boolean(errors.password && touched.password)} message={errors.password} /> */}
                </FormGroup>
                <FormGroup className="d-flex justify-content-between align-items-center">
                  <Checkbox
                    color="primary"
                    name="remember_me"
                    icon={<Check className="vx-icon" size={16} />}
                    label="Beni Hatırla"
                    defaultChecked={values.remember_me}
                    onChange={() => { setFieldValue("remember_me", !values.remember_me) }}
                  />
                  <div className="float-right">
                    <Link to="/forgot-password" style={{ color: '#000' }}>Şifremi Unuttum?</Link>
                  </div>
                </FormGroup>
                <div className="d-flex justify-content-between">
                  <Button.Ripple
                    disabled={isSubmitting}
                    color="primary" type="submit">
                    Giriş Yap
                  </Button.Ripple>
                </div>
              </Form>
            )}
          </Formik>
          </div>
      </React.Fragment>
    )
  }
}
const mapStateToProps = state => {
  return {
    values: state.member
  }
}
export default connect(mapStateToProps, { loginWithJWT })(LoginJWT)
