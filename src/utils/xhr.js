import store from '../store'
import {Modal} from 'antd';
require('isomorphic-fetch');

// These are "fake network" function that in a real scenario would
// call the backend API and upon return would update your redux state.
// We're just going to skip to the redux part and add a setTimeout
// for some fake latency

export const getLoggedUser = () => {
    store.dispatch({
        type: 'GET_LOGGED_USER'
    });

    let url = '/sys/login';

    fetch(url, {
        credentials: 'include',
        method: 'POST',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
    })
        .then(res=>res.json())
        .then(json=>{
            let loggedIn = json.data.loggedIn;
            let userInfo = json.data.userInfo;

            store.dispatch({
                type: 'SET_LOGGED_USER',
                logged: loggedIn
            });
            store.dispatch({
                type: 'SET_INITIAL_DATA',
                data: userInfo
            });
        });
}

export const login = (username,password) => {
    return new Promise((resolve, reject) => {

        let searchParams = new URLSearchParams();
        searchParams.set('username',username);
        searchParams.set('password',password);
        let url = '/sys/login';

        store.dispatch({
            type: 'GET_LOGGED_USER'
        });
        fetch(url, {
            credentials: 'include',
            method: 'POST',
            body: searchParams
        })
            .then(res=>res.json())
            .then(json=>{
                let loggedIn = json.data.loggedIn;
                let userInfo = json.data.userInfo;

                if (loggedIn === false) Modal.error({
                    title: '提示',
                    content: '用户名或密码错误'
                });
                store.dispatch({
                    type: 'SET_LOGGED_USER',
                    logged: loggedIn
                });
                store.dispatch({
                    type: 'SET_INITIAL_DATA',
                    data: userInfo
                });
                resolve({
                    logged:loggedIn
                });
            })
    })
}

export const logout = ()=>{
    return new Promise((resolve, reject) => {
        let url = '/sys/logout';

        fetch(url, {
            credentials: 'include',
            method: 'POST',
        })
            .then(res=>{
                if (res.status !== 200) Modal.error({
                    title: '错误',
                    content: '退出系统登录时出错'
                });

                store.dispatch({
                    type: 'SET_LOGGED_USER',
                    logged: false
                });
                store.dispatch({
                    type: 'SET_INITIAL_DATA',
                    data: null
                });
                resolve({
                    logged: false
                });
            })
    })
}
