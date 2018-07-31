import {Modal} from 'antd';
require('es6-promise').polyfill();
require('isomorphic-fetch');

/**
 * 封装fetch，用于适应服务端特殊的数据请求格式
 * @param url 地址
 * @param param 参数，应该为一个数据对象
 */
export const wrapedFetch = (url,param)=>{

    if (url === null || url === undefined){
        Modal.error({
            title: '错误',
            content: '向后台请求数据时无url地址'
        })
    }
    if(param === null||param===undefined) param={};

    return new Promise((resolve,reject)=>{
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({}),
        })
            .then(res => data.json())
            .then((data)=>{
                if (data.success === false) Modal.error({
                    title: '错误',
                    content: data.msg
                });
                return data;
            })


    })

}