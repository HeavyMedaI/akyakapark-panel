import React from "react"
import {
  Breadcrumb,
  BreadcrumbItem,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Button
} from "reactstrap"
import { history } from '../../../history'
import classNames from 'classnames'
import { Home, Settings, ChevronLeft } from "react-feather"
import { NavLink } from "react-router-dom"
class BreadCrumbs extends React.Component {

  static defaultProps = {
    showAddButton: false,
    addButtonText: "Yeni Kayıt Ekle",
    marginBottom: "mb-2",
    showBackButton: false
  }

  render() {

    const { showAddButton, addButtonText, marginBottom, showCancelButton, showBackButton } = this.props

    return (
      <div className="content-header row">
        <div className={classNames(
            "content-header-left col-md-9 col-12", 
            {
              [`${marginBottom}`]: Boolean(marginBottom.length > 0)
            })}>
          <div className="row breadcrumbs-top">
            <div className="col-12">
              <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
              {
              showBackButton && (
                <Button.Ripple
                    className="rounded-circle btn-icon mr-2"
                    onClick={() => { history.goBack() }}
                    color="primary"
                >
                    <ChevronLeft />
                </Button.Ripple>  
              )
              }

              {this.props.breadCrumbTitle ? (
                <h2 className="content-header-title float-left mb-0">
                  {this.props.breadCrumbTitle}
                </h2>
              ) : (
                ""
              )}
              </div>
              {/* <div className="breadcrumb-wrapper vx-breadcrumbs d-sm-block d-none col-12">
                <Breadcrumb tag="ol">
                  <BreadcrumbItem tag="li">
                    <NavLink to="/">
                      <Home className="align-top" size={15} />
                    </NavLink>
                  </BreadcrumbItem>
                  <BreadcrumbItem tag="li" className="text-primary">
                    {this.props.breadCrumbParent}
                  </BreadcrumbItem>
                  {this.props.breadCrumbParent2 ? (
                    <BreadcrumbItem tag="li" className="text-primary">
                      {this.props.breadCrumbParent2}
                    </BreadcrumbItem>
                  ) : (
                    ""
                  )}
                  {this.props.breadCrumbParent3 ? (
                    <BreadcrumbItem tag="li" className="text-primary">
                      {this.props.breadCrumbParent3}
                    </BreadcrumbItem>
                  ) : (
                    ""
                  )}
                  <BreadcrumbItem tag="li" active>
                    {this.props.breadCrumbActive}
                  </BreadcrumbItem>
                </Breadcrumb>
              </div> */}
            </div>
          </div>
        </div>
        {
        showAddButton && (
        <div className="content-header-right text-md-right col-md-3 col-12 d-md-block d-none">
          <div className="form-group breadcrum-right dropdown">
              <Button.Ripple
                  color="primary"
                  type="button"
                  onClick={() => { this.props.onAddButtonClick() }}
              >
                  {addButtonText}
              </Button.Ripple>                    
          </div>
        </div>
        )
        }

        {
        showCancelButton && (
        <div className="content-header-right text-md-right col-md-3 col-12 d-md-block d-none">
          <div className="form-group breadcrum-right dropdown">
              <Button.Ripple
                  color="danger"
                  type="button"
                  onClick={() => { this.props.onCancelButtonClick() }}
              >
                  Vazgeç
              </Button.Ripple>                    
          </div>
        </div>
        )
        }        
      </div>
    )
  }
}
export default BreadCrumbs
