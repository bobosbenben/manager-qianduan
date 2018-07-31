import React,{Component} from 'react';
import { Form, Icon, Input, Button, Checkbox, message, Spin, Select } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;

class AddMenuWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            record: props.parentMenu,
            loading: false
        };

        this.updateMenuData = this.updateMenuData.bind(this);
    }

    /**
     * 备注：父组件给子组件的属性更新时，子组件不重新render。为了解决这个问题，使用componentWillReceiveProps函数，props更新时，该函数收到状态，通过在该函数中更新state状态实现更新子组件。
     * */
    componentWillReceiveProps(nextProps) {
        this.setState({record: nextProps.parentMenu});
    }

    handleSelectChange=()=>{
        // console.log('改变了菜单类型');
    }

    updateMenuData = ()=>{
        this.props.updateMenuData();
    }

    handleSubmit = (e) => {
        var that = this;
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({
                    loading: true
                });
                let url = '/sys/menu/create';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        data:[{
                            parentId: that.state.record.id,
                            name: values.name,
                            sort: values.sort,
                            type: values.type,
                            target: values.target,
                            iconCls: values.iconCls,
                            permission: values.permission,
                            description: values.description,
                            remarks: values.remarks,
                            isShow: '1',
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
                            this.updateMenuData();
                        }
                    });
            }
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
                    <FormItem label="上级菜单" {...formItemLayout}>
                        {getFieldDecorator('parentMenu', {
                            initialValue: this.props.parentMenu.name
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="名称"  {...formItemLayout}>
                        {getFieldDecorator('name',{
                            rules:[{
                                required:true,message:'请输入菜单名称'
                            }]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="说明"  {...formItemLayout}>
                        {getFieldDecorator('description',{
                            rules:[{
                                required:false
                            }]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="类型"  {...formItemLayout}>
                        {getFieldDecorator('type',{
                            rules:[{
                                required:true,message:'请输入菜单类型'
                            }]
                        })(
                            this.state.record.type=='menu_root'?<Select placeholder="选择菜单类型"  onChange={this.handleSelectChange}>
                                <Option value="menu_group">菜单分组</Option>
                            </Select>:<Select placeholder="选择菜单类型" onChange={this.handleSelectChange}>
                                <Option value="menu">菜单模块</Option>
                                <Option value="button">功能按钮</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="目标"  {...formItemLayout}>
                        {getFieldDecorator('target',{
                            rules:[{
                                required:true,message:'请输入目标名称'
                            }]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="权限"  {...formItemLayout}>
                        {getFieldDecorator('permission',{
                            rules:[{
                                required:true,message:'请输入权限字段'
                            }]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="排序"  {...formItemLayout}>
                        {getFieldDecorator('sort',{
                            rules:[{
                                required:true,message:'请输入排序号'
                            }]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="图标"  {...formItemLayout}>
                        {getFieldDecorator('iconCls',{
                            rules:[{
                                required:true,message:'请输入图标类型(fontawesome)'
                            }]
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="备注"  {...formItemLayout}>
                        {getFieldDecorator('remarks',{
                            rules:[{
                                required:false
                            }]
                        })(
                            <Input/>
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

export default Form.create()(AddMenuWindow);