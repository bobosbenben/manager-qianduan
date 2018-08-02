import React,{Component} from 'react';
import { Table, Button, Modal, message, Card, Col, Row, Tree, Layout } from 'antd';
import {connect} from 'react-redux';
import AddRoleWindow from './widgets/AddRoleWindow';
import UpdateRoleWindow from './widgets/UpdateRoleWindow';
import ViewRoleWindow from './widgets/ViewRoleWindow';
require('es6-promise').polyfill();
require('isomorphic-fetch');

const {Content} = Layout;
const TreeNode = Tree.TreeNode;
const columns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: '20%'
}, {
    title: '角色类型',
    dataIndex: 'roleType',
    key: 'roleType',
    width: '20%',
    render: (text, record) => {
        switch(text){
            case 'management': return '管理角色';
            case 'user': return '普通角色';
            default: return '无法识别的角色类型';
        }
    }
},{
    title: '数据范围',
    dataIndex: 'dataScopeStr',
    key: 'dataScopeStr',
    width: '15%'
},{
    title: '是否启用',
    dataIndex: 'useable',
    width: '15%',
    render: (text, record)=>{
        switch (text){
            case true: return '是';
            default: return '否';
        }
    }
},{
    title: '备注',
    dataIndex: 'remarks',
    key: 'remarks',
    width: '15%'
},{
    title: '创建时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: '15%'
}];

class SysUser extends Component {

    constructor(props){
        super(props);

        this.state = {
            loading: false,                 //是否正在后台加载数据
            currentModuleRoles: [],         //单个module的所有角色
            treeData: [],                   //菜单树数据
            organizationTreeData: [],       //机构树数据
            currentSelectRow: null,         //table中当前选中的角色
            addRoleModalVisible: false,
            updateRoleModalVisible: false,
            viewRoleModalVisible: false,
            currentSelectModule: null,
        };

        this.event= this.event.bind(this);
    }

