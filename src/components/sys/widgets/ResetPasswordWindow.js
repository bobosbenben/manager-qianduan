import React,{Component} from 'react';
import { Form, Input, Button, message, Spin } from 'antd';
const FormItem = Form.Item;

class ResetPasswordWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentSelectUser: props.currentSelectUser,     //当前选中的用户，即要修改的用户
            loading: false,                                 //正在请求数据的状态
        };
    }


    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({
                    loading: true
                });
                let url = '/sys/user/resetPassword';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        data:[{
                            id: this.state.currentSelectUser.id,
                            userId: this.state.currentSelectUser.userId,
                            userNewLoginPassword: values.userNewLoginPassword,
                            isNewRecord: false
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
            <Spin spinning={this.state.loading} tip='正在修改...'>
                <Form onSubmit={this.handleSubmit.bind(this)}>
                    <FormItem label="柜员号" {...formItemLayout}>
                        {getFieldDecorator('userCode', {
                            rules:[{
                                required:true,message:'请输入柜员号'
                            }],
                            initialValue: this.state.currentSelectUser.userCode
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="姓名"  {...formItemLayout}>
                        {getFieldDecorator('userName',{
                            rules:[{
                                required:true,message:'请输入柜员名称'
                            }],
                            initialValue: this.state.currentSelectUser.userName
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="新密码">
                        {getFieldDecorator('userNewLoginPassword', {
                            rules: [{ required: true,message:'密码为空！'}],
                        })(
                            <Input type="password" placeholder="新密码" />
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

export default Form.create()(ResetPasswordWindow);