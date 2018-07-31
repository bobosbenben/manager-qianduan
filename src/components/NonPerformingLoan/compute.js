import React,{Component} from 'react';
import { Table, Button, Modal, message } from 'antd';
import RepaymentWindow from './widgets/RepaymentWindow';
import ComputeWindow from './widgets/ComputeWindow';
import UpdateNonPerformingLoanWindow from './widgets/UpdateNonPerformingLoanWindow';
import './nonPerformingLoan.css'
require('es6-promise').polyfill();
require('isomorphic-fetch');

const columns = [{
    title: '帐号',
    dataIndex: 'accountNo',
    key: 'accountNo',
    width: '15%'
},{
    title: '户名',
    dataIndex: 'customerName',
    key: 'customerName',
    width: '15%'
},{
    title: '核销本金',
    dataIndex: 'principal',

    key: 'principal',
    width: '10%'
},{
    title: '核销利息',
    dataIndex: 'interest',
    key: 'interest',
    width: '10%'
},{
    title: '核销复利',
    dataIndex: 'compoundInterest',
    key: 'compoundInterest',
    width: '10%'
},{
    title: '罚息利率',
    dataIndex: 'fxRate',
    key: 'fxRate',
    width: '10%'
},{
    title: '最后一期利息',
    dataIndex: 'beforeHxInterest',
    key: 'beforeHxInterest',
    width: '10%'
},{
    title: '核销日期',
    dataIndex: 'hxDate',
    key: 'hxDate',
    width: '10%'
},{
    title: '结息周期',
    dataIndex: 'interestTerm',
    key: 'interestTerm',
    width: '10%',
    render: text => {
        switch (text){
            case '0': return '按月';
            case '1': return '按季';
            case '2': return '按年';

            default : return '后台返回前端无法解析的结息方式'
        }
    }

}];


const confirm = Modal.confirm;
let flag = false; //用于解决刷新列表时页数不更新的问题
export default class ComputeNonPerformingLoan extends Component {

