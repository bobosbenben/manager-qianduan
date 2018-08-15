import {Modal,message} from 'antd';
require('es6-promise').polyfill();
require('isomorphic-fetch');

/**
 * 封装fetch，用于适应服务端特殊的数据请求格式
 * @param url 地址
 * @param params 参数，应该为一个数据对象
 * @param showSuccessMessage 请求成功时是否显示成功信息
 * @param messageContent 如果显示成功信息时显示的内容
 */
export const wrapedFetch = (url,params={},showSuccessMessage=false,messageContent='请求数据成功')=>{

    if (url === null || url === undefined || url === ''){
        Modal.error({
            title: '错误',
            content: '向后台请求数据时无url地址'
        });
        return;
    }

    return new Promise((resolve,reject)=>{
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({
                ...params
            }),
        })
            .then(res => {
                if(res.status === 500){
                    reject({
                        code: 500,
                        message: '服务器发生内部错误，请联系管理员'
                    });
                }
                else if(res.status === 404){
                    reject({
                        code: 404,
                        message: '无法找到页面，错误的请求地址或服务器已停止，请联系管理员'
                    });
                }
                else if (res.status === 200){//不能用resolve，因为res.json()本身就是一个Promise
                    return res.json();
                }
                else {
                    reject({
                        code: res.status,
                        message: '其他系统错误，请联系管理员'
                    });
                }
            })
            .then((data)=>{
                if(data !== null && data !== undefined){
                    if (data.success === false){
                        reject({
                            code: 200,
                            message: data.msg
                        });
                    }
                    else {
                        if (showSuccessMessage === true){
                            message.success(messageContent);
                        }
                        resolve(data);
                    }
                }
            })

    })
}