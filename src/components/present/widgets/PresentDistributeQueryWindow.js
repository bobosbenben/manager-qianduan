import React,{Component} from 'react';
import { Form, Icon, Input, Button, DatePicker, message, Spin, Select } from 'antd';
import './widget.css';
const FormItem = Form.Item;
const Option = Select.Option;
class PresentDistributeQueryWindow extends Component {

    constructor(props){
        super(props);
        const {OnGetCustomerPresents} = props;
        this.state = {
            pushingData: false,
            OnGetCustomerPresents: OnGetCustomerPresents,
            customerPresents: props.customerPresents
        };

    }

    componentDidMount(){

    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.props.onGetDistributeCustomerPresents(values)
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
                            rules: [{ required: true, message: '客户身份证号' }],
                        })(
                            <Input prefix={<Icon type="user" style={{ fontSize: 13 }} />} placeholder="身份证号" />
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


export default Form.create()(PresentDistributeQueryWindow);