import React,{Component} from 'react';
import { Table, Button, Modal, message, Card, Col, Row, Tree, Pagination } from 'antd';
import {connect} from 'react-redux';
import AddUserWindow from './widgets/AddUserWindow';
import UpdateUserWindow from './widgets/UpdateUserWindow';
import ResetPasswordWindow from './widgets/ResetPasswordWindow'
import AlterUserOrganizationWindow from './widgets/AlterUserOrganizationWindow';
import AlterUserRoleWindow from './widgets/AlterUserRoleWindow';
import QueryButton from './widgets/common/QueryButton';
import ReactDOM from "react-dom";
import {wrapedFetch} from '../../utils/WrapedFetch';
require('es6-promise').polyfill();
require('isomorphic-fetch');

const TreeNode = Tree.TreeNode;
const columns = [{
    title: '用户信息',
    children: [{
        title: '柜员号',
        dataIndex: 'userCode',
        key: 'userCode',
        width: '4%',
        align: 'center'
    }, {
        title: '姓名',
        dataIndex: 'userName',
        key: 'userName',
        width: '4%',
        align: 'center'
    },{
        title: '性别',
        dataIndex: 'userGender',
        key: 'userGender',
        width: '2%',
        align: 'center'
    },{
        title: '入职日期',
        dataIndex: 'userEntryDate',
        key: 'userEntryDate',
        width: '5%',
        align: 'center'
    },{
        title: '职务',
        dataIndex: 'userPost',
        key: 'userPost',
        width: '5%',
        align: 'center'
    },{
        title: '身份证号',
        dataIndex: 'userIdCard',
        key: 'userIdCard',
        width: '3%',
        align: 'center'
    },{
        title: '电话',
        dataIndex: 'userPhone',
        key: 'userPhone',
        width: '3%',
        align: 'center'
    },{
        title: '创建时间',
        dataIndex: 'userCreateTime',
        key: 'userCreateTime',
        width: '6%',
        align: 'center'
    },{
        title: '更新时间',
        dataIndex: 'userUpdateTime',
        key: 'userUpdateTime',
        width: '6%',
        align: 'center'
    },{
        title: '拥有的角色',
        dataIndex: 'userRoleNames',
        key: 'userRoleNames',
        width: '15%',
        align: 'center'
    }]
},{
    title: '机构信息',
    children: [{
        title: '机构编号',
        dataIndex: 'organizationCode',
        key: 'organizationCode',
        width: '3%',
        align: 'center'
    },{
        title: '机构',
        dataIndex: 'organizationName',
        key: 'organizationName',
        width: '6%',
        align: 'center',
        render:(text)=>{
            return <span style={{color:'#40a9ff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'inline-block', width:200}}>{text}</span>
        }
    },{
        title: '状态',
        dataIndex: 'statusStr',
        key: 'statusStr',
        width: '2%',
        align: 'center'
    },{
        title: '调入日期',
        dataIndex: 'startDate',
        key: 'startDate',
        width: '5%',
        align: 'center'
    },{
        title: '调出日期',
        dataIndex: 'endDate',
        key: 'endDate',
        width: '5%',
        align: 'center'
    },{
        title: '创建时间',
        dataIndex: 'createTime',
        key: 'createTime',
        width: '6%',
        align: 'center'
    },{
        title: '更新时间',
        dataIndex: 'updateTime',
        key: 'updateTime',
        width: '6%',
        align: 'center'
    }]
},{
    title: '登录信息',
    children: [,{
        title: '是否可以登录',
        dataIndex:'userLoginUseable',
        key: 'userLoginUseable',
        width: '3%',
        align: 'center',
        render:(text,record)=>{
            switch (text){
                case true: return '是';
                case false: return '否';
                default : return '无法识别的状态'
            }
        }
    },{
        title: '登录IP',
        dataIndex: 'userLoginIp',
        key: 'userLoginIp',
        width: '6%',
        align: 'center'
    },{
        title: '登录时间',
        dataIndex: 'userLoginTime',
        key: 'userLoginTime',
        width: '5%',
        align: 'center'
    }]
}];

class SysUser extends Component {

    constructor(props){
        super(props);

        this.state = {
            loading: false,                 //是否正在后台加载数据
            currentOrganizationUsers: [],   //单个机构的所有用户
            organizationTreeData: [],       //机构树数据
            currentSelectRow: null,         //table中当前选中的用户user
            addUserModalVisible: false,
            updateUserModalVisible: false,
            resetPasswordModalVisible:false,
            alterUserOrganizationModalVisible: false,
            alterRoleModalVisible: false,
            currentSelectOrganization: null, //当前选中的机构
            tableHeight: 0,                  //屏幕高度，用于动态调整屏幕高度
            pagination: {},                  //分页条件
            pageSize: 30,                    //单页条数
            queryParamsData:{},
            flag: false                      //是否将页数置为1的flag，如果为true，将页数改为1
        };

        this.event= this.event.bind(this);
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

        let organizationId = null;
        if (this.state.currentSelectOrganization !== null && this.state.currentSelectOrganization !== undefined) organizationId = this.state.currentSelectOrganization.id;

        let queryParam = {
            filter:{
                organizationId: organizationId,
                ...this.state.queryParamsData
            }
        }
        console.log('请求的参数是：'); console.log(queryParam);

        wrapedFetch('/sys/user/get',{
            filter:{
                organizationId: organizationId,
                ...this.state.queryParamsData
            },
            limit: this.state.pageSize,
            ...params
        })
            .then(data=>{
                const pagination = {...this.state.pagination};
                pagination.pageSize = this.state.pageSize;
                if(this.state.flag) pagination.current = 1;
                pagination.total = data.total;
                this.setState({
                    loading:false,
                    flag: false,
                    currentOrganizationUsers: data.data,
                    pagination
                });
                this.updateCurrentSelectUser();
            })
            .catch(ex => {
                Modal.error({
                    title: '错误',
                    content: ex.message+',错误码：'+ex.code
                })
                this.setState({loading: false});
            })
    }

    componentDidMount(){
        //请求机构树，用于表单的“入职机构”项
        this.setState({
            loading: true
        });

        wrapedFetch('/sys/organization/get')
            .then(data=>{
                this.ergodic(data);
                this.setState({
                    organizationTreeData: data.children,
                    loading:false
                });
            })
            .catch(ex => {
                Modal.error({
                    title: '错误',
                    content: ex.message+',错误码：'+ex.code
                })
                this.setState({loading: false});
            })
        this.fetchData({
            start: 0,
            page: 1
        });
        this.tableRef();
        window.addEventListener('resize',this.tableRef); //添加屏幕高度监听器
    }

    componentWillUnmount(){
        window.removeEventListener('resize',this.tableRef) //移除屏幕高度监听器
    }

    /**
     * 获得table的父组件的屏幕高度
     */
    tableRef = ()=>{
        let table = ReactDOM.findDOMNode(this.refs.tableRef);
        if (table !== null && table !== undefined){
            var clientHeight = table.clientHeight;
            if(clientHeight>170) clientHeight = clientHeight - 170; //120是按钮和其他pading占用的高度
            this.setState({tableHeight:clientHeight})
        }
    }

    /**
     * 遍历机构树，将叶节点的children由[]更改为null，否则展示时候叶节点也会有‘+’号
     * @param node
     */
    ergodic = (node)=>{
        if(node.leaf === true){
            node.children = null;
            return;
        }

        if (node.children && node.children.length>0) {
            for (var i=0;i<node.children.length;i++){
                this.ergodic(node.children[i]);
            }
        }
    }

    /**
     * 当table中数据更新后，更新当前选中的currentSelectRole（否则table中的数据已更新，但是state中的currentSelectRow任然保持修改之前的值）
     */
    updateCurrentSelectUser=()=>{
        let currentUsers = this.state.currentOrganizationUsers;
        for(let i=0;i<currentUsers.length;i++){
            if (this.state.currentSelectRow!=null && this.state.currentSelectRow.id == currentUsers[i].id)
                this.setState({
                    currentSelectRow: currentUsers[i]
                });
        }
    };

    setQueryParamsData = (data)=>{
        this.setState({
            flag:true,
            queryParamsData:data
        },()=>{
            this.fetchData({
                start: 0,
                page: 1
            })
        });

    };

    event = (menuName)=>{
        var that = this;
        switch(menuName) {
            case 'addUser':
                return function () {
                    that.setState({addUserModalVisible:true});
                }
            case 'deleteUser':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要删除的用户');
                        return;
                    }
                    Modal.warning({
                        title: '警告',
                        okText: '确认',
                        maskClosable: true,
                        content: '确认删除用户“'+that.state.currentSelectRow.userName+'”?',
                        onOk: function () {
                            wrapedFetch('/sys/user/delete',{
                                data:[{userId: that.state.currentSelectRow.userId}]
                            },true,'删除用户成功')
                                .then(data=>{
                                    that.setState({flag:true});
                                    that.fetchData({
                                        start: 0,
                                        page: 1
                                    });
                                    that.state.currentSelectRow = null;
                                })
                                .catch(ex => {
                                    Modal.error({
                                        title: '错误',
                                        content: ex.message+',错误码：'+ex.code
                                    })
                                })
                        },
                    })
                }
            case 'editUser':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要修改的用户');
                        return;
                    }
                    that.setState({updateUserModalVisible:true});
                }
            case 'resetPassword':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要重置密码的用户');
                        return;
                    }
                    that.setState({resetPasswordModalVisible:true});
                }
            case 'alterOrganization':
                return function () {
                    if (that.state.currentSelectRow == null) {
                        message.error('请选中将要重置密码的用户');
                        return;
                    }
                    that.setState({alterUserOrganizationModalVisible:true});
                }
            case 'alterRole':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要修改角色的柜员');
                        return;
                    }
                    that.setState({alterRoleModalVisible:true});
                }
            default:
                return function () {
                    message.warn('对不起，暂不支持此功能');
                }
        }
    }

    hideModal = ()=>{
        this.setState({
            addUserModalVisible: false,
            updateUserModalVisible: false,
            resetPasswordModalVisible: false,
            alterUserOrganizationModalVisible: false,
            alterRoleModalVisible: false
        });
    }

    /**
     * 渲染“机构”项，在前端加载机构树
     * @param data
     */
    renderTreeNodes = (data) => {
        return data.map((item) => {
            if (item.children) {
                return (
                    <TreeNode title={item.name} key={item.id} dataRef={item}>
                        {this.renderTreeNodes(item.children)}
                    </TreeNode>
                );
            }
            return <TreeNode title={item.name} key={item.id} dataRef={item}/>;
        });
    }

    /**
     * 选中一个机构后，加载该机构的所有用户
     * @param selectedKeys
     * @param info
     */
    onOrganizationTreeSelect = (selectedKeys,info)=>{
        if (info.selectedNodes.length>0){
            let currentSelectOrganization = info.selectedNodes[0].props.dataRef;
            this.setState({
                currentSelectOrganization: currentSelectOrganization
            },()=>{
                //在左边树中选中一条模块菜单后，获取该模块菜单的所有角色，并将结果显示在table中
                this.fetchData({
                    start:0,
                    page:1
                });
            });
        }
    }

    /**
     * 刷新table，当更新、修改、删除表格中的数据后需要刷新表格中的数据
     */
    refreshColumn = ()=>{
        this.setState({flag:true});
        this.fetchData({
            start: 0,
            page: 1
        })
    }

    render(){

        const {currentMenuButton} = this.props;

        const rowSelection = {
            type: 'radio',
            onSelect: (record, selected, selectedRows) => {
                this.setState({
                    currentSelectRow: record
                });
            },
        };

        const queryItem = [{
            type: 'string',
            name: 'userCode',
            enName: '柜员号',
            initialValue: null
        },{
            type: 'string',
            name: 'userName',
            enName: '姓名',
            initialValue: null
        }];

        return(
            <div style={{overflow:'auto',height:'100%'}}>
                <div style={{ background: '#ECECEC', padding: '20px 10px 0px 10px',height:'100%'}}>
                    <Row gutter={16} style={{height:'100%', marginTop:'-10px'}}>
                        <Col span={4} style={{height:'100%'}}>
                            <Card title="机构树" bordered={false} style={{height:'100%',overflowY:'scroll'}}>
                                <Tree onSelect={this.onOrganizationTreeSelect}
                                      defaultExpandAll
                                      showLine
                                >
                                    {this.renderTreeNodes(this.state.organizationTreeData)}
                                </Tree>
                            </Card>
                        </Col>
                        <Col span={20} style={{height:'100%'}}>
                            <div style={{height:'100%',display:'flex',flexDirection:'column',backgroundColor:'white'}} ref="tableRef">
                                <div style={{height:'30px',backgroundColor:'#ECECEC', padding:'0px 0px 38px 0px'}}>
                                    {
                                        currentMenuButton.map(button =>{
                                            return <Button style={{marginRight:'15px'}} onClick={this.event(button.target)}>{button.name}</Button>
                                        })
                                    }
                                    <span>
                                        <QueryButton items={queryItem} setQueryParamsData={this.setQueryParamsData.bind(this)}/>
                                    </span>
                                </div>
                                <div style={{flex:'auto'}}>
                                    <Table columns={columns}
                                           bordered
                                           size="small"
                                           rowKey={record => record.id}
                                           dataSource={this.state.currentOrganizationUsers}
                                           pagination={this.state.pagination}
                                           onChange={this.handleTableChange}
                                           loading={this.state.loading}
                                           rowSelection={rowSelection}
                                           scroll={{x:'4000px',y:this.state.tableHeight}}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
                <Modal
                    title="添加用户"
                    visible={this.state.addUserModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                    width={600}
                >
                    <AddUserWindow refreshColumn={this.refreshColumn.bind(this)} organizationTreeData={this.state.organizationTreeData} />
                </Modal>
                <Modal
                    title="修改用户"
                    visible={this.state.updateUserModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <UpdateUserWindow refreshColumn={this.refreshColumn.bind(this)} currentSelectUser={this.state.currentSelectRow}/>
                </Modal>
                <Modal
                    title="重置用户密码"
                    visible={this.state.resetPasswordModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <ResetPasswordWindow currentSelectUser={this.state.currentSelectRow}/>
                </Modal>
                <Modal
                    title="调动"
                    visible={this.state.alterUserOrganizationModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <AlterUserOrganizationWindow refreshColumn={this.refreshColumn.bind(this)} currentSelectUser={this.state.currentSelectRow} organizationTreeData={this.state.organizationTreeData}/>
                </Modal>
                <Modal
                    title="修改角色"
                    visible={this.state.alterRoleModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <AlterUserRoleWindow refreshColumn={this.refreshColumn.bind(this)} currentSelectUser={this.state.currentSelectRow}  />
                </Modal>

            </div>
        )
    }
}

function mapStateToProps({ loggedUserState }) {
    return {
        currentMenuButton: loggedUserState.currentMenuButton
    }
}

export default connect(mapStateToProps)(SysUser);