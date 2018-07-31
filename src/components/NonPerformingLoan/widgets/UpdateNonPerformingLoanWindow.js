import React,{Component} from 'react';
import { Form, Input, Button, Select, DatePicker, message, Spin } from 'antd';
import './widget.css';
import moment from 'moment';
import 'moment/locale/zh-cn';
moment.locale('zh-cn');
const Option = Select.Option;
const FormItem = Form.Item;
const dateFormat = 'YYYY-MM-DD';
let hxDate = null;

class UpdateNonPerformingLoanWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            record: props.currentRow,
            pushingData: false
        };
        hxDate = props.currentRow.hxDate;
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
                let url = '/bldk/nonperformingloan/update';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        data: [{
                            id: this.state.record.id,
                            principal: values.principal,
                            interest: values.interest,
                            compoundInterest: values.compoundInterest,
                            fxRate: values.fxRate,
                            hxDate: hxDate,
                            beforeHxInterest: values.beforeHxInterest,
                            interestTerm: values.interestTerm
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
                            // this.props.form.resetFields();
                            this.props.form.setFieldsValue({principal:values.principal});
                            this.props.refreshColumn();
                        }
                    });
            }
        });
    }

    onHxDateChange = (date,dateString)=>{
        hxDate = dateString;
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
            <Spin spinning={this.state.pushingData} tip='正在修改...'>
                <Form onSubmit={this.handleSubmit}>
                    <FormItem
                        label="贷款帐号"
                    >
                        {getFieldDecorator('accountNo', {
                            // initialValue: this.props.currentRow.accountNo
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem
                        label="户名"
                    >
                        {getFieldDecorator('customerName', {
                            initialValue: this.props.currentRow.customerName
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem
                        label="核销时本金"
                    >
                        {getFieldDecorator('principal', {
                            rules: [{
                                required: true, message: '请输入核销时本金!',
                            }],
                            // initialValue: this.props.currentRow.principal
                        })(
                            <Input addonBefore="￥" />
                        )}
                    </FormItem>
                    <FormItem
                        label="核销时利息"
                    >
                        {getFieldDecorator('interest', {
                            rules: [{
                                required: true, message: '请输入核销时利息!',
                            }],
                            initialValue: this.props.currentRow.interest
                        })(
                            <Input  addonBefore="￥" />
                        )}
                    </FormItem>
                    <FormItem
                        label="核销时复利"
                    >
                        {getFieldDecorator('compoundInterest', {
                            rules: [{
                                required: true, message: '请输入核销时复利!',
                            }],
                            initialValue: this.props.currentRow.compoundInterest
                        })(
                            <Input  addonBefore="￥" />
                        )}
                    </FormItem>
                    <FormItem
                        label="罚息利率"
                    >
                        {getFieldDecorator('fxRate', {
                            rules: [{
                                required: true, message: '请输入罚息利率!',
                            }],
                            initialValue: this.props.currentRow.fxRate
                        })(

                            <Input style={{ width: '100%' }} addonBefore="‰" />
                        )}
                    </FormItem>
                    <FormItem
                        label="核销日期"
                    >
                        {getFieldDecorator('hxDate', {
                            rules: [{ type: 'object', required: true, message: '请输入核销日期!' }],
                            initialValue: moment(this.props.currentRow.hxDate,dateFormat)
                        })(
                            <DatePicker style={{width:'50%'}} onChange={this.onHxDateChange.bind(this)}/>
                        )}
                    </FormItem>
                    <FormItem
                        label="核销前最后一期利息"
                    >
                        {getFieldDecorator('beforeHxInterest', {
                            rules: [{
                                required: true, message: '核销前最后一次结息时的利息总金额!',
                            }],
                            initialValue: this.props.currentRow.beforeHxInterest
                        })(

                            <Input style={{ width: '100%' }} addonBefore="￥" />
                        )}
                    </FormItem>
                    <FormItem
                        label="结息周期"
                    >
                        {getFieldDecorator('interestTerm', {
                            rules: [{ required: true, message: '请选择结息周期!', whitespace: true }],
                            initialValue: this.props.currentRow.interestTerm
                        })(
                            <Select style={{ width: '50%' }}>
                                <Option value="0">按月</Option>
                                <Option value="1">按季</Option>
                                <Option value="2">按年</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" htmlType="submit">修改</Button>
                    </FormItem>
                </Form>
            </Spin>
        )
    }
}
export default Form.create({
    mapPropsToFields(props) {
        return {
            accountNo: Form.createFormField({value: props.currentRow.accountNo}),
            // customerName: Form.createFormField({value: props.currentRow.customerName}),
            principal: Form.createFormField({value: props.currentRow.principal}),
            // interest: Form.createFormField({value: props.currentRow.interest}),
            // compoundInterest: Form.createFormField({value: props.currentRow.compoundInterest}),
            // fxRate: Form.createFormField({value: props.currentRow.fxRate}),
            // hxRate: Form.createFormField({defaultValue: moment(props.currentRow.hxDate,dateFormat)}),
            // beforeHxInterest: Form.createFormField({value: props.currentRow.beforeHxInterest}),
            // interestTerm: Form.createFormField({value: props.currentRow.interestTerm})
        };
    },
})(UpdateNonPerformingLoanWindow);