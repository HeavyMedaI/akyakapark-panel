import React from "react"
import { Label } from "reactstrap"

class CLabel extends React.Component {

  render() {
    return (
        <Label className={this.props.required ? "required": ""}>{this.props.children}</Label>
    )
  }
}
export default CLabel
