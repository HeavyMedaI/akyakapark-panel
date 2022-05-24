import React from "react"
import { Button } from "reactstrap"

import "react-toggle/style.css"
import "../../../assets/scss/plugins/forms/switch/react-toggle.scss"
import Toggle from 'react-toggle'

class CToggle extends React.Component {

    static defaultProps = {
        size: "md",
        marginTop: "1rem"
    }

    componentDidMount() {
        
    }

    render() {
        const { value, trueLabel, falseLabel, name } = this.props
        return (
        <label className="react-toggle-wrapper" style={{ marginTop: this.props.marginTop, width: 'fit-content' }}>
            <Toggle
            className="switch-danger"
            checked={value}
            onChange={this.props.onChange}
            name={name}
            value="yes"
            />
            <Button.Ripple
            color={value ? "success" : "danger"}
            onClick={this.props.onChange}
            size={this.props.size}>
            {value ? trueLabel : falseLabel}
            </Button.Ripple>
        </label>
        )
    }
}
export default CToggle
