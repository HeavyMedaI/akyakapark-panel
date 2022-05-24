import React, { Component } from "react"
import { NavLink } from "react-router-dom"
import { Disc, X, Circle } from "react-feather"
import classnames from "classnames"

const logo = require('../../../../assets/img/logo/akyaka-app-logo-192.png')

class SidebarHeader extends Component {
  render() {
    let {
      toggleSidebarMenu,
      activeTheme,
      collapsed,
      toggle,
      sidebarVisibility,
      menuShadow
    } = this.props
    return (
      <div className="navbar-header">
        <ul className="nav navbar-nav flex-row">
          <li className="nav-item mr-auto">
            <NavLink to='/' className='navbar-brand'>
              <span className='brand-logo'>
                <img src={logo} alt='logo' />
              </span>
              <h2 className='brand-text mb-0'>AkyakaPark<br />AVM</h2>
            </NavLink>
          </li>
        </ul>
        {/* <div
          className={classnames("shadow-bottom", {
            "d-none": menuShadow === false
          })}
        /> */}
      </div>
    )
  }
}

export default SidebarHeader
