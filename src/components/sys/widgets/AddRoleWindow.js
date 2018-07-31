import React,{Component} from 'react';
import { Form, Input, Button, Checkbox, message, Spin, Select, TreeSelect } from 'antd';
import WrapedCheckBox from '../../../utils/WrapedCheckBox';
const FormItem = Form.Item;
const Option = Select.Option;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const SHOW_ALL = TreeSelect.SHOW_ALL;
const SHOW_CHILD = TreeSelect.SHOW_CHILD;

class AddRoleWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentSelectModule: props.currentSelectModule, //当前选中的模块菜单
            modules: props.modules,                         //所有模块
            loading: false,                                 //正在请求数据的状态
            useableChecked: false,                          //表单最后一项“是否可用”的状态
            treeData:[],                                    //表单中“权限”项的菜单树
            organizationTreeData:[],                        //表单中“机构范围”的机构树
            value: null,                                    //表单中“权限”项的菜单树中选中的菜单id，表示单个角色所拥有的菜单
            organizationListItemDisabled:true,              //表单中机构范围项是否是disabled，只有数据范围是“明细设置”时才可以显示该项
            organizationList:[]                             //当角色的权限范围选中为“明细设置”时，该角色可以查看哪些机构的数据
        };
    }

    /**
     * 备注：父组件给子组件的属性更新时，子组件不重新render。为了解决这个问题，使用componentWillReceiveProps函数，props更新时，该函数收到状态，通过在该函数中更新state状态实现更新子组件。
     * */
    componentWillReceiveProps(nextProps) {
        this.setState({currentSelectModule: nextProps.currentSelectModule});
    }

    componentDidMount=()=>{
        //加载菜单数据
        this.setState({
            loading: true
        });
        let url = '/sys/menu/get';
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({id:0}),
        })
            .then(res => res.json())
            .then(data => {
                if (data.success === false ) {
                    message.error(data.msg);
                }
                if (data.success === true){
                    // message.success(data.msg);
                    this.setState({
                        treeData: data.children
                    });
                }
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

    /**
     * 角色数据范围改变时触发该函数
     * @param value
     */
    handleSelectChange=(value)=>{
        //当角色的数据范围是“明细设置”时，需要给该角色设置拥有哪些机构的数据
        if (value === '5'){
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
                        message.success(data.msg);
                        this.ergodic(data);
                        this.setState({
                            organizationTreeData: data.children,
                            organizationListItemDisabled:false
                        });
                    }
                    this.setState({
                        loading:false
                    });
                });
        }
        else {
            this.setState({
                organizationListItemDisabled:true,
                organizationTreeData: []
            });
        }
    }

    /**
     * 更新
     */
    updateModuleRolesData = ()=>{
        this.props.updateModuleRolesData();
    }

    /**
     * 表单中的权限项，当改变了角色拥有的菜单时，更新state，state的值最终会提交到服务端
     * @param value
     */
    onMenuTreeSelectChange=(value)=>{
        this.setState(value);
    }

    /**
     * 表单中的机构范围项，当改变了机构范围时，更新state
     * @param value
     */
    onOrganizationTreeSelectChange=(value)=>{
        this.setState({
            organizationList:value
        });
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({
                    loading: true
                });
                let url = '/sys/role/create';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        data:[{
                            moduleId: values.moduleId,
                            name: values.name,
                            roleType: values.roleType,
                            menuIdList: values.menuIdList,
                            organizationIdList: values.organizationList,
                            dataScope: values.dataScope,
                            remarks: values.remarks,
                            useable: this.state.useableChecked,
                            isNewRecord: true
                        }]
                    }),
                })
                    .then(res => res.json())
                    .then(data => {
                        this.setState({
                            loading: false
                        });
                        if (data.success === false ) {
                            message.error(data.msg);
                        }
                        if (data.success === true){
                            message.success(data.msg);
                            this.updateModuleRolesData();
                        }
                    });
            }
        });
    }

    /**
     * 表单项最后一项“是否可用”的状态，提交时直接将state当中的值提交到服务端
     * @param e
     */
    onUseableChecked = (e)=>{
        this.setState({
            useableChecked:e.target.checked
        });
    }

    render(){
        const formItemLayout = {
            labelCol: {
                xs: { span: 4 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 20 },
                sm: { span: 20 },
            },
        };

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 14,
                    offset: 10,
                },
                sm: {
                    span: 14,
                    offset: 10,
                },
            },
        };

        const { getFieldDecorator } = this.props.form;

        return(
            <Spin spinning={this.state.loading} tip='正在新增...'>
                <Form onSubmit={this.handleSubmit.bind(this)} className="login-form">
                    <FormItem label="所属模块" {...formItemLayout}>
                        {getFieldDecorator('moduleId', {
                            rules:[{
                                required:true,message:'请选择角色所属模块'
                            }],
                            initialValue: this.state.currentSelectModule?this.state.currentSelectModule.id:null
                        })(
                            <Select
                                style={{ width: '100%' }}
                                placeholder="请输入角色所属模块"
                            >
                                {this.state.modules.map(d=><Option key={d.id} value={d.id}>{d.name}</Option>)}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="角色名称"  {...formItemLayout}>
                        {getFieldDecorator('name',{
                            rules:[{
                                required:true,message:'请输入角色名称'
                            }]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="类型"  {...formItemLayout}>
                        {getFieldDecorator('roleType',{
                            rules:[{
                                required:true,message:'请输入角色类型'
                            }]
                        })(
                            <Select placeholder="选择角色类型">
                                <Option value="management">管理角色</Option>
                                <Option value="user">普通角色</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="权限"  {...formItemLayout}>
                        {getFieldDecorator('menuIdList',{
                            rules:[{
                                required:true,message:'请输入该角色拥有的权限'
                            }],
                            initialValue: this.state.value
                        })(
                            <TreeSelect
                              treeData={this.state.treeData}
                              onChange={this.onMenuTreeSelectChange}
                              treeCheckable={true}
                              showCheckedStrategy= {SHOW_PARENT}
                              searchPlaceholder= {'请选择权限范围'}
                              style={{width:'100%'}}
                            />
                        )}
                    </FormItem>
                    <FormItem label="数据范围"  {...formItemLayout}>
                        {getFieldDecorator('dataScope',{
                            rules:[{
                                required:true,message:'请输入数据范围'
                            }]
                        })(
                            <Select placeholder="选择角色数据范围" onChange={this.handleSelectChange}>
                                <Option value="1">所有数据</Option>
                                <Option value="2">所在机构及以下数据</Option>
                                <Option value="3">所在机构数据</Option>
                                <Option value="4">仅本人数据</Option>
                                <Option value="5">按明细设置</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="机构范围"  {...formItemLayout}>
                        {getFieldDecorator('organizationList',{
                            rules:[{
                                required:false,message:'请输入该角色拥有的机构数据范围'
                            }],
                            initialValue: null
                        })(
                            <TreeSelect
                                disabled={this.state.organizationListItemDisabled}
                                treeData={this.state.organizationTreeData}
                                onChange={this.onOrganizationTreeSelectChange}
                                treeCheckable={true}
                                // multiple
                                showCheckedStrategy= {SHOW_CHILD}
                                searchPlaceholder= {'请选择角色拥有的机构数据范围'}
                                style={{width:'100%'}}
                            />
                        )}
                    </FormItem>
                    <FormItem label="备注"  {...formItemLayout}>
                        {getFieldDecorator('remarks',{
                            rules:[{
                                required:false
                            }]
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem label="是否启用"  {...formItemLayout}>
                        {getFieldDecorator('useable',{
                            rules:[{
                                required:true,message:'是否启用'
                            }],
                            initialValue:false
                        })(
                            <WrapedCheckBox onChange={this.onUseableChecked}/>
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" size="large" htmlType="submit">添加</Button>
                    </FormItem>
                </Form>
            </Spin>
        )
    }
}

export default Form.create()(AddRoleWindow);