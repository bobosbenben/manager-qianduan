import React,{Component} from 'react';
import { Form, Input, Button, Modal, Spin, Select, Row, Col } from 'antd';
import {wrapedFetch} from "../../../utils/WrapedFetch";

const FormItem = Form.Item;
const Option = Select.Option;
const {TextArea} = Input;

class UpdateUserWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentSelectUser: props.currentSelectUser,     //当前选中的用户，即要修改的用户
            loading: false,                                 //正在请求数据的状态
        };
    }

    /**
     * 备注：父组件给子组件的属性更新时，子组件不重新render。为了解决这个问题，使用componentWillReceiveProps函数，props更新时，该函数收到状态，通过在该函数中更新state状态实现更新子组件。
     * */
    componentWillReceiveProps(nextProps) {
        this.setState({currentSelectUser: nextProps.currentSelectUser});
    }

    componentDidMount=()=>{}

    /**
     * 更新单个角色后，更新SysRole中的Table中的数据
     */
    updateUserData = ()=>{
        this.props.refreshColumn();
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {

                this.setState({
                    loading: true
                });

                wrapedFetch('/sys/user/update',{
                    data:[{
                        id: this.state.currentSelectUser.id,
                        userId: this.state.currentSelectUser.userId,
                        userCode: values.userCode,
                        userName: values.userName,
                        userGender: values.userGender,
                        userType: values.userType,
                        userPost: values.userPost,
                        userIdCard: values.userIdCard,
                        userPhone: values.userPhone,
                        userAddress: values.userAddress,
                        remarks: values.remarks,
                        isNewRecord: false
                    }]
                },true,'修改柜员成功')
                    .then(data=>{
                        this.setState({
                            loading:false
                        });
                        this.updateUserData();
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
            <Spin spinning={this.state.loading} tip='正在修改...'>
                <Form onSubmit={this.handleSubmit.bind(this)}>
                    <Row >
                        <Col span={12}>
                            <FormItem label="柜员号" {...formItemLayout}>
                                {getFieldDecorator('userCode', {
                                    rules:[{
                                        required:true,message:'请输入柜员号'
                                    }],
                                    initialValue: this.state.currentSelectUser.userCode
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
                                    }],
                                    initialValue: this.state.currentSelectUser.userName
                                })(
                                    <Input/>
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
                                    }],
                                    initialValue: this.state.currentSelectUser.userGender
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
                                    }],
                                    initialValue: this.state.currentSelectUser.userType
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
                                    }],
                                    initialValue: this.state.currentSelectUser.userPost
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
                                    }],
                                    initialValue: this.state.currentSelectUser.userIdCard
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
                                    }],
                                    initialValue: this.state.currentSelectUser.userPhone
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
                                    }],
                                    initialValue: this.state.currentSelectUser.userAddress
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
                            }],
                            initialValue: this.state.currentSelectUser.remarks
                        })(
                            <TextArea />
                        )}
                    </FormItem>
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" size="large" htmlType="submit">修改</Button>
                    </FormItem>
                </Form>
            </Spin>
        )
    }
}

export default Form.create()(UpdateUserWindow);