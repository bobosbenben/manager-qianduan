import React,{Component} from 'react';
import { Form, Input, Button, DatePicker, message, Spin, Select, TreeSelect, Row, Col } from 'antd';
const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea} = Input;

class AddUserWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            loading: false,                                     //正在请求数据的状态
            organizationTreeData: props.organizationTreeData,   //表单中“入职机构”的机构树
        };
    }

    /**
     * 添加新纪录后，更新usertable
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
                let url = '/sys/user/create';
                fetch(url,{
                    credentials: 'include',
                    method: 'POST',
                    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                    body: JSON.stringify({
                        data:[{
                            userCode: values.userCode,
                            userName: values.userName,
                            organizationId: values.organizationId,
                            userEntryDate: values.userEntryDate,
                            userGender: values.userGender,
                            userType: values.userType,
                            userPost: values.userPost,
                            userIdCard: values.userIdCard,
                            userPhone: values.userPhone,
                            userAddress: values.userAddress,
                            remarks: values.remarks,
                            isNewRecord: true
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
                            this.updateUserTable();
                        }
                    });
            }
        });
    }


    render(){
        const formItemLayout = {
            labelCol: {
                xs: { span: 8 },
                sm: { span: 8 },
            },
            wrapperCol: {
                xs: { span: 16 },
                sm: { span: 16 },
            },
        };

        const formItemLayoutForOneRow={
            labelCol: {
                xs: { span: 4 },
                sm: { span: 4 },
            },
            wrapperCol: {
                xs: { span: 20 },
                sm: { span: 20 },
            }
        }

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
            <Spin spinning={this.state.loading} tip='正在新增...'>
                    <Form onSubmit={this.handleSubmit.bind(this)}>
                        <Row >
                            <Col span={12}>
                                <FormItem label="柜员号" {...formItemLayout}>
                                    {getFieldDecorator('userCode', {
                                        rules:[{
                                            required:true,message:'请输入柜员号'
                                        }]
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label="姓名"  {...formItemLayout}>
                                    {getFieldDecorator('userName',{
                                        rules:[{
                                            required:true,message:'请输入柜员名称'
                                        }]
                                    })(
                                        <Input/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem label="入职机构"  {...formItemLayout}>
                                    {getFieldDecorator('organizationId',{
                                        rules:[{
                                            required:true,message:'请输入入职机构'
                                        }]
                                    })(
                                        <TreeSelect
                                            style={{ width: '100%' }}
                                            dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
                                            treeData={this.state.organizationTreeData}
                                            placeholder="请选择入职机构"
                                            treeDefaultExpandAll
                                        />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label="入职日期"  {...formItemLayout}>
                                    {getFieldDecorator('userEntryDate',{
                                        rules:[{
                                            required:true,message:'请输入入职日期'
                                        }]
                                    })(
                                        <DatePicker/>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem label="性别"  {...formItemLayout}>
                                    {getFieldDecorator('userGender',{
                                        rules:[{
                                            required:false,message:'请输入性别'
                                        }]
                                    })(
                                        <Select >
                                            <Option value="男">男</Option>
                                            <Option value="女">女</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label="类别"  {...formItemLayout}>
                                    {getFieldDecorator('userType',{
                                        rules:[{
                                            required:false,message:'请输入用户的类别'
                                        }]
                                    })(
                                        <Select>
                                            <Option value={1}>在编人员</Option>
                                            <Option value={2}>外部协存员</Option>
                                            <Option value={3}>内部协存员</Option>
                                            <Option value={4}>临时工</Option>
                                            <Option value={0}>虚拟用户</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem label="职务/岗位"  {...formItemLayout}>
                                    {getFieldDecorator('userPost',{
                                        rules:[{
                                            required:false
                                        }]
                                    })(
                                        <Select>
                                            <Option value="无职务">无职务</Option>
                                            <Option value="董事长">董事长</Option>
                                            <Option value="监事长">监事长</Option>
                                            <Option value="行长">行长</Option>
                                            <Option value="副行长">副行长</Option>
                                            <Option value="行长助理">行长助理</Option>
                                            <Option value="总经理">总经理</Option>
                                            <Option value="副总经理">副总经理</Option>
                                            <Option value="支行行长">支行行长</Option>
                                            <Option value="支行副行长">支行副行长</Option>
                                            <Option value="总经理助理">总经理助理</Option>
                                            <Option value="业务主管">业务主管</Option>
                                            <Option value="会计">会计</Option>
                                            <Option value="信贷员">信贷员</Option>
                                            <Option value="科员">科员</Option>
                                            <Option value="柜员">柜员</Option>
                                            <Option value="协存岗">协存岗</Option>
                                            <Option value="内部保安">内部保安</Option>
                                            <Option value="外部保安">外部保安</Option>
                                        </Select>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label="身份证号码"  {...formItemLayout}>
                                    {getFieldDecorator('userIdCard',{
                                        rules:[{
                                            required:false
                                        }]
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={12}>
                                <FormItem label="手机号码"  {...formItemLayout}>
                                    {getFieldDecorator('userPhone',{
                                        rules:[{
                                            required:false
                                        }]
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={12}>
                                <FormItem label="住址"  {...formItemLayout}>
                                    {getFieldDecorator('userAddress',{
                                        rules:[{
                                            required:false
                                        }]
                                    })(
                                        <Input />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <FormItem label="备注"  {...formItemLayoutForOneRow}>
                            {getFieldDecorator('remarks',{
                                rules:[{
                                    required:false
                                }]
                            })(
                                <TextArea />
                            )}
                        </FormItem>
                        <FormItem {...tailFormItemLayout}>
                            <Button type="primary" size="large" htmlType="submit">添加</Button>
                        </FormItem>
                    </Form>
            </Spin>
        )
    }
}

export default Form.create()(AddUserWindow);