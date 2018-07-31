import React,{Component} from 'react';
import { Form, Icon, Input, Button, Checkbox, DatePicker, message, Spin, Card } from 'antd';
import './widget.css';
const FormItem = Form.Item;

class ComputeWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            record: props.currentRow,
            pushingData: false,
            principal: 0,
            interest: 0,
            compoundInterest: 0
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
                let url = '/bldk/nonperformingloan/compute';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        computeDate: values.computeDate,
                        nonPerformingLoanId: this.state.record.id
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
                            console.log('返回的利息数据是：',data);
                            this.setState({
                                principal: data.data.principal,
                                interest: data.data.interest,
                                compoundInterest: data.data.compoundInterest
                            })
                        }
                    });
            }
        });
    }

    render(){

        const { getFieldDecorator } = this.props.form;

        return(
            <Spin spinning={this.state.pushingData} tip='正在计算...'>
                <Form onSubmit={this.handleSubmit.bind(this)} className="login-form">
                    <FormItem>
                        {getFieldDecorator('computeDate', {
                            rules: [{ type: 'object', required: true, message: '请输入计息截止日期!' }],
                        })(
                            <DatePicker style={{width:'100%'}} placeholder="计息截止日期"/>
                        )}
                    </FormItem>
                    <FormItem>
                        <div style={{textAlign:'center'}}>
                            <Button type="primary" htmlType="submit" className="login-form-button">
                                计算
                            </Button>
                        </div>
                    </FormItem>
                </Form>
                <Card title="当前本金和利息">
                    {/*<p>计息截止日期： {}</p>*/}
                    <p>待还本金: &nbsp;&nbsp;{this.state.principal}</p>
                    <p>待还利息: &nbsp;&nbsp;{this.state.interest}</p>
                    <p>待还复利: &nbsp;&nbsp;{this.state.compoundInterest}</p>
                </Card>
            </Spin>
        )
    }
}

export default Form.create()(ComputeWindow);