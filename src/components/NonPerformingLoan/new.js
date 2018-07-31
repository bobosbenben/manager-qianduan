import React,{Component} from 'react';
import { Form, Input, Select, Button, DatePicker, message, Spin } from 'antd';
require('es6-promise').polyfill();
require('isomorphic-fetch');
const FormItem = Form.Item;
const Option = Select.Option;
const InputGroup = Input.Group;


class NewNonPerformingLoan extends Component {

    constructor(){
        super();
        this.state = {
            pushingData: false
        }
    }

    componentDidMount(){

    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                //提交数据到服务端
                this.setState({
                    pushingData: true
                });

                let url = '/bldk/nonperformingloan/create';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        data: [{
                            accountNo: values.accountNo,
                            compoundInterest: values.compoundInterest,
                            customerName: values.customerName,
                            fxRate: values.fxRate,
                            hxDate: values.hxDate,
                            interest: values.interest,
                            interestTerm: values.interestTerm,
                            principal: values.principal,
                            beforeHxInterest: values.beforeHxInterest
                        }]
                    }),
                })
                    .then(res => res.json())
                    .then(data => {
                    this.setState({
                        pushingData: false
                    });
                    if (data.success === false ) {
                        message.error(data.msg);
                    }
                    if (data.success === true){
                        message.success(data.msg);
                        this.props.form.resetFields();
                    }
                });
            }
        });
    }
    checkAccountNo = (rule,value,callback) => {
        const form = this.props.form;
        if(value.length !== 22) {
            callback('贷款帐号的位数不为22位!');
        }
        else {
            return callback();
        }
    }
    render(){

        const { getFieldDecorator } = this.props.form;

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 8 },
            },
        };
        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };

        return(
            <Spin spinning={this.state.pushingData} tip='正在新增...' style={{height: '100%'}}>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="贷款帐号"
                    >
                        {getFieldDecorator('accountNo', {
                            rules: [ {
                                required: true, message: '请输入贷款帐号',
                            },{
                                validator: this.checkAccountNo
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="户名"
                    >
                        {getFieldDecorator('customerName', {
                            rules: [{
                                required: true, message: '请输入户名',
                            }],
                        })(
                            <Input />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="核销时本金"
                    >
                        {getFieldDecorator('principal', {
                            rules: [{
                                required: true, message: '请输入核销时本金!',
                            }],
                            initialValue: 0
                        })(
                            <Input addonBefore="￥" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="核销时利息"
                    >
                        {getFieldDecorator('interest', {
                            rules: [{
                                required: true, message: '请输入核销时利息!',
                            }],
                            initialValue: 0
                        })(
                            <Input  addonBefore="￥" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="核销时复利"
                    >
                        {getFieldDecorator('compoundInterest', {
                            rules: [{
                                required: true, message: '请输入核销时复利!',
                            }],
                            initialValue: 0
                        })(
                            <Input  addonBefore="￥" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="罚息利率"
                    >
                        {getFieldDecorator('fxRate', {
                            rules: [{
                                required: true, message: '请输入罚息利率!',
                            }],
                            initialValue: 15
                        })(

                                <Input style={{ width: '100%' }} addonBefore="‰" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="核销日期"
                    >
                        {getFieldDecorator('hxDate', {
                            rules: [{ type: 'object', required: true, message: '请输入核销日期!' }],
                        })(
                            <DatePicker style={{width:'50%'}}/>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="核销前最后一期利息"
                    >
                        {getFieldDecorator('beforeHxInterest', {
                            rules: [{
                                required: true, message: '核销前最后一次结息时的利息总金额!',
                            }]
                        })(

                            <Input style={{ width: '100%' }} addonBefore="￥" />
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="结息周期"
                    >
                        {getFieldDecorator('interestTerm', {
                            rules: [{ required: true, message: '请选择结息周期!', whitespace: true }],
                            initialValue: '0'
                        })(
                            <Select style={{ width: '50%' }}>
                                <Option value="0">按月</Option>
                                <Option value="1">按季</Option>
                                <Option value="2">按年</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" htmlType="submit">新增</Button>
                    </FormItem>
                </Form>
            </Spin>
        )
    }
}


export default Form.create()(NewNonPerformingLoan);