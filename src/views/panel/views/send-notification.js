import React from "react"
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  FormGroup,
  Label,
  Input,
  Row,
  Col,
  UncontrolledDropdown,
  UncontrolledButtonDropdown,
  DropdownMenu,
  DropdownItem,
  DropdownToggle,
  Collapse,
  Button
} from "reactstrap"
import axios from "axios"
import { ContextLayout } from "../../../utility/context/Layout"
import { AgGridReact } from "ag-grid-react"
import {
  Edit,
  Trash2,
  ChevronDown,
  Clipboard,
  Printer,
  Download,
  RotateCw,
  X
} from "react-feather"
import classnames from "classnames"
import { history } from "../../../history"
import "../../../assets/scss/plugins/tables/_agGridStyleOverride.scss"
import "../../../assets/scss/pages/users.scss"
import Breadcrumbs from "../../../components/@vuexy/breadCrumbs/BreadCrumb"
import { WebClient } from '../../../utility/webclient'
import DeleteAlert from './sweet-alert.js'
import { ToastContainer } from "react-toastify"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../../../assets/scss/plugins/extensions/toastr.scss"
import HelpForms from './help-forms/index'
import Spinner from "../../../components/@vuexy/spinner/in-page-spinner"
import { Formik, Field, Form } from "formik"
import * as Yup from "yup"
import IE from './invalid-tooltip'
import CLabel from './clabel'
import CToggle from './ctoggle'
import Flatpickr from "react-flatpickr";
import { Turkish } from 'flatpickr/dist/l10n/tr'
import "flatpickr/dist/themes/light.css";
import "../../../assets/scss/plugins/forms/flatpickr/flatpickr.scss"
import Select from 'react-select'
import Slider, { Range } from 'rc-slider';
import 'rc-slider/assets/index.css';
import moment from 'moment'
import "moment/locale/tr"
moment.locale("tr")

const formSchema = Yup.object().shape({
  title: Yup.string().required("Bu alanı boş bırakmayın"),
  message: Yup.string().required("Bu alanı boş bırakmayın"),
  target_type: Yup.string().required("Bu alanı boş bırakmayın"),
  target_url: Yup.string().test("match", "Bu alanı boş bırakmayın", function(value) {
    if (this.parent.target_type === "1" && value === undefined) {
      return false
    } else {
      return true
    }
  }),
})

class UsersList extends React.Component {

    constructor(props) {
      super(props)
      this.state = {
        finished: false,
        list: [],
        playerCount: 0,
        isGroupamaCustomer: false,
        isLastGame: false,
        platform: "all",
        gender: "all",
        send_type: "all",
        register_complete: "all",
        news: [],
        surveys: [],
        professions: [],
        hobbies: [],
        sprofessions: [],
        shobbies: [],
        age_range: [0,99],
        create_time: {
          start: 0,
          end: 0
        },
        last_login: {
          start: 0,
          end: 0
        }
      }
    }

    componentDidMount() {
      this._getResources()
      this.checkFilter();
    }

    async checkFilter() {
      const { create_time, last_login, isLastGame, isGroupamaCustomer, platform, age_range, gender, sprofessions, shobbies, register_complete } = this.state

      let professions = sprofessions.map(e => e.value)
      let hobbies = shobbies.map(e => e.value)

      let c = new WebClient();
      await c.post("check-notification-filter.json", {
        create_time, 
        last_login, 
        platform, 
        gender,
        register_complete, 
        age_start: age_range[0], 
        age_end: age_range[1],
        professions,
        hobbies
      })
      .then(({status, message, data}) => {
          if (status) {
            this.setState({playerCount: data})
          }
      })
    } 

    _getResources() {
        let c = new WebClient();
        c.post("get-select-resources.json", 
            {
                news: true,
                survey: true,
                profession: true,
                hobby: true
            })
        .then(({status, message, data}) => {
            
            if (status) {
                this.setState({news: data.news, surveys: data.surveys, professions: data.professions, hobbies: data.hobbies})
            }
        })
    }  

