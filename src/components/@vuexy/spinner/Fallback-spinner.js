import React from "react"
import logo from "../../../assets/img/logo/akyaka-app-logo-192.png"
import "../../../assets/scss/components/app-loader.scss"
class SpinnerComponent extends React.Component {
  render() {
    return (
      <div className="fallback-spinner vh-100">
        <img className="fallback-logo" src={logo} alt="logo" />
      </div>
    )
  }
}

export default SpinnerComponent
