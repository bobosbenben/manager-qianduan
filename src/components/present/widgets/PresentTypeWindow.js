import React,{Component} from 'react';
import { Form, Icon, Input, Button, DatePicker, message, Spin, Select } from 'antd';
import './widget.css';
const FormItem = Form.Item;
const Option = Select.Option;
class PresentTypeWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            record: props.currentRow,
            pushingData: false
        };
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
                let url = '/present/presentType/create';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        data: [{
                            presentName: values.presentName,
                            startDate: values.startDate,
                            endDate: values.endDate,
                            orgCode: values.orgCode,
                            distributeType: values.distributeType
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
                        {getFieldDecorator('presentName', {
                            rules: [{ required: true, message: '礼品名称' }],
                        })(
                            <Input prefix={<Icon type="pay-circle-o" style={{ fontSize: 13 }} />} placeholder="礼品名称" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('startDate', {
                            rules: [{ type: 'object', required: true, message: '请输入起始日期!' }],
                        })(
                            <DatePicker style={{width:'100%'}} placeholder="礼品生效起始日期"/>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('endDate', {
                            rules: [{ type: 'object', required: true, message: '请输入截止日期!' }],
                        })(
                            <DatePicker style={{width:'100%'}} placeholder="礼品停止发放时间"/>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('distributeType', {
                            rules: [{ required: true, message: '请选择发放类型!', whitespace: true }],
                            initialValue: '2'
                        })(
                            <Select style={{ width: '50%' }}>
                                <Option value="1">所有人可领取</Option>
                                <Option value="2">指定人员可领取</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('orgCode', {
                            rules: [{ required: true, message: '请选择礼品所属机构!', whitespace: true }],
                            initialValue: '78000'
                        })(
                            <Select style={{ width: '100%' }}>
                                <Option value="78000">全部机构</Option>
                                <Option value="78003">营业部</Option>
                                <Option value="78004">中汇支行</Option>
                                <Option value="78005">达尔扈特支行</Option>
                                <Option value="78006">兆丰支行</Option>
                                <Option value="78007">中金支行</Option>
                                <Option value="78009">银泰支行</Option>
                                <Option value="78011">元丰支行</Option>
                                <Option value="78013">新庙支行</Option>
                                <Option value="78014">聚元支行</Option>
                                <Option value="78016">台格支行</Option>
                                <Option value="78018">伊旗霍洛支行</Option>
                                <Option value="78020">红庆河支行</Option>
                                <Option value="78022">公尼召支行</Option>
                                <Option value="78024">新街支行</Option>
                                <Option value="78026">台吉召支行</Option>
                                <Option value="78028">阿勒腾席热支行</Option>
                                <Option value="78029">银通支行</Option>
                                <Option value="78030">广元支行</Option>
                                <Option value="78031">金桌支行</Option>
                                <Option value="78033">纳林陶亥支行</Option>
                                <Option value="78035">纳林希里支行</Option>
                                <Option value="78037">红海子支行</Option>
                                <Option value="78038">阿吉奈支行</Option>
                                <Option value="78039">大通支行</Option>
                                <Option value="78040">札萨克支行</Option>
                                <Option value="78041">金地支行</Option>
                                <Option value="78042">金税支行</Option>
                                <Option value="78043">金茂支行</Option>
                                <Option value="78044">北城支行</Option>
                                <Option value="78045">康城支行</Option>
                                <Option value="78046">益民支行</Option>
                                <Option value="78047">朝阳支行</Option>
                                <Option value="78050">通汇支行</Option>
                                <Option value="78051">新北支行</Option>
                                <Option value="78053">东胜支行</Option>
                                <Option value="78054">达旗支行</Option>
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

export default Form.create()(PresentTypeWindow);