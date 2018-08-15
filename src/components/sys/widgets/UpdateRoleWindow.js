import React,{Component} from 'react';
import { Form, Input, Button, Spin, Select, TreeSelect, Modal } from 'antd';
import WrapedCheckBox from '../../../utils/WrapedCheckBox';
import {wrapedFetch} from "../../../utils/WrapedFetch";

const FormItem = Form.Item;
const Option = Select.Option;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;
const SHOW_ALL = TreeSelect.SHOW_ALL;
const SHOW_CHILD = TreeSelect.SHOW_CHILD;

class UpdateRoleWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentSelectRole: props.currentSelectRole,     //当前选中的角色，即要修改的角色
            currentSelectModule: props.currentSelectModule, //当前选中的模块菜单
            modules: props.modules,                         //所有模块
            loading: false,                                 //正在请求数据的状态
            useableChecked: props.currentSelectRole.useable,                          //表单最后一项“是否可用”的状态
            treeData:[],                                    //表单中“权限”项的菜单树,该项为从后台加载的全部菜单，供用户选择
            organizationTreeData:[],                        //表单中“机构范围”的机构树，该项为全部机构，供用户选择
            initialMenuIdList: props.currentSelectRole.menuIdList,      //表单中“权限”项的菜单树中选中的菜单id，表示单个角色所拥有的菜单
            value: [],                                      //表单中“权限”项的菜单树中选中的菜单id，表示单个角色所拥有的菜单,因为treeSelect控件展示时只需要叶节点即可，所以该变量就是在上面的initialMenuIdList的基础上去掉所有的父节点，将所有的叶节点放入。同时该便量也用于当修改了权限范围时，该变量记录新的权限范围（即所有拥有的菜单树），提交给服务端。
            organizationListItemDisabled:true,              //表单中机构范围项是否是disabled，只有数据范围是“明细设置”时才可以显示该项
            organizationList:[]                             //当角色的权限范围选中为“明细设置”时，该角色可以查看哪些机构的数据
        };
    }

    /**
     * 备注：父组件给子组件的属性更新时，子组件不重新render。为了解决这个问题，使用componentWillReceiveProps函数，props更新时，该函数收到状态，通过在该函数中更新state状态实现更新子组件。
     * */
    componentWillReceiveProps(nextProps) {
        this.setState({currentSelectRole: nextProps.currentSelectRole});
    }

    componentDidMount=()=>{
        //加载菜单数据,用于表单中的“权限”项，即该角色拥有的菜单有哪些
        this.setState({
            loading: true
        });

        wrapedFetch('/sys/menu/get',{id:0})
            .then(data=>{
                this.setState({
                    loading:false,
                    treeData: data.children
                });
                this.ergodicMenuTree(data.children[0]);
            })
            .catch(ex => {
                Modal.error({
                    title: '错误',
                    content: ex.message+',错误码：'+ex.code
                })
                this.setState({loading: false});
            })

        //如果选中的角色是“按明细设置”，那么需要获取机构树，用于表单中“机构范围”
        if (this.state.currentSelectRole.dataScope === 5){
            //请求机构树
            this.setState({
                loading: true
            });

            wrapedFetch('/sys/organization/get')
                .then(data=>{
                    this.ergodic(data);
                    this.setState({
                        loading:false,
                        organizationTreeData: data.children,
                        organizationListItemDisabled:false
                    });
                })
                .catch(ex => {
                    Modal.error({
                        title: '错误',
                        content: ex.message+',错误码：'+ex.code
                    })
                    this.setState({loading: false});
                })
        }//if
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
     * 遍历菜单树，将角色拥有的最小菜单放入this.state.value中，最小菜单的所有父级菜单都不会被放入到value中，因为treeSelect控件的特殊性，选中子菜单就会默认选中父菜单
     * @param node
     */
    ergodicMenuTree = (node)=>{
        if(node.children.length===0){
            if (this.checkItemInArray(node.id,this.state.initialMenuIdList)){
                var array = this.state.value;
                array.push(node.id);
                this.setState({
                    value: array
                })
            }
            return;
        }

        if (node.children && node.children.length>0) {
            for (var i=0;i<node.children.length;i++){
                this.ergodicMenuTree(node.children[i]);
            }
        }
    }

    /**
     * 检验数值是否在数组中档，用于ergodicMenuTree函数
     * @param itemid
     * @param array
     * @returns {boolean}
     */
    checkItemInArray=(itemid,array)=>{
        for(var i=0;i<array.length;i++){
            if (itemid === array[i]) return true;
        }
        return false;
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

            wrapedFetch('/sys/organization/get')
                .then(data=>{
                    this.ergodic(data);
                    this.setState({
                        loading:false,
                        organizationTreeData: data.children,
                        organizationListItemDisabled:false
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
        else {
            this.setState({
                organizationListItemDisabled:true,
                organizationTreeData: []
            });
        }
    }

    /**
     * 更新单个角色后，更新SysRole中的Table中的数据
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

                wrapedFetch('/sys/role/create',{
                    data:[{
                        id: this.state.currentSelectRole.id,
                        moduleId: values.moduleId,
                        name: values.name,
                        roleType: values.roleType,
                        menuIdList: values.menuIdList,
                        organizationIdList: values.organizationList,
                        dataScope: values.dataScope,
                        remarks: values.remarks,
                        useable: this.state.useableChecked
                    }]
                },true,'角色修改成功')
                    .then(data=>{
                        this.setState({
                            loading:false
                        });
                        this.updateModuleRolesData();
                    })
                    .catch(ex => {
                        Modal.error({
                            title: '错误',
                            content: ex.message+',错误码：'+ex.code
                        })
                        this.setState({loading: false});
                    })
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
            <Spin spinning={this.state.loading} tip='正在修改...'>
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
                            }],
                            initialValue:this.state.currentSelectRole.name
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="类型"  {...formItemLayout}>
                        {getFieldDecorator('roleType',{
                            rules:[{
                                required:true,message:'请输入角色类型'
                            }],
                            initialValue:this.state.currentSelectRole.roleType
                        })(
                            <Select placeholder="选择角色类型" >
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
                            }],
                            initialValue:this.state.currentSelectRole.dataScope.toString()
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
                            initialValue: this.state.currentSelectRole.organizationIdList
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
                            }],
                            initialValue: this.state.currentSelectRole.remarks
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem label="是否启用"  {...formItemLayout}>
                        {getFieldDecorator('useable',{
                            rules:[{
                                required:true,message:'是否启用'
                            }],
                            initialValue:this.state.currentSelectRole.useable
                        })(
                            <WrapedCheckBox onChange={this.onUseableChecked}/>
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" size="large" htmlType="submit">修改</Button>
                    </FormItem>
                </Form>
            </Spin>
        )
    }
}

export default Form.create()(UpdateRoleWindow);