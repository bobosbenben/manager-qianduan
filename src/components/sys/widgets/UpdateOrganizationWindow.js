import React,{Component} from 'react';
import { Form, TreeSelect, Input, Button, Modal, Spin, Select } from 'antd';
import WrapedCheckBox from '../../../utils/WrapedCheckBox';
import {wrapedFetch} from "../../../utils/WrapedFetch";

const FormItem = Form.Item;
const Option = Select.Option;

class UpdateOrganizationWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentOrganization: props.currentOrganization, //上级机构，可能为null
            organizations: props.treeData, //从上级组件传入的机构树
            loading: false,
            useableChecked: props.currentOrganization.useable    //表单最后一项“是否启用”的状态
        };
    }

    /**
     * 备注：父组件给子组件的属性更新时，子组件不重新render。为了解决这个问题，使用componentWillReceiveProps函数，props更新时，该函数收到状态，通过在该函数中更新state状态实现更新子组件。
     * */
    componentWillReceiveProps(nextProps) {
        this.setState({currentOrganization: nextProps.currentOrganization});
    }

    handleSelectChange=()=>{
        // console.log('改变了菜单类型');
    }

    updateOrganizationData = ()=>{
        this.props.updateOrganizationData();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({
                    loading: true
                });
                wrapedFetch('/sys/organization/update',{
                    data:[{
                        id: this.state.currentOrganization.id,
                        parentId: values.parentId,
                        hzOrgCOde: values.hzOrgCOde,
                        code: values.code,
                        name: values.name,
                        sort: values.sort,
                        iconCls: values.iconCls,
                        type: values.type,
                        phone: values.phone,
                        address: values.address,
                        useable: this.state.useableChecked
                    }]
                },true,'机构修改成功')
                    .then(data=>{
                        this.setState({
                            loading:false
                        });
                        this.updateOrganizationData();
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

    onUseableCheckedChange = (e)=>{
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
                    <FormItem label="上级机构" {...formItemLayout}>
                        {getFieldDecorator('parentId', {
                            rules:[{
                                required:true,message:'请选择上级机构'
                            }],
                            initialValue: this.state.currentOrganization?this.state.currentOrganization.parentId:1
                        })(
                            <TreeSelect
                                style={{ width: '100%' }}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                treeData={this.state.organizations}
                                placeholder="请选择上级机构"
                                treeDefaultExpandAll
                                // onChange={this.onChange}
                            />
                        )}
                    </FormItem>
                    <FormItem label="机构名称"  {...formItemLayout}>
                        {getFieldDecorator('name',{
                            rules:[{
                                required:true,message:'请输入机构名称'
                            }],
                            initialValue: this.state.currentOrganization.name
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="机构号"  {...formItemLayout}>
                        {getFieldDecorator('code',{
                            rules:[{
                                required:true,message:'请输入机构号'
                            }],
                            initialValue: this.state.currentOrganization.code
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="汇总机构"  {...formItemLayout}>
                        {getFieldDecorator('hzOrgCode',{
                            rules:[{
                                required:false
                            }],
                            initialValue: this.state.currentOrganization.hzOrgCode
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="类型"  {...formItemLayout}>
                        {getFieldDecorator('type',{
                            rules:[{
                                required:true,message:'请输入机构类型'
                            }],
                            initialValue: this.state.currentOrganization.type
                        })(
                            <Select placeholder="选择机构类型" onChange={this.handleSelectChange}>
                                <Option value="104">支行</Option>
                                <Option value="201">管理部门</Option>
                                <Option value="0">公司/企业</Option>
                                <Option value="100">网点分组</Option>
                                <Option value="200">部门分组</Option>
                                <Option value="101">本部</Option>
                                <Option value="102">汇总</Option>
                                <Option value="103">营业部</Option>
                                <Option value="105">分理处</Option>
                                <Option value="106">信用卡中心</Option>
                                <Option value="202">部门下设中心</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="电话"  {...formItemLayout}>
                        {getFieldDecorator('target',{
                            rules:[{
                                required:false
                            }],
                            initialValue: this.state.currentOrganization.phone
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="排序"  {...formItemLayout}>
                        {getFieldDecorator('sort',{
                            rules:[{
                                required:true,message:'请输入排序号'
                            }],
                            initialValue: this.state.currentOrganization.sort
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="图标"  {...formItemLayout}>
                        {getFieldDecorator('iconCls',{
                            rules:[{
                                required:false,message:'请输入图标类型(fontawesome)'
                            }],
                            initialValue: this.state.currentOrganization.iconCls
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="是否启用"  {...formItemLayout}>
                        {getFieldDecorator('useable',{
                            rules:[{
                                required:true,message:'是否启用'
                            }],
                            initialValue: this.state.useableChecked
                        })(
                            <WrapedCheckBox onChange={this.onUseableCheckedChange}/>
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

export default Form.create()(UpdateOrganizationWindow);