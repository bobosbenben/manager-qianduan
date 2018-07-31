import React,{Component} from 'react';
import { Table, Button, Modal, message } from 'antd';
import PresentDistributeQueryWindow from './widgets/PresentDistributeQueryWindow';
import RegisterPresentWindow from './widgets/RegisterPresentWindow';
import {connect} from 'react-redux';
require('es6-promise').polyfill();
require('isomorphic-fetch');

const columns = [{
    title: '姓名',
    dataIndex: 'customerName',
    key: 'customerName',
    width: '20%'
},{
    title: '身份证号',
    dataIndex: 'identityNumber',
    key: 'identityNumber',
    width: '20%'
},{
    title: '礼品名称',
    dataIndex: 'presentName',
    key: 'presentName',
    width: '20%'
},{
    title: '领取状态',
    dataIndex: 'distributeFlag',
    key: 'distributeFlag',
    width: '10%',
    render: text => {
        switch (text){
            case '0': return '未领取';
            case '1': return '已领取';

            default : return '后台返回前端无法解析的领取状态'
        }
    }
},{
    title: '领取人',
    dataIndex: 'tellerCode',
    key: 'tellerCode',
    width: '10%'
},{
    title: '领取时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: '20%'
}];


let flag = false;

export default class PresentRecord extends Component {

    constructor(){
        super();

        this.state = {
            data: [],
            pagination: {},
            loading: false,
            modalPresentCustomerQueryWindowVisible: false,
            modalRegisterPresentWindowVisible: false,
            confirmLoading: false,
            selectedRowKeys: [],  // Check here to configure the default column
            pageSize: 7,
            currentSelectRow: null
        };

        this.fetchData = this.fetchData.bind(this);
    }

    handleTableChange = (pagination, filters, sorter) => {
        const pager = { ...this.state.pagination };
        pager.current = pagination.current;
        this.setState({
            pagination: pager,
        });
        this.fetchData({
            limit: pagination.pageSize,
            page: pagination.current,
            start: (pagination.current - 1) * pagination.pageSize
        });
    }

    fetchData = (params = {}) => {
        this.setState({
            loading: true
        });

        let url = '/present/presentCustomer/getrecords';
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({
                limit: this.state.pageSize,
                ...params
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success === false ) {
                    message.error(data.msg);
                }
                if (data.success === true){
                    message.success(data.msg);
                    const pagination = {...this.state.pagination};
                    pagination.pageSize = this.state.pageSize;
                    if(flag) pagination.current = 1;
                    flag = false;
                    pagination.total = data.total;
                    this.setState({
                        data: data.data,
                        pagination
                    });
                }
                this.setState({
                    loading: false
                })
            });
    }

    componentDidMount(){
        this.fetchData({
            start: 0,
            page: 1
        });
    }


    render(){

        const rowSelection = {
            type: 'radio',
            onSelect: (record, selected, selectedRows) => {
                this.setState({
                    currentSelectRow: record
                });
            },
        };


        return(
            <div>
                <Table columns={columns}
                       rowKey={record => record.id}
                       dataSource={this.state.data}
                       pagination={this.state.pagination}
                       loading={this.state.loading}
                       onChange={this.handleTableChange}
                       rowSelection={rowSelection}
                       scroll={{y:true}}
                />
            </div>
        )
    }
}