    constructor(){
        super();

        this.state = {
            data: [],
            pagination: {},
            loading: false,
            modalRepaymentWindowVisible: false,
            modalComputeWindowVisible: false,
            modalUpdateWindowVisible: false,
            confirmLoading: false,
            selectedRowKeys: [],
            pageSize: 7,
            currentSelectRow: null,
            currentSelectRowId: null
        };

        this.handleCancel = this.handleCancel.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.showRepaymentWindowModal = this.showRepaymentWindowModal.bind(this);
        this.showComputeWindowModal = this.showComputeWindowModal.bind(this);
        this.showUpdateWindowModal = this.showUpdateWindowModal.bind(this);
        this.showDeleteModal = this.showDeleteModal.bind(this);
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
            // sortField: sorter.field,
            // sortOrder: sorter.order,
            // ...filters,
        });
    }
    fetchData = (params = {}) => {
        this.setState({ loading: true });

        let url = '/bldk/nonperformingloan/get';
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
                if (data.success === false){
                    message.error(data.msg);
                }
                else {
                    const pagination = {...this.state.pagination};
                    pagination.pageSize = this.state.pageSize;
                    pagination.total = data.total;
                    if(flag) {
                        pagination.current = 1;
                    }
                    flag = false;
                    this.setState({
                        data: data.data,
                        pagination
                    });
                }
                this.setState({
                    loading: false
                })

            })
    }

    componentDidMount(){
        this.fetchData({
            start: 0,
            page: 1
        });
    }

    showRepaymentWindowModal = () => {

        //判断是否已经选中一条记录
        let record = this.state.currentSelectRow;
        if (record === undefined || record === null || record.id === undefined ){
            message.info('请先选中要操作的记录');
        }
        else {
            //如果选中记录，则显示其内容
            this.setState({
                modalRepaymentWindowVisible: true
            });
        }

    }

    showComputeWindowModal = ()=>{
        let record = this.state.currentSelectRow;
        if (record === undefined || record === null || record.id === undefined ){
            message.info('请先选中要操作的记录');
        }
        else {
            //如果选中记录，则显示其内容
            this.setState({
                modalComputeWindowVisible: true
            });
        }
    }

    showUpdateWindowModal = ()=>{
        let record = this.state.currentSelectRow;
        if (record === undefined || record === null || record.id === undefined ){
            message.info('请先选中要操作的记录');
        }
        else {

            this.setState({ loading: true });
            let url = '/bldk/nonperformingloan/get';
            fetch(url,{
                credentials: 'include',
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                body: JSON.stringify({
                    id: record.id
                }),
            })
                .then(res => res.json())
                .then(data => {
                    if (data.success === false){
                        message.error(data.msg);
                    }
                    else {
                        console.log('返回的数据时：');console.log(data.data);
                        // this.setState({
                        //     currentSelectRow:
                        // });
                    }
                    this.setState({
                        loading: false
                    })

                })

            console.log('current selected row is: ',record);
            //如果选中记录，则显示其内容
            this.setState({
                modalUpdateWindowVisible: true
            });
        }
    }

    showDeleteModal = ()=>{
        let that = this;
        let record = this.state.currentSelectRow;
        if (record === undefined || record === null || record.id === undefined ){
            message.info('请先选中要操作的记录');
        }
        else {
            let url = '/bldk/nonperformingloan/delete';
            this.setState({
                deleteRecordFlag: false
            })
            confirm({
                title: '删除',
                content: '确定删除该条贷款？删除将连带删除该条贷款的还款记录',
                onOk() {
                    that.setState({
                        deleteRecordFlag:true
                    });
                    fetch(url,{
                        credentials: 'include',
                        method: 'POST',
                        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                        body: JSON.stringify({
                            data:[{
                                id:record.id
                            }]
                        }),
                    })
                        .then(res => res.json())
                        .then(data => {
                            if (data.success !== true){
                                message.error('删除数据失败,'+data.msg);
                            }
                            else{
                                flag = true;
                                that.fetchData({
                                    start: 0,
                                    page: 1
                                });
                                message.success('成功删除该条贷款记录');
                            }
                        })
                },
                onCancel() {},
            });
        }
    }

    handleCancel = (e) => {
        this.setState({
            modalRepaymentWindowVisible: false,
            modalComputeWindowVisible: false,
            modalUpdateWindowVisible: false
        });
    }

    refreshColumn = ()=>{
        flag = true;
        this.fetchData({
            start: 0,
            page: 1
        })
    }

    render(){

        const rowSelection = {
            type: 'radio',
            onSelect: (record, selected, selectedRows) => {
                this.setState({
                    currentSelectRow: record,
                    currentSelectRowId: record.id,
                    selectedRowKeys: selectedRows
                });
            }
        };

        return(
            <div>
                <div className="review-buttons">
                    <Button onClick={this.showRepaymentWindowModal}>还息</Button>
                    <Button style={{marginLeft:'20px'}} onClick={this.showComputeWindowModal}>计算</Button>
                    <Button style={{marginLeft:'20px'}} onClick={this.showUpdateWindowModal}>修改</Button>
                    <Button style={{marginLeft:'20px'}} onClick={this.showDeleteModal}>删除</Button>
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
                <Modal title="还本还息"
                       visible={this.state.modalRepaymentWindowVisible}
                       onCancel={this.handleCancel}
                       footer={null}
                       width={360}
                >
                    <RepaymentWindow currentRow={this.state.currentSelectRow}/>
                </Modal>
                <Modal
                        title="计息"
                        visible={this.state.modalComputeWindowVisible}
                        onCancel={this.handleCancel}
                        footer={null}
                        width={360}
                >
                    <ComputeWindow currentRow={this.state.currentSelectRow}/>
                </Modal>
                <Modal
                    title="修改"
                    visible={this.state.modalUpdateWindowVisible}
                    destroyOnClose={true}
                    onCancel={this.handleCancel}
                    footer={null}
                    width={360}
                    >
                    <UpdateNonPerformingLoanWindow currentRow={this.state.currentSelectRow} refreshColumn={this.refreshColumn.bind(this)}/>
                </Modal>
            </div>
        )
    }
}