    render() {
      const { platform, create_time, last_login, playerCount, news, surveys, professions, hobbies, register_complete, age_range, gender, sprofessions, shobbies } = this.state
      return (
        <Row className="app-user-list">
          <Col sm="12">
          <Breadcrumbs
              marginBottom="mb-2"
              breadCrumbTitle="Bildirim Gönder"
              breadCrumbParent="Kullanıcı Yönetimi"
              breadCrumbActive="Toplu Bildirim Gönderme"
          />      
          </Col>

        <Col sm="12">
          <Card>
            <CardHeader>
              <CardTitle>Gönderim Tipi</CardTitle>
            </CardHeader>

              <CardBody>
                <Row>
                  <Col md="12" sm="12">
                    <FormGroup className="mb-0">
                      <Label for="verified">Gönderim Tipi</Label>
                      <Input
                        type="select"
                        name="send_type"
                        id="send_type"
                        value={this.state.send_type}
                        onChange={e => {
                          this.setState({send_type: e.target.value})
                        }}
                      >
                        <option value="all">Tüm Kullanıcılara Gönder</option>
                        <option value="filter">Filtrele</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>  
              </CardBody>
          </Card>
        </Col>
        {
        this.state.send_type == "filter" && (
          <Col sm="12">
          <Card>
            <CardHeader>
              <CardTitle>Filtre</CardTitle>
            </CardHeader>

              <CardBody>
                <Row>
                  <Col md="4" sm="12">
                    <FormGroup className="mb-0">
                      <Label for="verified">Platform</Label>
                      <Input
                        type="select"
                        name="platform"
                        id="platform"
                        value={this.state.platform}
                        onChange={e => {
                          this.setState({platform: e.target.value}, () => { this.checkFilter() })
                        }}
                      >
                        <option value="all">Tümü</option>
                        <option value="android">Android</option>
                        <option value="ios">iOS</option>
                      </Input>
                    </FormGroup>
                  </Col>    

                  <Col md="4" sm="12">
                      <FormGroup className="mb-0">
                      <Label for="verified" className="mb-1">Yaş Aralığı ({this.state.age_range[0]} - {this.state.age_range[1]})</Label>
                      <Range 
                        defaultValue={[0,99]} min={0} max={99} 
                        onChange={(e) => {
                          this.setState({age_range: e})
                        }}
                        onAfterChange={(e) => { 
                          this.checkFilter()
                        }}
                        value={this.state.age_range}
                      />
                      </FormGroup>
                  </Col>  

                  <Col md="4" sm="12">
                    <FormGroup className="mb-0">
                      <Label for="verified">Kayıt Durumu</Label>
                      <Input
                        type="select"
                        name="register_complete"
                        id="register_complete"
                        value={this.state.register_complete}
                        onChange={e => {
                          this.setState({register_complete: e.target.value}, () => { this.checkFilter() })
                        }}
                      >
                        <option value="all">Tümü</option>
                        <option value="1">Sadece kaydını tamamlamış kullanıcılar</option>
                        <option value="0">Sadece kaydını tamamlamamış kullanıcılar</option>
                      </Input>
                    </FormGroup>
                  </Col>        

                  <Col md="4" sm="12" className="mt-1">
                    <FormGroup className="mb-0">
                      <Label for="verified">Cinsiyet</Label>
                      <Input
                        type="select"
                        name="gender"
                        id="gender"
                        value={this.state.gender}
                        onChange={e => {
                          this.setState({gender: e.target.value}, () => { this.checkFilter() })
                        }}
                      >
                        <option value="all">Tümü</option>
                        <option value="-1">Belirtilmemiş</option>
                        <option value="Kadın">Kadın</option>
                        <option value="Erkek">Erkek</option>
                      </Input>
                    </FormGroup>
                  </Col>                                                                 
                
                  <Col md="4" sm="12" className="mt-1">
                    <FormGroup className="mb-0">
                      <Label for="department">Kayıt Tarihi</Label>
                      <Flatpickr
                          className="form-control"
                          name="date"
                          placeholder="Kayıt Tarihi"
                          options={{
                              locale: Turkish,
                              dateFormat: 'd-m-Y',
                              mode: 'range'
                          }}
                          onChange={date => {
                              if (date.length > 1) {
                                let start = moment(date[0]).format('x') / 1000
                                let end = moment(date[1]).format('x') / 1000
                                let a = this.state.create_time
                                a.start = start;
                                a.end = end;
                                this.setState({create_time: a}, () => { this.checkFilter() })
                              }
                          }}
                      />
                    </FormGroup>
                  </Col>                   

                  <Col md="4" sm="12" className="mt-1">
                    <FormGroup className="mb-0">
                      <Label for="department">Son Login Tarihi</Label>
                      <Flatpickr
                          className="form-control"
                          name="date"
                          placeholder="Son Login Tarihi"
                          options={{
                              locale: Turkish,
                              dateFormat: 'd-m-Y',
                              mode: 'range'
                          }}
                          onChange={date => {
                              if (date.length > 1) {
                                let start = moment(date[0]).format('x') / 1000
                                let end = moment(date[1]).format('x') / 1000
                                let a = this.state.last_login
                                a.start = start;
                                a.end = end;
                                this.setState({last_login: a}, () => { this.checkFilter() })
                              }
                          }}
                      />
                    </FormGroup>
                  </Col>   

                  <Col sm="12" className="mt-1">
                      <FormGroup>
                      <CLabel required for="EmailVertical">Meslek</CLabel>
                      <Select
                          menuPortalTarget={document.body} 
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          className={`form-control no-padding`}
                          classNamePrefix="select"
                          placeholder="Seçiniz..."
                          isMulti={true}
                          onChange={(e) => {
                            this.setState({sprofessions: e ?? []}, () => { this.checkFilter() })
                          }}
                          value={this.state.sprofessions}
                          name="venue_id"
                          options={professions}
                      />
                      </FormGroup>
                  </Col> 

                  <Col sm="12">
                      <FormGroup>
                      <CLabel required for="EmailVertical">İlgi Alanları</CLabel>
                      <Select
                          menuPortalTarget={document.body} 
                          styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
                          className={`form-control no-padding`}
                          classNamePrefix="select"
                          placeholder="Seçiniz..."
                          isMulti={true}
                          onChange={(e) => {
                            this.setState({shobbies: e ?? []}, () => { this.checkFilter() })
                          }}
                          value={this.state.shobbies}
                          name="hobby"
                          options={hobbies}
                      />
                      </FormGroup>
                  </Col>                                      

                </Row>
                <Row>
                <Col md="12">
                  <p>Bu kriterlere uyan {playerCount} adet kullanıcı bulundu.</p>
                </Col>  
                </Row>  
              </CardBody>
          </Card>
        </Col>
        )
        }

          {
          playerCount > 0 ?
          <Col sm="12">
            <Card>
              <CardBody>
              <Formik
                    initialValues={{
                        title: "",
                        message: "",
                        target_type: "0",
                        target_url: "",
                        target_page: "",
                        reference_id: "",
                        category_id: ""
                    }}
                    validationSchema={formSchema}
                    onSubmit={(values, {setSubmitting, resetForm, setError, setFieldValue, setFieldError}) => {

                      let _p = sprofessions.map(e => e.value)
                      let _h = shobbies.map(e => e.value)

                            let c = new WebClient();
                            c.post("send-notification.json", {
                                title: values.title,
                                message: values.message,
                                platform,
                                last_login,
                                create_time,
                                register_complete,
                                age_start: age_range[0],
                                age_end: age_range[1],
                                gender,
                                professions: _p,
                                hobbies: _h,
                                send_type: this.state.send_type,
                                target_type: values.target_type,
                                target_url: values.target_url,
                                target_page: values.target_page,
                                reference_id: values.reference_id
                            })
                            .then(({status, message, data}) => {

                                if (status) {
                                    toast.success(message)
                                    resetForm();
                                } else {
                                    toast.error(message)
                                }

                                setSubmitting(false)
            
                            })
                            .catch((error) => {
                                setSubmitting(false)
                                toast.error("Beklenmeyen bir hata oluştu. Lütfen sayfayı yenileyerek tekrar deneyin")
                            })
                    
                    }}
                >
                    {({ errors, touched, values, isSubmitting, handleChange, handleBlur, setFieldValue }) => (
                    <Form noValidate={true} autoComplete="off">
                            <Row>

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Bildirim Başlığı</CLabel>
                                <Field
                                    placeholder="Bildirim Başlığı"
                                    name="title"
                                    value={values.title}
                                    className={`form-control ${errors.title && touched.title && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.title && touched.title)} message={errors.title} />
                                </FormGroup>
                            </Col>  

                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Bildirim Mesajı</CLabel>
                                <Field
                                    as="textarea"
                                    placeholder="Bildirim Mesajı"
                                    name="message"
                                    value={values.message}
                                    className={`form-control ${errors.message && touched.message && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.message && touched.message)} message={errors.message} />
                                </FormGroup>
                            </Col>   
                            
                            <Col md="12" sm="12">
                                <FormGroup>
                                <Label for="verified">Bildirime Tıklandığında</Label>
                                <Input
                                    type="select"
                                    name="target_type"
                                    id="target_type"
                                    value={values.target_type}
                                    onChange={(e) => { setFieldValue("target_type", e.target.value) }}
                                >
                                    <option value="0">Birşey yapılmasın</option>
                                    <option value="1">İnternet bağlantısı açılsın</option>
                                    <option value="2">Uygulama içi sayfa açılsın</option>
                                </Input>
                                </FormGroup>
                            </Col>  

                            {
                            values.target_type == "1" && (
                            <Col sm="12">
                                <FormGroup>
                                <CLabel required for="nameVertical">Bağlantı Adresi</CLabel>
                                <Field
                                    placeholder="Bağlantı Adresi"
                                    name="target_url"
                                    value={values.target_url}
                                    className={`form-control ${errors.target_url && touched.target_url && "is-invalid"}`}
                                />
                                <IE show={Boolean(errors.target_url && touched.target_url)} message={errors.target_url} />
                                </FormGroup>
                            </Col>
                            ) 
                            }  

                            {
                            values.target_type == "2" && (
                            <Col md="12" sm="12">
                                <FormGroup>
                                <Label for="verified">Uygulama İçi Sayfa</Label>
                                <Input
                                    type="select"
                                    name="target_page"
                                    id="target_page"
                                    value={values.target_page}
                                    onChange={(e) => { 
                                      setFieldValue("target_page", e.target.value) 
                                      setFieldValue("category_id", "")
                                      setFieldValue("reference_id", "")
                                    }}
                                >
                                    <option value="News">Haberler</option>
                                    <option value="Surveys">Anketler</option>
                                    <option value="Offers">Kampanyalar</option>
                                    <option value="Events">Etkinlikler</option>
                                    <option value="Receipts">Alışveriş Fişleri</option>
                                    <option value="Notifications">Bildirimler</option>
                                    <option value="NewsDetail">Habet Detayı</option>
                                    <option value="SurveyDetail">Anket Detayı</option>
                                </Input>
                                </FormGroup>
                            </Col>                                                                                                                                      
                            ) 
                            }

                            {
                            values.target_page == "NewsDetail" && (
                            <Col md="12" sm="12">
                                <FormGroup>
                                <Label for="verified">Haber Seçin</Label>
                                <Input
                                    type="select"
                                    name="reference_id"
                                    id="reference_id"
                                    value={values.reference_id}
                                    onChange={(e) => { 
                                        setFieldValue("reference_id", e.target.value) 
                                    }}
                                >
                                  <option value="">Seçim yapınız..</option>
                                  {
                                  news.map((item, index) => {
                                    return (
                                      <option key={index} value={item.value}>{item.label}</option>
                                    )
                                  })
                                  }
                                </Input>
                                </FormGroup>
                            </Col>                                
                            )
                            }    

                            {
                            values.target_page == "SurveyDetail" && (
                            <Col md="12" sm="12">
                                <FormGroup>
                                <Label for="verified">Anket Seçin</Label>
                                <Input
                                    type="select"
                                    name="reference_id"
                                    id="reference_id"
                                    value={values.reference_id}
                                    onChange={(e) => { 
                                        setFieldValue("reference_id", e.target.value) 
                                    }}
                                >
                                  <option value="">Seçim yapınız..</option>
                                  {
                                  surveys.map((item, index) => {
                                    return (
                                      <option key={index} value={item.value}>{item.label}</option>
                                    )
                                  })
                                  }
                                </Input>
                                </FormGroup>
                            </Col>                                
                            )
                            }                                                                                

                            <Col sm="12">
                                <FormGroup>
                                <Button.Ripple
                                    disabled={isSubmitting}
                                    color="primary"
                                    type="submit"
                                    className="mr-1 mb-1"
                                >
                                    Gönder
                                </Button.Ripple>
                                </FormGroup>
                            </Col>
                            </Row>
                    </Form>
                    )}
                </Formik>
              </CardBody>
            </Card>
          </Col>          
          :
          null
          }         

          {
          this.state.showAlert ?
          <DeleteAlert 
              message="Seçtiğiniz kayıt silinecektir. Devam etmek istiyor musunuz?"
              confirmButtonText="Evet"
              onConfirm={() => { this._delete() }} 
              onClose={() => { this.setState({showAlert: false, deletedItemID: 0}) }} />
          :
          null
          }

        </Row>
      )
    }
}

export default UsersList
