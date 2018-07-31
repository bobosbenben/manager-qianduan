import React,{Component} from 'react';
import { Table, Button, Modal, message } from 'antd';
import PresentDistributeQueryWindow from './widgets/PresentDistributeQueryWindow';
import RegisterPresentWindow from './widgets/RegisterPresentWindow';
import {connect} from 'react-redux';
require('es6-promise').polyfill();
require('isomorphic-fetch');


const confirm = Modal.confirm;
const columns = [{
    title: '姓名',
    dataIndex: 'customerName',
    key: 'customerName',
    width: '25%'
},{
    title: '身份证号',
    dataIndex: 'identityNumber',
    key: 'identityNumber',
    width: '25%'
},{
    title: '礼品名称',
    dataIndex: 'presentName',
    key: 'presentName',
    width: '25%'
},{
    title: '领取状态',
    dataIndex: 'distributeFlag',
    key: 'distributeFlag',
    width: '20%',
    render: text => {
        switch (text){
            case '0': return '未领取';
            case '1': return '已领取';

            default : return '后台返回前端无法解析的领取状态'
        }
    }
}];
let identityNumber = null;
let flag = false; //用于更新分页页数

class PresentDistribute extends Component {

    constructor(props){
        super(props);

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

        this.showPresentCustomerQueryWindowModal = this.showPresentCustomerQueryWindowModal.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.distributePresent = this.distributePresent.bind(this);
        this.onGetCustomerPresents = this.onGetCustomerPresents.bind(this);
        this.onGetDistributeCustomerPresents = this.onGetDistributeCustomerPresents.bind(this);
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

        let url = '/present/presentCustomer/getcustomerpresents';
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({
                data:[{
                    identityNumber: identityNumber
                }],
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

    distributePresent = ()=>{
        let that = this;
        let record = this.state.currentSelectRow;
        if (record === undefined || record === null || record.id === undefined ){
            message.info('请先选中要操作的记录');
        }
        else {
            let url = '/present/presentCustomer/distributepresent';

            confirm({
                title: '发放',
                content: '确定向该客户发放该礼品？',
                onOk() {
                    fetch(url,{
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                        body: JSON.stringify({
                                id:record.id

                        }),
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success !== true){
                                message.error('发放礼品失败,'+data.msg);
                            }
                            else that.fetchData({
                                start: 0,
                                page: 1
                            });
                        })
                },
                onCancel() {},
            });
        }
    }

    showPresentCustomerQueryWindowModal = () => {
        //如果选中记录，则显示其内容
        this.setState({
            modalPresentCustomerQueryWindowVisible: true
        });
    }

    handleCancel = () => {
        this.setState({
            modalPresentCustomerQueryWindowVisible: false,
            modalRegisterPresentWindowVisible: false
        });
    }

    componentDidMount(){

    }

    onGetDistributeCustomerPresents = (values)=>{
        identityNumber = values.identityNumber;
        flag = true;
        this.fetchData({
            start:0,
            page:1
        });
    }

    onGetCustomerPresents = (values)=>{

        let url = '/present/presentCustomer/registerpresent';
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({
                identityNumber: values.identityNumber,
                customerName: values.customerName,
                presentId: values.presentId,
                accountNo: values.accountNo,
                phoneNumber: values.phoneNumber
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success === false ) {
                    message.error(data.msg);
                }
                if (data.success === true){
                    message.success(data.msg);
                    this.setState({
                        modalRegisterPresentWindowVisible: false
                    });
                }
                this.setState({
                    loading: false
                })
            });


    }

    registerPresent = ()=>{
        this.setState({
            modalRegisterPresentWindowVisible: true
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
                <div>
                    <Button onClick={this.showPresentCustomerQueryWindowModal}>查询</Button>
                    <Button style={{marginLeft:'20px'}} onClick={this.distributePresent}>发放</Button>
                    <Button style={{marginLeft: '20px'}} onClick={this.registerPresent}>登记</Button>
                </div>
                <Table columns={columns}
                       rowKey={record => record.id}
                       dataSource={this.state.data}
                       pagination={this.state.pagination}
                       loading={this.state.loading}
                       onChange={this.handleTableChange}
                       rowSelection={rowSelection}
                       scroll={{y:true}}
                />
                <Modal title="发放礼品-向指定用户发放的礼品"
                       visible={this.state.modalPresentCustomerQueryWindowVisible}
                       destroyOnClose={true}
                       onCancel={this.handleCancel}
                       footer={null}
                       width={360}
                >
                    <PresentDistributeQueryWindow onGetDistributeCustomerPresents={this.onGetDistributeCustomerPresents} currentRow={this.state.currentSelectRow}/>
                </Modal>
                <Modal title="登记礼品-向所有用户发放的礼品"
                       visible={this.state.modalRegisterPresentWindowVisible}
                       destroyOnClose={true}
                       onCancel={this.handleCancel}
                       footer={null}
                       width={360}
                >
                    <RegisterPresentWindow onGetCustomerPresents={this.onGetCustomerPresents} currentRow={this.state.currentSelectRow}/>
                </Modal>
            </div>
        )
    }
}

function mapStateToProps(state) {
    return {
        customerPresents: state.customerPresents
    }
}

export default connect(mapStateToProps)(PresentDistribute);