    /**
     * 更新表格，当新增、修改、删除菜单后更新table
     */
    fetchData = ()=> {
        var that = this;
        if (this.state.currentSelectModule === null) return;
        let currentModule = this.state.currentSelectModule;
        this.setState({
            loading: true
        });
        let url = '/sys/role/moduleroles';
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({
                data:[{
                    moduleId: currentModule.id
                }]
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
                        currentModuleRoles: data.data
                    });
                    that.updateCurrentSelectRole();
                }
                this.setState({
                    loading:false
                });
            });
    }

    /**
     * 当table中数据更新后，更新当前选中的currentSelectRole（否则table中的数据已更新，但是state中的currentSelectRow任然保持修改之前的值）
     */
    updateCurrentSelectRole=()=>{
        let currentModuleRoles = this.state.currentModuleRoles;
        for(var i=0;i<currentModuleRoles.length;i++){
            if (this.state.currentSelectRow!=null && this.state.currentSelectRow.id == currentModuleRoles[i].id)
                this.setState({
                    currentSelectRow: currentModuleRoles[i]
                });
        }
    }

    componentDidMount(){
        //请求机构树
        this.setState({
            loading: true
        });
        let url = '/sys/organization/get';
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({}),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success === false ) {
                    message.error(data.msg);
                }
                if (data.success === true){
                    this.ergodic(data);
                    this.setState({
                        organizationTreeData: data.children
                    });
                }
                console.log('organizationTreeData:'); console.log(this.state.organizationTreeData);
                this.setState({
                    loading:false
                });
            });
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

    event = (menuName)=>{
        var that = this;
        switch(menuName) {
            case 'addRole':
                return function () {
                    that.setState({addRoleModalVisible:true});
                }
            case 'deleteRole':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要删除的角色');
                        return;
                    }
                    Modal.warning({
                        title: '警告',
                        okText: '确认',
                        maskClosable: true,
                        content: '确认删除角色“'+that.state.currentSelectRow.name+'”?',
                        onOk: function () {
                            let url = '/sys/role/delete';
                            fetch(url,{
                                credentials: 'include',
                                method: 'POST',
                                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                                body: JSON.stringify({
                                    data:[{id: that.state.currentSelectRow.id}]
                                }),
                            })
                                .then(res => res.json())
                                .then(data => {
                                    if (data.success === false ) {
                                        message.error(data.msg);
                                    }
                                    if (data.success === true){
                                        message.success(data.msg);
                                        that.fetchData();
                                        that.state.currentSelectRow = null;
                                    }
                                });
                        },
                    })
                }
            case 'editRole':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要修改的角色');
                        return;
                    }
                    that.setState({updateRoleModalVisible:true});
                }
            case 'viewRole':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要查看的角色');
                        return;
                    }
                    that.setState({viewRoleModalVisible:true});
                }
            default:
                return function () {
                    message.warn('对不起，暂不支持此功能');
                }
        }
    }

    hideModal = ()=>{
        this.setState({
            addRoleModalVisible: false,
            updateRoleModalVisible: false,
            viewRoleModalVisible: false
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
     * 选中一个系统模块后，加载该模块的所有角色
     * @param selectedKeys
     * @param info
     */
    onTreeSelect = (selectedKeys,info)=>{
        if (info.selectedNodes.length>0){
            let currentModule = info.selectedNodes[0].props.dataRef;
            this.setState({
                currentSelectModule: currentModule
            });
            //在左边树中选中一条模块菜单后，获取该模块菜单的所有角色，并将结果显示在table中
            this.setState({
                loading: true
            });
            let url = '/sys/role/moduleroles';
            fetch(url,{
                credentials: 'include',
                method: 'POST',
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                body: JSON.stringify({
                    data:[{
                        moduleId: currentModule.id
                    }]
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
                            currentModuleRoles: data.data
                        });
                    }
                    this.setState({
                        loading:false
                    });
                });
        }
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

        return(
            <div style={{overflow:'auto',height:'100%',backgroundColor:'blue'}}>

                <div style={{ background: '#ECECEC', padding: '10px',height:'100%'}}>
                    <Row gutter={16} style={{height:'100%'}}>
                        <Col span={4} style={{height:'100%'}}>
                            <Card title="机构树" bordered={false} style={{height:'100%',overflowY:'scroll'}}>
                                <Tree onSelect={this.onTreeSelect}
                                      defaultExpandAll
                                      showLine
                                >
                                    {this.renderTreeNodes(this.state.organizationTreeData)}
                                </Tree>
                            </Card>
                        </Col>
                        <Col span={20}>
                            <div>
                                {
                                    currentMenuButton.map(button =>{
                                        return <Button style={{marginRight:'20px'}} onClick={this.event(button.target)}>{button.name}</Button>
                                    })
                                }
                            </div>
                            <div style={{paddingTop:'10px'}}>
                                <Table columns={columns}
                                       rowKey={record => record.id}
                                       dataSource={this.state.currentModuleRoles}
                                       pagination={false}
                                       loading={this.state.loading}
                                       rowSelection={rowSelection}
                                       scroll={{y:true}}
                                />
                            </div>
                        </Col>
                    </Row>
                </div>
                <Modal
                    title="添加角色"
                    visible={this.state.addRoleModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <AddRoleWindow currentSelectModule={this.state.currentSelectModule} modules={this.state.treeData} updateModuleRolesData={this.fetchData.bind(this)}/>
                </Modal>
                <Modal
                    title="修改角色"
                    visible={this.state.updateRoleModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <UpdateRoleWindow currentSelectModule={this.state.currentSelectModule} currentSelectRole={this.state.currentSelectRow} modules={this.state.treeData} updateModuleRolesData={this.fetchData.bind(this)} />
                </Modal>
                <Modal
                    title="查看角色"
                    visible={this.state.viewRoleModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <ViewRoleWindow currentSelectModule={this.state.currentSelectModule} currentSelectRole={this.state.currentSelectRow} modules={this.state.treeData} />
                </Modal>

            </div>
        )
    }
}

function mapStateToProps({ loggedUserState }) {
    return {
        initialData: loggedUserState.initialData,
        currentMenuButton: loggedUserState.currentMenuButton
    }
}

export default connect(mapStateToProps)(SysUser);