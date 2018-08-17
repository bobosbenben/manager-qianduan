import React,{Component} from 'react';
import { Form, Input, Button, Modal, Spin, Select, Row, Col } from 'antd';
import {wrapedFetch} from "../../../utils/WrapedFetch";

const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea} = Input;

class UpdateUserPasswordWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentSelectUser: props.currentSelectUser,     //当前选中的用户，即要修改的用户
            loading: false,                                 //正在请求数据的状态
        };
    }

    /**
     * 备注：父组件给子组件的属性更新时，子组件不重新render。为了解决这个问题，使用componentWillReceiveProps函数，props更新时，该函数收到状态，通过在该函数中更新state状态实现更新子组件。
     * */
    componentWillReceiveProps(nextProps) {
        this.setState({currentSelectUser: nextProps.currentSelectUser});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if(values.userNewLoginPassword !== values.confirmLoginPassword){
                    Modal.warning({
                        title: '提示',
                        content: '2次输入的密码不符，请重新输入'
                    });
                    return;
                }

                this.setState({
                    loading: true
                });

                wrapedFetch('/sys/user/updatePassword',{
                    data:[{
                        id: this.state.currentSelectUser.id,
                        userId: this.state.currentSelectUser.userId,
                        userLoginPassword: values.userLoginPassword,
                        userNewLoginPassword: values.userNewLoginPassword,
                        isNewRecord: false
                    }]
                },true,'修改密码成功')
                    .then(data=>{
                        this.setState({
                            loading:false
                        });
                    })
                    .catch(ex => {
                        Modal.error({
                            title: '错误',
                            content: ex.message+',错误码:'+ex.code
                        })
                        this.setState({loading: false});
                    })
            }
        });
    }

    render(){

        const formItemLayout={
            labelCol: {
                xs: { span: 4 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 20 },
                sm: { span: 20 },
            }
        }

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
                <Form onSubmit={this.handleSubmit.bind(this)}>
                    <FormItem label="原密码" {...formItemLayout}>
                        {getFieldDecorator('userLoginPassword', {
                            rules:[{
                                required:true,message:'请输入用户原密码'
                            }]
                        })(
                            <Input type="password"/>
                        )}
                    </FormItem>
                    <FormItem label="新密码"  {...formItemLayout}>
                        {getFieldDecorator('userNewLoginPassword',{
                            rules:[{
                                required:true,message:'请输入用户新密码'
                            }]
                        })(
                            <Input type="password"/>
                        )}
                    </FormItem>
                    <FormItem label="确认密码"  {...formItemLayout}>
                        {getFieldDecorator('confirmLoginPassword',{
                            rules:[{
                                required:true,message:'请再次输入新密码'
                            }]
                        })(
                            <Input type="password" />
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" size="large" htmlType="submit">确定</Button>
                    </FormItem>
                </Form>
            </Spin>
        )
    }
}

export default Form.create()(UpdateUserPasswordWindow);