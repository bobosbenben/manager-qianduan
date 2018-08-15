import React,{Component} from 'react';
import ReactDOM from 'react-dom';
import { Table, Button, Modal, message } from 'antd';
import {connect} from 'react-redux';
import AddMenuWindow from './widgets/AddMenuWindow';
import UpdateMenuWindow from './widgets/UpdateMenuWindow';
import ViewMenuWindow from './widgets/ViewMenuWindow';
import {wrapedFetch} from "../../utils/WrapedFetch";

require('es6-promise').polyfill();
require('isomorphic-fetch');

const columns = [{
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: '20%'
},{
    title: '图标',
    dataIndex: 'iconCls',
    key: 'iconCls',
    width: '15%'
},{
    title: '权限',
    dataIndex: 'permission',
    key: 'permission',
    width: '20%'
},{
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: '15%'
},{
    title: '目标',
    dataIndex: 'target',
    key: 'target',
    width: '15%'
},{
    title: '生成时间',
    dataIndex: 'createTime',
    key: 'createTime',
    width: '15%'
}];

class SysMenu extends Component {

    constructor(props){
        super(props);

        this.state = {
            loading: false,                 //是否正在后台加载数据
            currentSelectRow: null,         //在table中当前选中的行
            treeData: [],                   //菜单树数据
            addMenuModalVisible: false,     //添加菜单window
            updateMenuModalVisible: false,  //更新菜单window
            viewMenuModalVisible: false,    //查看菜单window
            tableHeight: 0                  //table和按钮所占的屏幕高度，用于动态调整table的高度
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

        wrapedFetch('/sys/menu/get',{id:0})
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
        window.addEventListener('resize',this.tableRef)
    }

    componentWillUnmount(){
        window.removeEventListener('resize',this.tableRef)
    }

    /**
     * 遍历菜单树，将叶节点的children由[]更改为null，否则展示时候叶节点也会有‘+’号
     * @param node
     */
    ergodic = (node)=>{
        //更新表格后，用新的数据更新当前选中的记录（否则导致修改记录后，updateWindow中被修改的内容不改变）
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
            case 'addMenu':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要添加菜单的上级菜单');
                        return;
                    }
                    that.setState({addMenuModalVisible:true});
                }
            case 'deleteMenu':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要删除的菜单');
                        return;
                    }
                    Modal.warning({
                        title: '警告',
                        okText: '确认',
                        maskClosable: true,
                        content: '删除菜单将删除本菜单及其子菜单，确认删除?',
                        onOk: function () {
                            wrapedFetch('/sys/menu/delete',{
                                data:[{id: that.state.currentSelectRow.id}]
                            },true,'删除菜单成功')
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
            case 'editMenu':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要修改的菜单');
                        return;
                    }
                    that.setState({updateMenuModalVisible:true});
                }
            case 'viewMenu':
                return function () {
                    if(that.state.currentSelectRow == null){
                        message.error('请选中将要查看的菜单');
                        return;
                    }
                    that.setState({viewMenuModalVisible:true});
                }
            default:
                return function () {
                    message.warn('对不起，暂不支持此功能');
                }
        }
    }

    hideModal = ()=>{
        this.setState({
            addMenuModalVisible:false,
            updateMenuModalVisible: false,
            viewMenuModalVisible: false
        });
    }

    tableRef = ()=>{
        let table = ReactDOM.findDOMNode(this.refs.tableRef);
        if (table !== null && table !== undefined){
            var clientHeight = table.clientHeight;
            if(clientHeight>120) clientHeight = clientHeight - 120; //120是按钮和其他pading占用的高度
            this.setState({tableHeight:clientHeight})
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
            <div style={{overflow:'auto',height:'100%'}}>
                <div style={{height:'100%',display:'flex',flexDirection:'column'}} ref="tableRef">
                    <div style={{height:'30px',backgroundColor:'#ECECEC', padding:'5px 0px 38px 0px'}}>
                        {
                            currentMenuButton.map(button =>{
                                return <Button style={{marginRight:'20px'}} onClick={this.event(button.target)}>{button.name}</Button>
                            })
                        }
                    </div>
                    <div style={{ marginTop:'10px', flex:'auto'}}>
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
                    title="添加菜单"
                    visible={this.state.addMenuModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <AddMenuWindow parentMenu={this.state.currentSelectRow} updateMenuData={this.fetchData.bind(this)}/>
                </Modal>
                <Modal
                    title="修改菜单"
                    visible={this.state.updateMenuModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <UpdateMenuWindow currentMenu={this.state.currentSelectRow} treeData={this.state.treeData} updateMenuData={this.fetchData.bind(this)}/>
                </Modal>
                <Modal
                    title="查看菜单"
                    visible={this.state.viewMenuModalVisible}
                    destroyOnClose={true}
                    onCancel={this.hideModal}
                    footer={null}
                >
                    <ViewMenuWindow currentMenu={this.state.currentSelectRow} treeData={this.state.treeData} />
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

export default connect(mapStateToProps)(SysMenu);