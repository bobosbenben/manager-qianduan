import React,{Component} from 'react';
import { Form, Icon, Input, Button, Checkbox, DatePicker, message, Spin } from 'antd';
import './widget.css';
import moment from 'moment';
const FormItem = Form.Item;

class RepaymentRecordWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            record: props.currentRow,
            pushingData: false
        };

        console.log('子组件接收到的参数是：',this.state.record);
    }

    componentWillReceiveProps(nextProps) {
        this.setState({record: nextProps.currentRow});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({
                    pushingData: true
                });
                let url = '/bldk/repaymentrecord/update';
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
        const dateFormat = 'YYYY-MM-DD';

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
                            rules: [{required: true, message: '请输入修改后的本金金额'}],
                            initialValue: this.state.record.repaymentPrincipal
                        })(
                            <Input prefix={<Icon type="pay-circle-o" style={{ fontSize: 13 }} />} placeholder="要修改的归还本金金额" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('repaymentInterest', {
                            rules: [{ required: true, message: '请输入修改后的利息' }],
                            initialValue: this.state.record.repaymentInterest
                        })(
                            <Input prefix={<Icon type="pay-circle-o" style={{ fontSize: 13 }} />} placeholder="要修改的归还利息金额" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('repaymentCompoundInterest', {
                            rules: [{ required: true, message: '请输入修改后的复利' }],
                            initialValue: this.state.record.repaymentCompoundInterest
                        })(
                            <Input prefix={<Icon type="pay-circle-o" style={{ fontSize: 13 }} />} placeholder="要修改的归还复利金额" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('repaymentDate', {
                            rules: [{ type: 'object', required: true, message: '请输入修改后的归还日期!' }],
                            initialValue: moment(this.state.record.repaymentDate,dateFormat)
                        })(
                            <DatePicker style={{width:'100%'}} placeholder="修改后归还利息或本金的日期"/>
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

export default Form.create()(RepaymentRecordWindow);