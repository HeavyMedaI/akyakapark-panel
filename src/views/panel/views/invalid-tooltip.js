import React from "react"
import {
    Card,
    CardHeader,
    CardTitle,
    CardBody,
    FormGroup,
    Row,
    Col,
    Input,
    Button,
    Label
} from "reactstrap"

class FormLayouts extends React.Component {

  render() {
    const { show, message } = this.props 
    if (show) {
        return (
            <div className="invalid-tooltip" style={{ backgroundColor: 'transparent', color: 'red', padding: '0' }}>{show ? message : ""}</div>
        )
    } else {
        return null
    }
  }
}
export default FormLayouts
