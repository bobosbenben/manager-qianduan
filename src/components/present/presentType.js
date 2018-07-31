import React,{Component} from 'react';
import { Table, Button, Modal, message } from 'antd';
import PresentTypeWindow from './widgets/PresentTypeWindow';
require('es6-promise').polyfill();
require('isomorphic-fetch');


const confirm = Modal.confirm;
const columns = [{
    title: '名称',
    dataIndex: 'presentName',
    key: 'presentName',
    width: '30%'
},{
    title: '起始日期',
    dataIndex: 'startDate',
    key: 'startDate',
    width: '20%'
},{
    title: '终止日期',
    dataIndex: 'endDate',
    key: 'endDate',
    width: '20%'
},{
    title: '可领取网点',
    dataIndex: 'orgCode',
    width: '30'
}];


export default class PresentType extends Component {

    constructor(){
        super();

        this.state = {
            data: [],
            pagination: {},
            loading: false,
            modalPresentTypeWindowVisible: false,
            confirmLoading: false,
            selectedRowKeys: [],  // Check here to configure the default column
            pageSize: 7,
            currentSelectRow: null
        };

        this.showPresentTypeWindowModal = this.showPresentTypeWindowModal.bind(this);
        this.handleCancel = this.handleCancel.bind(this);
        this.handleTableChange = this.handleTableChange.bind(this);
        this.deleteRecord = this.deleteRecord.bind(this);

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

        let url = '/present/presentType/get';
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

    deleteRecord = ()=>{
        let that = this;
        let record = this.state.currentSelectRow;
        if (record === undefined || record === null || record.id === undefined ){
            message.info('请先选中要操作的记录');
        }
        else {
            console.log("record: ",record);
            let url = '/present/presentType/delete';
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

    showPresentTypeWindowModal = () => {
        //如果选中记录，则显示其内容
        this.setState({
            modalPresentTypeWindowVisible: true
        });
    }

    handleCancel = () => {
        this.setState({
            modalPresentTypeWindowVisible: false,
        });
        this.fetchData({
            start: 0,
            page: 1
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
                <div className="review-buttons">
                    <Button onClick={this.showPresentTypeWindowModal}>新增</Button>
                    <Button style={{marginLeft:'20px'}} onClick={this.deleteRecord}>删除</Button>
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
                <Modal title="新增礼品"
                       visible={this.state.modalPresentTypeWindowVisible}
                       onCancel={this.handleCancel}
                       footer={null}
                       width={360}
                >
                    <PresentTypeWindow currentRow={this.state.currentSelectRow}/>
                </Modal>
            </div>
        )
    }
}