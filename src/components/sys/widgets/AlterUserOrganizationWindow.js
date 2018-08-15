import React,{Component} from 'react';
import {wrapedFetch} from "../../../utils/WrapedFetch";
import { Form, Input, Button, Modal, Spin, Radio, TreeSelect, Select } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const {TextArea} = Input;

class AlterUserOrganizationWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentSelectUser: props.currentSelectUser,     //当前选中的用户，即要修改的用户
            organizationTreeData: props.organizationTreeData,//机构树
            loading: false,                                 //正在请求数据的状态
            radioValue: null,                                   //radio的默认选择为1，即调入其他机构
            statusOptions: [],
        };
    }

    /**
     * 柜员调动后，更新usertable
     */
    updateUserTable=()=>{
        this.props.refreshColumn();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({
                    loading: true
                });

                wrapedFetch('/sys/user/alterOrganization',{
                    data:[{
                        oldId: this.state.currentSelectUser.id,
                        userId: this.state.currentSelectUser.userId,
                        organizationId: values.organizationId,
                        operationType: values.operationType,
                        status: values.status,
                        remarks: values.remarks
                    }]
                },true,'柜员调动成功')
                    .then(data=>{
                        this.setState({
                            loading:false
                        });
                        this.updateUserTable();
                    })
                    .catch(ex => {
                        Modal.error({
                            title: '错误',
                            content: ex.message+',错误码：'+ex.code
                        })
                        this.setState({loading: false});
                    })
            }
        });
    }

    /**
     * 当变换了radio的选择时，更改state中的状态
     * @param e
     */
    onRadioChange = (e)=>{
        var statusOptions;
        let value = e.target.value;
        this.setState({
            radioValue: value
        });

        const status1 = [{
            value: 1,
            text: '调离当前机构调入其他机构'
        },{
            value: 6,
            text: '以揽储方式调入其他机构'
        }]

        const status2 = [{
            value: 3,
            text: '辞职调离'
        },{
            value: 4,
            text: '辞退调离'
        },{
            value: 5,
            text: '退休调离'
        }]

        if (value === 1){
            statusOptions = status1.map(content=><Option key={content.value}>{content.text}</Option>);
            this.props.form.setFieldsValue({
                status: null
            })
        }
        if(value === 2){
            statusOptions = status2.map(content=><Option key={content.value}>{content.text}</Option>);
            this.props.form.setFieldsValue({
                status: null
            })
        }
        this.setState({statusOptions});
    };

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
                            initialValue: this.state.currentSelectUser.userCode
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="姓名"  {...formItemLayout}>
                        {getFieldDecorator('userName',{
                            initialValue: this.state.currentSelectUser.userName
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="当前机构"  {...formItemLayout}>
                        {getFieldDecorator('organizationName',{
                            initialValue: this.state.currentSelectUser.organizationName
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="调入日期"  {...formItemLayout}>
                        {getFieldDecorator('userEntryDate',{
                            initialValue: this.state.currentSelectUser.userEntryDate
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem {...formItemLayout} label="操作类型">
                        {getFieldDecorator('operationType', {
                        })(
                            <RadioGroup onChange={this.onRadioChange} value={this.state.radioValue}>
                                <Radio value={1}>调入其他机构</Radio>
                                <Radio value={2}>调离注销(辞职/辞退/注销)</Radio>
                            </RadioGroup>
                        )}
                    </FormItem>
                    <FormItem label="调入机构"  {...formItemLayout}>
                        {getFieldDecorator('organizationId',{

                        })(
                            <TreeSelect
                                style={{ width: '100%' }}
                                dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                treeData={this.state.organizationTreeData}
                                placeholder="请选择调入机构"
                                treeDefaultExpandAll
                                disabled={this.state.radioValue !== 1}
                            />
                        )}
                    </FormItem>
                    <FormItem label="调入方式"  {...formItemLayout}>
                        {getFieldDecorator('status',{
                        })(
                            <Select notFoundContent='请先选择操作类型'>
                                {this.state.statusOptions}
                            </Select>
                        )}
                    </FormItem>
                    <FormItem label="备注"  {...formItemLayout}>
                        {getFieldDecorator('remarks',{
                        })(
                            <TextArea />
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

export default Form.create()(AlterUserOrganizationWindow);