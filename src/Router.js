import React, { Suspense, lazy } from "react"
import { Router, Switch, Route } from "react-router-dom"
import { history } from "./history"
import { connect } from "react-redux"
import { Redirect } from "react-router-dom"
import { WebClient } from './utility/webclient'
import * as Redux from './utility/redux'
import Spinner from "./components/@vuexy/spinner/Fallback-spinner"
import knowledgeBaseCategory from "./views/pages/knowledge-base/Category"
import knowledgeBaseQuestion from "./views/pages/knowledge-base/Questions"
import { ContextLayout } from "./utility/context/Layout"

// Route-based code splitting
const analyticsDashboard = lazy(() =>
  import("./views/dashboard/analytics/AnalyticsDashboard")
)
const ecommerceDashboard = lazy(() =>
  import("./views/dashboard/ecommerce/EcommerceDashboard")
)

const error404 = lazy(() => import("./views/pages/misc/error/404"))
const error500 = lazy(() => import("./views/pages/misc/error/500"))
const authorized = lazy(() => import("./views/pages/misc/NotAuthorized"))
const maintenance = lazy(() => import("./views/pages/misc/Maintenance"))

const Login = lazy(() => import("./views/pages/authentication/login/Login"))
const forgotPassword = lazy(() =>
  import("./views/pages/authentication/ForgotPassword")
)

const Settings = lazy(() => import("./views/panel/views/settings"))
const SocialMedia = lazy(() => import("./views/panel/views/social-media"))
const ContactInfo = lazy(() => import("./views/panel/views/contact-info"))
const About = lazy(() => import("./views/panel/views/about"))
const Privacy = lazy(() => import("./views/panel/views/privacy"))
const KVKK = lazy(() => import("./views/panel/views/kvkk"))
const HowToGo = lazy(() => import("./views/panel/views/how-to-go"))
const ValidStores = lazy(() => import("./views/panel/views/valid-stores"))
const Faqs = lazy(() => import("./views/panel/views/faqs"))
const Admins = lazy(() => import("./views/panel/views/admins"))
const News = lazy(() => import("./views/panel/views/news"))
const NewsLinks = lazy(() => import("./views/panel/views/news-links"))
const NewsImages = lazy(() => import("./views/panel/views/news-image"))
const Surveys = lazy(() => import("./views/panel/views/survey"))
const SurveyQuestions = lazy(() => import("./views/panel/views/survey-question"))
const SurveyOptions = lazy(() => import("./views/panel/views/survey-options"))
const MainSlider = lazy(() => import("./views/panel/views/main-slider"))
// const Venues = lazy(() => import("./views/panel/views/venues"))
// const VenueImages = lazy(() => import("./views/panel/views/venue-image"))
// const VenueCategories = lazy(() => import("./views/panel/views/venue-categories"))
const Events = lazy(() => import("./views/panel/views/events"))
const EventCategories = lazy(() => import("./views/panel/views/event-categories"))
const CampaignCategories = lazy(() => import("./views/panel/views/campaign-categories"))
const EventLinks = lazy(() => import("./views/panel/views/event-links"))
const Cities = lazy(() => import("./views/panel/views/cities"))
const Districts = lazy(() => import("./views/panel/views/districts"))
const SendNotification = lazy(() => import("./views/panel/views/send-notification"))
const Notifications = lazy(() => import("./views/panel/views/notifications"))
const NewRequests = lazy(() => import("./views/panel/views/new-requests"))
const Companies = lazy(() => import("./views/panel/views/companies"))
const Campaigns = lazy(() => import("./views/panel/views/campaigns"))
const NewCampaign = lazy(() => import("./views/panel/views/new-campaign"))
const UserReceipts = lazy(() => import("./views/panel/views/user-receipts"))
const WaitingCampaigns = lazy(() => import("./views/panel/views/waiting-campaigns"))
const Professions = lazy(() => import("./views/panel/views/professions"))
const Dashboard = lazy(() => import("./views/panel/views/dashboard"))
const AppReports = lazy(() => import("./views/panel/views/reports"))
const UserReports = lazy(() => import("./views/panel/views/user-reports"))
const CampaignReports = lazy(() => import("./views/panel/views/campaign-reports"))
const AppUsers = lazy(() => import("./views/panel/views/app-users"))
const CardUsers = lazy(() => import("./views/panel/views/card-users"))
const NewUserRequests = lazy(() => import("./views/panel/views/new-user-requests"))
const UserRequests = lazy(() => import("./views/panel/views/user-requests"))
const Hobbies = lazy(() => import("./views/panel/views/hobbies"))
const CompanyUsers = lazy(() => import("./views/panel/views/company-users"))
const UserDetail = lazy(() => import("./views/panel/views/user-detail"))
const SurveyResult = lazy(() => import("./views/panel/views/survey-result"))
const SurveyDetail = lazy(() => import("./views/panel/views/survey-detail"))
const Stores = lazy(() => import("./views/panel/views/stores"))
const StoreImages = lazy(() => import("./views/panel/views/store-images"))
const StoreCategories = lazy(() => import("./views/panel/views/store-categories"))


// Set Layout and Component Using App Route
const RouteConfig = ({ component: Component, fullLayout, ...rest }) => (
  <Route
    {...rest}
    render={props => {
      return (
        <ContextLayout.Consumer>
          {context => {
            let LayoutTag =
              fullLayout === true
                ? context.fullLayout
                : context.state.activeLayout === "horizontal"
                ? context.horizontalLayout
                : context.VerticalLayout
            return (
              <LayoutTag {...props} permission={props.user}>
                <Suspense fallback={<Spinner />}>
                  <Component {...props} />
                </Suspense>
              </LayoutTag>
            )
          }}
        </ContextLayout.Consumer>
      )
    }}
  />
)
const mapStateToProps = state => {
  return {
    user: state.member
  }
}

