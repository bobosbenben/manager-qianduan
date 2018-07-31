import React,{Component} from 'react';
import { Form, Icon, Input, Button, Checkbox, DatePicker, message, Spin } from 'antd';
import './widget.css';
const FormItem = Form.Item;

class RepaymentWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            record: props.currentRow,
            pushingData: false
        };

        console.log('子组件接收到的参数是：',this.state.record);
    }

    componentDidMount(){

    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({
                    pushingData: true
                });
                let url = '/bldk/repaymentrecord/create';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        data: [{
                            nonPerformingLoanId: this.state.record.id,
                            repaymentInterest: values.repaymentInterest,
                            repaymentPrincipal: values.repaymentPrincipal,
                            repaymentCompoundInterest: values.repaymentCompoundInterest,
                            repaymentDate: values.repaymentDate
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

    render(){

        const { getFieldDecorator } = this.props.form;

        return(
            <Spin spinning={this.state.pushingData} tip='正在新增...'>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                        {getFieldDecorator('accountNo', {
                            initialValue: this.state.record.accountNo
                        })(

                            <Input style={{ width: '100%' }} disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('customerName', {
                            initialValue: this.state.record.customerName
                        })(

                            <Input style={{ width: '100%' }} disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('repaymentPrincipal', {
                            rules: [{ required: true, message: '请输入归还的本金金额' }],
                        })(
                            <Input prefix={<Icon type="pay-circle-o" style={{ fontSize: 13 }} />} placeholder="本次归还的本金" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('repaymentInterest', {
                            rules: [{ required: true, message: '请输入本次归还的利息' }],
                        })(
                            <Input prefix={<Icon type="pay-circle-o" style={{ fontSize: 13 }} />} placeholder="本次归还的利息" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('repaymentCompoundInterest', {
                            rules: [{ required: true, message: '请输入本次归还的复利' }],
                        })(
                            <Input prefix={<Icon type="pay-circle-o" style={{ fontSize: 13 }} />} placeholder="本次归还的复利" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('repaymentDate', {
                            rules: [{ type: 'object', required: true, message: '请输入归还日期!' }],
                        })(
                            <DatePicker style={{width:'100%'}} placeholder="归还利息或本金的日期"/>
                        )}
                    </FormItem>
                    <FormItem>
                        <div style={{textAlign:'center'}}>
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                确认
                            </Button>
                        </div>
                    </FormItem>
                </Form>
            </Spin>
        )
    }
}

export default Form.create()(RepaymentWindow);