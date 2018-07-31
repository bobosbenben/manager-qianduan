import React,{Component} from 'react';
import { Form, Icon, Input, Button, DatePicker, message, Spin, Select,Modal } from 'antd';
import './widget.css';
const confirm = Modal.confirm;
const FormItem = Form.Item;
const Option = Select.Option;
class RegisterPresentWindow extends Component {

    constructor(props){
        super(props);
        const {OnGetCustomerPresents} = props;
        this.state = {
            pushingData: false,
            OnGetCustomerPresents: OnGetCustomerPresents,
            customerPresents: props.customerPresents,
            validPresents: [],
            customerName: null,
            accountNo: null
        };

        this.onIdentityNumberBlur = this.onIdentityNumberBlur.bind(this);
    }

    componentDidMount(){
        this.setState({
            pushingData: true
        });
        let url = '/present/presentCustomer/getvalidpresents';
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            // body: JSON.stringify({
            //     data: [{
            //         id: this.state.record.id,
            //         principal: values.principal,
            //         interest: values.interest,
            //         compoundInterest: values.compoundInterest,
            //         fxRate: values.fxRate,
            //         hxDate: hxDate,
            //         beforeHxInterest: values.beforeHxInterest,
            //         interestTerm: values.interestTerm
            //     }]
            // }),
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
                    // message.success(data.msg);
                    if (data.data === undefined || data.data === null){
                        this.setState({
                            validPresents: []
                        });
                    }
                    else {
                        this.setState({
                            validPresents: data.data
                        })
                    }
                }
            });
    }

    checkIdentityNumber = (rule,value,callback) => {
        if(value.length !== 18) {
            callback('身份证号码必须为18位!');
        }
        else {
            return callback();
        }
    }

    checkAccountNo = (rule,value,callback) => {
        if(value.length !== 19 && value.length !== 22) {
            callback('卡号必须为19位，帐号必须为22位!');
        }
        else {
            return callback();
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();

        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.onGetCustomerPresents(values)
            }
        });
    }

    onIdentityNumberBlur = (e)=>{
        let identityNumber = e.target.value;
        this.setState({
            pushingData: true
        });
        let url = '/present/presentCustomer/getcustomerinfo';
        fetch(url,{
            credentials: 'include',
            method: 'POST',
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
            body: JSON.stringify({
                identityNumber: identityNumber
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
                    if (data.data !== null && data.data !== undefined)
                    this.props.form.setFieldsValue({
                        customerName: data.data.name,
                        accountNo: data.data.accountNo
                    });
                    else {
                        confirm({
                            title: '提示',
                            content: data.msg,
                            onOk() {
                                console.log('OK');
                            },
                            onCancel() {
                                console.log('Cancel');
                            },
                        });
                    }
                    // message.success(data.msg);
                    // this.setState({
                    //     customerName: data.data.customerName,
                    //     accountNo: data.data.accountNo
                    // })
                }
            });
    }

    render(){

        const { getFieldDecorator } = this.props.form;
        return(
            <Spin spinning={this.state.pushingData} tip='正在查询...'>
                <Form onSubmit={this.handleSubmit} className="login-form">
                    <FormItem>
                        {getFieldDecorator('identityNumber', {
                            rules: [{
                                required: true, message: '客户身份证号'
                            },{
                                validator: this.checkIdentityNumber
                            }],
                        })(
                            <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} onBlur={this.onIdentityNumberBlur} placeholder="客户身份证号" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('customerName', {
                            rules: [{ required: true, message: '客户姓名' }]
                        })(
                            <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="客户姓名" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('accountNo', {
                            rules: [{
                                required: true, message: '客户帐号或卡号'
                            },{
                                validator: this.checkAccountNo
                            }]
                        })(
                            <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="客户帐号或卡号" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('phoneNumber', {
                            rules: [{
                                required: true, message: '客户联系电话'
                            }],
                        })(
                            <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="客户联系电话" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('presentId', {
                            rules: [{ required: true, message: '请选择礼品!', whitespace: true }]
                        })(
                            <Select style={{ width: '100%' }} placeholder='礼品种类'>
                                {this.state.validPresents.map(present => <Option key={present.id}>{present.presentName}</Option>)}
                            </Select>
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


export default Form.create()(RegisterPresentWindow);