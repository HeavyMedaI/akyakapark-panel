import React from "react"
import "../../../assets/scss/components/app-loader.scss"
class ComponentSpinner extends React.Component {
  render() {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: "100%", paddingTop: 30, paddingBottom: 30 }}>
      <div className="fallback-spinner">
        <div className="loading component-loader" style={{ position: 'relative', left: 0, marginTop: 0, width: '30px', height: '30px' }}>
          <div className="effect-1 effects"></div>
          <div className="effect-2 effects"></div>
          <div className="effect-3 effects"></div>
        </div>
      </div>
      </div>
    )
  }
}

export default ComponentSpinner
