import { createStore, combineReducers } from 'redux'
import { history } from "../history"
import themeConfig from "../configs/themeConfig"

const app = (state = themeConfig, action) => {
    switch (action.type) {
        case "SET_APP_DATA": {
            return {...state, ...action.payload}
        }               
        default:
            return state;
    }
}

const member = (state = null, action) => {
    switch (action.type) {
        case "SET_MEMBER_DATA": {
            return {...state, ...action.payload}
        }
        case "LOGOUT": {
            return null
        }
        case "RESET_MEMBER_DATA": {
            return action.payload
        }                
        default:
            return state;
    }
}

const alertState = {
    show: false,
    title: "",
    text: ""
}

const alert = (state = alertState, action) => {
    switch (action.type) {
        case "SHOW_ALERT": {
            return {
                show: true,
                title: action.title,
                text: action.text
            }
        }
        case "HIDE_ALERT": {
            return {
                show: false,
                title: "",
                text: ""
            }
        }         
        default:
            return state;
    }
}

const loadingState = {
    show: false
}

const loading = (state = loadingState, action) => {
    switch (action.type) {
        case "SHOW_LOADING": {
            return {
                show: true
            }
        }
        case "HIDE_LOADING": {
            return {
                show: false
            }
        }         
        default:
            return state;
    }
}

const new_applicants = (state = 0, action) => {
    switch (action.type) {
        case "SET_NEW_APPLICANTS": {
            return action.payload
        }
        default:
            return state;
    }
}


const combinedReducer = combineReducers({
    loading,
    alert,
    member,
    app,
    new_applicants
})

const store = createStore(combinedReducer);

function setNewApplicants(payload) {
    store.dispatch({
        type: "SET_NEW_APPLICANTS",
        payload
    });
}

function showLoading() {
    store.dispatch({
        type: "SHOW_LOADING"
    });
}

function hideLoading() {
    store.dispatch({
        type: "HIDE_LOADING"
    });
}

function showAlert(title, text) {
    store.dispatch({
        type: "SHOW_ALERT",
        title,
        text
    });
}

function hideAlert() {
    store.dispatch({
        type: "HIDE_ALERT"
    });
}

function setMemberData(payload, ac = true) {

    if (ac) {
        // setAccessToken(payload.access_token)
        localStorage.setItem("access_token", payload.access_token);
    }

    if (payload?._xiu) {
        let a = payload._xiu.substring(0,2);
        payload.role = a == "40" ? "super-admin" : (a == "30" ? "system-admin" : (a == "20" ? "corporate-admin" : "editor"))
    }

    store.dispatch({
        type: "SET_MEMBER_DATA",
        payload
    });

    history.push("/")
}

function resetMemberData(payload) {
    store.dispatch({
        type: "RESET_MEMBER_DATA",
        payload
    });
}


function login(payload) {

    localStorage.setItem("access_token", payload.access_token)

    store.dispatch({
        type: "LOGIN",
        payload
    });
}

// async function eventLogger(event) {
//     await AppEventsLogger.logEvent(event);
//     await analytics().logEvent(event)
// }

function loginForVerification(payload) {

    // setAccessToken(payload.access_token)
    // AsyncStorage.setItem("access_token", payload.access_token);

    // OneSignal.sendTags({
    //     push_token: payload.push_token
    // })    

    store.dispatch({
        type: "SET_MEMBER_DATA",
        payload
    });
}

async function logout() {
    localStorage.removeItem("access_token")
    store.dispatch({
        type: "RESET_MEMBER_DATA",
        payload: null
    });
    history.push("/")
}

export {
    store,
    showLoading,
    hideLoading,
    showAlert,
    hideAlert,
    setMemberData,
    login,
    logout,
    loginForVerification,
    resetMemberData,
    setNewApplicants
}