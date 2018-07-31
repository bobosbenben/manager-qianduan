import React,{Component} from 'react';
import { Form, Input, Button, Select, TreeSelect, message, Spin } from 'antd';
const Option = Select.Option;
const FormItem = Form.Item;

class ViewMenuWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            view: props.view,
            loading:false,                  //加载状态
            menus: props.treeData,          //该用户可获得的所有菜单，以树形结构从服务端下传
            currentMenu: props.currentMenu, //当前在table中被选中的菜单
            currentMenuParentMenu: null     //当前菜单的父菜单
        };
    }

    componentDidMount(){
        //获取当前选中菜单的父菜单
        let currentMenu = this.state.currentMenu;
        this.setState({
            loading: true
        });
        let url = '/sys/menu/getparentmenu';
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({
                data:[{id:currentMenu.id}]
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
                    this.setState({
                        currentMenuParentMenu:data.data
                    });
                }
            });
    }

    componentWillReceiveProps(nextProps) {
        // console.log('props更新'); console.log(nextProps.currentMenu);
        this.setState({currentMenu: nextProps.currentMenu});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                });
                let url = '/sys/menu/update';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        data: [{
                            id: this.state.currentMenu.id,
                            parentId: values.parentId,
                            name: values.name,
                            description: values.description,
                            type: values.type,
                            target: values.target,
                            permission: values.permission,
                            sort: values.sort,
                            iconCls: values.iconCls,
                            remarks: values.remarks
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
                            this.props.updateMenuData();
                        }
                    });
            }
        });
    }

    render(){

        const { getFieldDecorator } = this.props.form;

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

        return(
            <Spin spinning={this.state.loading} tip='正在修改...'>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem label="上级菜单" {...formItemLayout}>
                        {getFieldDecorator('parentId', {
                            rules:[{
                                required:true,message:'请选择上级菜单'
                            }],
                            initialValue: this.state.currentMenu?this.state.currentMenu.parentId:1
                        })(
                            <TreeSelect
                                style={{ width: '100%' }}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                treeData={this.state.menus}
                                placeholder="请选择父菜单"
                                treeDefaultExpandAll
                                // onChange={this.onChange}
                            />
                        )}
                    </FormItem>
                    <FormItem label="名称"  {...formItemLayout}>
                        {getFieldDecorator('name',{
                            rules:[{
                                required:true,message:'请输入菜单名称'
                            }],
                            initialValue: this.state.currentMenu.name
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="说明"  {...formItemLayout}>
                        {getFieldDecorator('description',{
                            rules:[{
                                required:false
                            }],
                            initialValue: this.state.currentMenu.description
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="类型"  {...formItemLayout}>
                        {getFieldDecorator('type',{
                            rules:[{
                                required:true,message:'请输入菜单类型'
                            }],
                            initialValue: this.state.currentMenu.type
                        })(
                            <Select placeholder="选择菜单类型" onChange={this.handleSelectChange} defaultValue={this.state.currentMenu.type}>
                                <Option value="menu_group">菜单分组</Option>
                                <Option value="menu">菜单模块</Option>
                                <Option value="button">功能按钮</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="目标"  {...formItemLayout}>
                        {getFieldDecorator('target',{
                            rules:[{
                                required:true,message:'请输入目标名称'
                            }],
                            initialValue: this.state.currentMenu.target
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="权限"  {...formItemLayout}>
                        {getFieldDecorator('permission',{
                            rules:[{
                                required:true,message:'请输入权限字段'
                            }],
                            initialValue: this.state.currentMenu.permission
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="排序"  {...formItemLayout}>
                        {getFieldDecorator('sort',{
                            rules:[{
                                required:true,message:'请输入排序号'
                            }],
                            initialValue: this.state.currentMenu.sort
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="图标"  {...formItemLayout}>
                        {getFieldDecorator('iconCls',{
                            rules:[{
                                required:true,message:'请输入图标类型(fontawesome)'
                            }],
                            initialValue: this.state.currentMenu.iconCls
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem label="备注"  {...formItemLayout}>
                        {getFieldDecorator('remarks',{
                            rules:[{
                                required:false
                            }],
                            initialValue: this.state.currentMenu.remarks
                        })(
                            <Input/>
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" size="large" htmlType="submit" disabled={true}>修改</Button>
                    </FormItem>
                </Form>
            </Spin>
        )
    }
}
export default Form.create()(ViewMenuWindow);