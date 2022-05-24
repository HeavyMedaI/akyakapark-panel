import React from "react"
import {
  Card,
  CardHeader,
  CardTitle,
  Row,
  Col,
  Nav,
  NavItem,
  NavLink,
  TabContent,
  TabPane
} from "reactstrap"
import classnames from "classnames"
import loginImg from "../../../../assets/img/pages/login.png"
import "../../../../assets/scss/pages/authentication.scss"
import LoginAuth0 from "./LoginAuth0"
import LoginFirebase from "./LoginFirebase"
import LoginJWT from "./LoginJWT"

class Login extends React.Component {
  state = {
    activeTab: "1"
  }
  toggle = tab => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      })
    }
  }
  render() {
    return (
      <Row className="m-0 justify-content-center">
        <Col
          sm="8"
          xl="7"
          lg="10"
          md="8"
          className="d-flex justify-content-center"
        >
          <Card className="bg-authentication login-card rounded-0 mb-0 w-100">
            <Row className="m-0">
              <Col
                lg="6"
                className="d-lg-block d-none text-center align-self-center px-1 py-0"
              >
                <img src={loginImg} alt="loginImg" style={{ maxWidth: '400px', width: "100%" }} />
              </Col>
              <Col lg="6" md="12" className="p-0">
                <Card className="rounded-0 mb-0 px-2 login-tabs-container" style={{ justifyContent: 'center' }}>
                  <CardHeader className="pb-1">
                    <CardTitle>
                      <h4 className="mb-0">Kullanıcı Girişi</h4>
                    </CardTitle>
                  </CardHeader>
                  <p className="px-2 auth-title">
                    Hoş geldiniz. Giriş yapmak için lütfen kullanıcı bilgilerinizi giriniz.
                  </p>
                  <LoginJWT />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        {/* <ToastContainer autoClose={3000} /> */}
      </Row>
    )
  }
}
export default Login