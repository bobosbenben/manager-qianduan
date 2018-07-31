import React,{Component} from 'react';
import { message, Button, Table, Modal } from 'antd';
import RepaymentRecordWindow from './widgets/RepaymentRecordWindow'
require('es6-promise').polyfill();
require('isomorphic-fetch');

const confirm = Modal.confirm;
const columns = [{
    title: '帐号',
    dataIndex: 'accountNo',
    key: 'accountNo',
    width: '20%'
},{
    title: '户名',
    dataIndex: 'customerName',
    key: 'customerName',
    width: '20%'
},{
    title: '归还本金',
    dataIndex: 'repaymentPrincipal',
    key: 'repaymentPrincipal',
    width: '15%'
},{
    title: '归还利息',
    dataIndex: 'repaymentInterest',
    key: 'repaymentInterest',
    width: '15%'
},{
    title: '归还复利',
    dataIndex: 'repaymentCompoundInterest',
    key: 'repaymentCompoundInterest',
    width: '15%'
},{
    title: '归还日期',
    dataIndex: 'repaymentDate',
    key: 'repaymentDate',
    width: '15%'
}];

export default class RepaymentNonPerformingLoan extends Component {

    constructor(){
        super();
        this.state={
            pageSize: 7,
            pagination: {},
            loading: false,
            modalVisible: false,
            data: [],
            currentSelectRow: null,
            deleteRecordFlag: false
        }

        this.showModal = this.showModal.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.deleteRecord = this.deleteRecord.bind(this);
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
        this.setState({ loading: true });

        let url = '/bldk/repaymentrecord/get';
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

    showModal = () => {

        //判断是否已经选中一条记录
        let record = this.state.currentSelectRow;
        if (record === undefined || record === null || record.id === undefined ){
            message.info('请先选中要操作的记录');
        }
        else {
            //如果选中记录，则显示其内容
            this.setState({
                modalVisible: true
            });
        }

    }

    handleCancel = () => {
        this.setState({
            modalVisible: false,
        });
    }

    deleteRecord = ()=>{
        let that = this;
        let record = this.state.currentSelectRow;
        if (record === undefined || record === null || record.id === undefined ){
            message.info('请先选中要操作的记录');
        }
        else {
            let url = '/bldk/repaymentrecord/delete';
            this.setState({
                deleteRecordFlag: false
            })
            confirm({
                title: '删除',
                content: '确定删除该条还本还息记录？删除后将无法恢复',
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
                <div className="review-buttons">
                    <Button onClick={this.showModal}>修改</Button>
                    <Button style={{marginLeft:'20px'}} onClick={this.deleteRecord}>删除</Button>
                </div>
                <Table columns={columns}
                       rowKey={record => record.id}
                       dataSource={this.state.data}
                       pagination={this.state.pagination}
                       loading={this.state.loading}
                       onChange={this.handleTableChange}
                       rowSelection={rowSelection}
                       scroll={{y:360}}
                />
                <Modal title="还本还息"
                       visible={this.state.modalVisible}
                       onCancel={this.handleCancel}
                       footer={null}
                       width={360}
                >
                    <RepaymentRecordWindow currentRow={this.state.currentSelectRow}/>
                </Modal>
            </div>
        )
    }
}