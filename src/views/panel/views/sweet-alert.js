import React from "react"
import { Card, CardHeader, CardBody, CardTitle, Button } from "reactstrap"
import SweetAlert from 'react-bootstrap-sweetalert';
import "../../../assets/scss/plugins/extensions/sweet-alerts.scss"

class BasicSweetCallback extends React.Component {
  state = {
   defaultAlert : false, 
   confirmAlert : false, 
   cancelAlert : false, 
  }

  handleAlert = (state, value) => {
    this.setState({ [state] : value })
  }

  render(){
    return (
        <>
        <SweetAlert 
            title="Uyarı" 
          warning
          show={true}
          showCancel
          reverseButtons
          openAnim={false}
          cancelBtnBsStyle="danger"
          confirmBtnBsStyle="info"
          confirmBtnText={this.props.confirmButtonText}
          cancelBtnText="Vazgeç"
          onConfirm={this.props.onConfirm}
          onCancel={this.props.onClose}
        >
          {this.props.message}
        </SweetAlert>

        <SweetAlert success title="Başarılı" 
          confirmBtnBsStyle="success"
          show={this.state.confirmAlert} 
          onConfirm={() => {
            this.handleAlert("defaultAlert", false)
            this.handleAlert("confirmAlert", false)
          }}
        >
            <p className="sweet-alert-text">Your file has been deleted.</p>
        </SweetAlert>

        <SweetAlert error title="Cancelled" 
          confirmBtnBsStyle="success"
          show={this.state.cancelAlert} 
          onConfirm={() =>{
            this.handleAlert("defaultAlert", false)
            this.handleAlert("cancelAlert", false)
          }}
        >
            <p className="sweet-alert-text">
              Your imaginary file is safe :)
            </p>
        </SweetAlert>
        </>
    )
  }
}

export default BasicSweetCallback