const AppRoute = connect(mapStateToProps)(RouteConfig)

class AppRouter extends React.Component {

  state = {
    loading: true
  }

  componentDidMount() {
    this._startAction()
  }

  async _startAction() {
    const last = window.location.pathname;
    let a = await localStorage.getItem("access_token")

    if (a != null) {

      Redux.setMemberData({access_token: a}, false)
      let c = new WebClient()
      c.post("welcome.json", {})
        .then(({status, message, data}) => {
          if (status) {

            if (data?.user) {
              Redux.setMemberData(data.user)
              history.push(last)
              this.setState({loading: false})
            } else {
              this._reset()
            }

          } else {
            this._reset()
          }
        })
        .catch((error) => {
          this._reset()
        })


    } else {
      this._reset()
    }
  }

  _reset() {
    Redux.setMemberData(null, false)
    this.setState({loading: false})
  }

  render() {

    const { loading } = this.state

    if (loading) {
      return <Spinner />
    }

    const { user } = this.props

    if (user == undefined || user == null || (user && Object.keys(user).length === 0 && user.constructor === Object)) {
        return (
          <Router history={history}>
            <Switch>
              <AppRoute path="/login" component={Login} fullLayout />
              <AppRoute path="/forgot-password" component={forgotPassword} fullLayout />
              {/* <AppRoute path="/new-password" component={NewPassword} fullLayout /> */}
              <Route>
                <Redirect to="/login" />
              </Route>
            </Switch>
          </Router>
        )
    }

    return (
      // Set the directory path if you are deploying in sub-folder
      <Router history={history}>
        <Switch>
          <AppRoute exact path="/" component={AppReports} />
          <AppRoute exact path="/dashboard" component={AppReports} />
          <AppRoute
            path="/ecommerce-dashboard"
            component={ecommerceDashboard}
          />
          <AppRoute path="/misc/error/500" component={error500} fullLayout />
          <AppRoute
            path="/misc/not-authorized"
            component={authorized}
            fullLayout
          />
          <AppRoute
            path="/misc/maintenance"
            component={maintenance}
            fullLayout
          />

          <AppRoute path="/settings" component={Settings} />
          <AppRoute path="/social-media" component={SocialMedia} />
          <AppRoute path="/contact" component={ContactInfo} />
          <AppRoute path="/about" component={About} />
          <AppRoute path="/privacy" component={Privacy} />
          <AppRoute path="/kvkk" component={KVKK} />
          <AppRoute path="/how-to-go" component={HowToGo} />
          <AppRoute path="/valid-stores" component={ValidStores} />
          <AppRoute path="/faqs" component={Faqs} />
          <AppRoute path="/admins" component={Admins} />
          <AppRoute path="/news" component={News} />
          <AppRoute path="/news-links/:news_id" component={NewsLinks} />
          <AppRoute path="/news-images/:news_id" component={NewsImages} />

          <AppRoute path="/surveys" component={Surveys} />
          <AppRoute path="/survey-questions/:news_id" component={SurveyQuestions} />
          <AppRoute path="/survey-options/:news_id" component={SurveyOptions} />
          <AppRoute path="/company-users/:news_id" component={CompanyUsers} />

          <AppRoute path="/stores" component={Stores} />
          <AppRoute path="/store-images/:news_id" component={StoreImages} />
          <AppRoute path="/store-categories" component={StoreCategories} />

          <AppRoute path="/events" component={Events} />
          <AppRoute path="/event-links/:news_id" component={EventLinks} />
          <AppRoute path="/event-categories" component={EventCategories} />
          <AppRoute path="/campaign-categories" component={CampaignCategories} />

          <AppRoute path="/cities" component={Cities} />
          <AppRoute path="/districts/:news_id" component={Districts} />

          <AppRoute path="/main-slider" component={MainSlider} />
          <AppRoute path="/send-notification" component={SendNotification} />
          <AppRoute path="/notifications" component={Notifications} />
          <AppRoute path="/new-requests" component={NewRequests} />
          <AppRoute path="/companies" component={Companies} />
          <AppRoute path="/campaigns" component={Campaigns} />
          <AppRoute path="/new-campaign" component={NewCampaign} />
          <AppRoute path="/user-receipts" component={UserReceipts} />
          <AppRoute path="/waiting-campaigns" component={WaitingCampaigns} />
          <AppRoute path="/professions" component={Professions} />
          <AppRoute path="/reports" component={AppReports} />
          <AppRoute path="/user-reports" component={UserReports} />
          <AppRoute path="/campaign-reports" component={CampaignReports} />
          <AppRoute path="/app-users" component={AppUsers} />
          <AppRoute path="/card-users" component={CardUsers} />
          <AppRoute path="/new-user-requests" component={NewUserRequests} />
          <AppRoute path="/user-requests" component={UserRequests} />
          <AppRoute path="/hobbies" component={Hobbies} />
          <AppRoute path="/survey-result" component={SurveyResult} />
          <AppRoute exact path="/user-detail" component={UserDetail} />
          <AppRoute path="/user-detail/:id" component={UserDetail} />
          <AppRoute exact path="/survey-detail" component={SurveyDetail} />
          <AppRoute path="/survey-detail/:id" component={SurveyDetail} />

          <AppRoute component={error404} fullLayout />
        </Switch>
      </Router>
    )
  }
}

const msp = state => {
  return {
    user: state.member
  }
}

export default connect(msp)(AppRouter)
