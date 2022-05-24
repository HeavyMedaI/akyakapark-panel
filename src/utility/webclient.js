import Axios from 'axios';
import { store, logout, showAlert } from './redux'
import { toast } from 'react-toastify'

let access_token = null;

class WebClient {

    constructor(defaultConfig) {

        let a = store.getState().member

        if (a != null) {
            access_token = a.access_token
        }

        defaultConfig = {
            baseURL: constants.baseURL,
            headers: {
                "Authorization": "Bearer " + access_token
            }
        };
        this.axiosInstance = Axios.create(defaultConfig);
    }

    post = (path, data) => {
        var realPromise = this.axiosInstance.post(path, data);
        return this.createProxyPromise(realPromise);
    }

    createProxyPromise(realPromise) {
        var _self = this;
        var proxyPromise = new Promise(function (resolve, reject) {
            realPromise.then(function (data) {
                _self.responseHandler(data, resolve, reject);
            }).catch(error =>{
                _self.errorHandler(error, reject);
            })
        });
        return proxyPromise;
    }

    responseHandler=async(response, callback, reject) =>{

        callback(response.data);
    }

    errorHandler = async (error, reject) => {

        if (error.response === undefined) {
            toast.error("Lütfen internet bağlantınızı kontrol ediniz.")
        }
        else if (error.response.status == 401) {
            toast.warning("Yetkisiz işlem! Oturumunuz sonlanmış ya da başka bir yerden hesabınıza giriş yapılmış.")
            logout()
        }
        else {
            showAlert('Hata Oluştu', error.message);
        }
        reject(error);
    }

}

function setAccessToken(d) {
    access_token = d;
}

function getAccessToken(d) {
    return access_token
}

const messages = {
    required_field: "Bu alanın doldurulması zorunludur",
    invalid_phone: "Geçersiz telefon numarası girdiniz",
    invalid_card: "Geçersiz kart numarası girdiniz",
    invalid_email: "Geçersiz e-posta adresi girdiniz.",
    invalid_min: "Minimum karakter sayısını aşmalısınız.",
    invalid_max: "Maksimum karakter sayısını aştınız.",
    invalid_number: "Lütfen geçerli bir rakam yazınız.",
    invalid_amount: "Lütfen geçerli bir tutar yazınız.",
    invalid_phone_whitespace: "Lütfen telefon numarası içerisinde boşluk karakteri kullanmayın",
    invalid_plate_whitespace: "Lütfen plaka içerisinde boşluk karakteri kullanmayın",
    invalid_card_range: "Kart numarası uygun kart aralıkları içinde değil.",
    invalid_plate: "Lütfen geçerli bir araç plakası yazın",
    invalid_text: "Lütfen geçerli bir değer girin",
    required_select: "Lütfen seçeneklerden birini seçiniz.",
    min_password: "Lütfen şifreyi en az 4 karakter olarak giriniz",
    doesnt_match: "Şifre ve tekrar alanları uyuşmuyor"
}

const constants = {
    // spinner: require("../../../assets/pulse.svg"),
    base: "https://api.akyakapark.com/",
    base_img: "https://api.akyakapark.com/data/",
    baseURL: "https://api.akyakapark.com/cms/",
}

export {
    WebClient,
    setAccessToken,
    messages,
    constants,
    getAccessToken
}
