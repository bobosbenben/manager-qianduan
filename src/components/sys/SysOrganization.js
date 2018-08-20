import React,{Component} from 'react';
import { Table, Button, Modal, message } from 'antd';
import {connect} from 'react-redux';
import AddOrganizationWindow from './widgets/AddOrganizationWindow';
import UpdateOrganizationWindow from './widgets/UpdateOrganizationWindow';
import ViewOrganizationWindow from './widgets/ViewOrganizationWindow'
import ReactDOM from "react-dom";
import {wrapedFetch} from "../../utils/WrapedFetch";

require('es6-promise').polyfill();
require('isomorphic-fetch');

const columns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: '30%'
},{
    title: '机构号',
    dataIndex: 'code',
    key: 'code',
    width: '10%'
},{
    title: '类型',
    dataIndex: 'type',
    key: 'type',
    width: '15%'
},{
    title: '图标',
    dataIndex: 'iconCls',
    key: 'iconCls',
    width: '15%'
},{
    title: '地址',
    dataIndex: 'address',
    key: 'address',
    width: '15%'
},{
    title: '电话',
    dataIndex: 'phone',
    key: 'phone',
    width: '15%'
}];

class SysOrganization extends Component {

    constructor(props){
        super(props);

        this.state = {
            loading: false,                 //是否正在后台加载数据
            currentSelectRow: null,         //在table中当前选中的行
            treeData: [],                   //菜单树数据
            addOrganizationModalVisible: false,
            updateOrganizationModalVisible: false,
            viewOrganizationModalVisible: false,
            tableHeight:0
        };

        this.event= this.event.bind(this);
    }

    /**
     * 更新表格，当新增、修改、删除菜单后更新table
     */
    fetchData = ()=>{
        this.setState({
            loading: true
        });

        wrapedFetch('/sys/organization/get')
            .then(data=>{
                this.ergodic(data);
                this.setState({
                    loading:false,
                    treeData: data.children
                });
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
        this.fetchData();
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
            if(clientHeight>120) clientHeight = clientHeight - 120; //120是按钮和其他pading占用的高度
            this.setState({tableHeight:clientHeight})
        }
    }

    /**
     * 遍历菜单树，将叶节点的children由[]更改为null，否则展示时候叶节点也会有‘+’号
     * @param node
     */
    ergodic = (node)=>{
        //更新表格后，用新的数据更新当前选中的记录（否则导致修改记录后，updateWindow中被修改的内容不改变,还是显示的原来的修改前的数据）
        if(this.state.currentSelectRow != null && this.state.currentSelectRow.id === node.id){
            this.setState({currentSelectRow:node});
        }
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
            case 'addOrganization':
                return function () {
                    that.setState({addOrganizationModalVisible:true});
                }
            case 'deleteOrganization':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要删除的机构');
                        return;
                    }
                    Modal.warning({
                        title: '警告',
                        okText: '确认',
                        maskClosable: true,
                        content: '删除机构将删除本机构及其下级机构，确认删除?',
                        onOk: function () {
                            wrapedFetch('/sys/organization/delete',{
                                data:[{id: that.state.currentSelectRow.id}]
                            },true,'删除机构成功')
                                .then(data=>{
                                    that.setState({
                                        loading:false,
                                        currentSelectRow: null
                                    });
                                    that.fetchData();
                                })
                                .catch(ex => {
                                    Modal.error({
                                        title: '错误',
                                        content: ex.message+',错误码：'+ex.code
                                    })
                                    that.setState({loading: false});
                                })
                        }
                    })
                }
            case 'editOrganization':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要修改的机构');
                        return;
                    }
                    that.setState({updateOrganizationModalVisible:true});
                }
            case 'viewOrganization':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要查看的菜单');
                        return;
                    }
                    that.setState({viewOrganizationModalVisible:true});
                }
            default:
                return function () {
                    message.warn('对不起，暂不支持此功能');
                }
        }
    }

    hideModal = ()=>{
        this.setState({
            addOrganizationModalVisible:false,
            updateOrganizationModalVisible: false,
            viewOrganizationModalVisible: false
        });
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
            <div style={{overflow:'auto',height:'100%'}}>
                <div style={{height:'100%',display:'flex',flexDirection:'column'}}>
                    <div style={{height:'30px',backgroundColor:'#ECECEC', padding:'5px 0px 38px 0px'}}>
                        {
                            currentMenuButton.map(button =>{
                                return <Button style={{marginRight:'15px'}} onClick={this.event(button.target)}>{button.name}</Button>
                            })
                        }
                    </div>
                    <div style={{  marginTop:'10px', flex:'auto'}}>
                        <Table columns={columns}
                               rowKey={record => record.id}
                               dataSource={this.state.treeData}
                               pagination={false}
                               loading={this.state.loading}
                               rowSelection={rowSelection}
                               scroll={{y:this.state.tableHeight}}
                        />
                    </div>
                </div>
                <Modal
                    title="添加机构"
                    visible={this.state.addOrganizationModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <AddOrganizationWindow parentOrganization={this.state.currentSelectRow} treeData={this.state.treeData} updateOrganizationData={this.fetchData.bind(this)}/>
                </Modal>
                <Modal
                    title="修改机构"
                    visible={this.state.updateOrganizationModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <UpdateOrganizationWindow currentOrganization={this.state.currentSelectRow} treeData={this.state.treeData} updateOrganizationData={this.fetchData.bind(this)}/>
                </Modal>
                <Modal
                    title="修改机构"
                    visible={this.state.viewOrganizationModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <ViewOrganizationWindow currentOrganization={this.state.currentSelectRow} treeData={this.state.treeData} updateOrganizationData={this.fetchData.bind(this)}/>
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

export default connect(mapStateToProps)(SysOrganization);