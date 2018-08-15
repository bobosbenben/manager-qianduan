import React,{Component} from 'react';
import { Form, Input, Button, message, Spin, Table, Modal } from 'antd';
import {wrapedFetch} from '../../../utils/WrapedFetch';
import '../css/sys.css';
const FormItem = Form.Item;

const columns = [{
    title: '角色列表',
    dataIndex: 'name',
}];

class AlterUserRoleWindow extends Component {

    constructor(props){
        super(props);
        this.state = {
            currentSelectUser: props.currentSelectUser,     //当前选中的用户，即要修改的用户
            roles: [],                                      //用户可以选择的所有角色
            loading: false,                                 //正在请求数据的状态
            selectedRoleIdList:props.currentSelectUser.userRoleIdList                           //当更新用户角色时，选中的用户的新角色
        };
    }

    componentWillMount(){
        this.setState({
            loading: true
        });
        wrapedFetch('/sys/role/get',{},true)
            .then(data => {
                this.setState({
                    roles: data.data,
                    loading: false
                });
            })
            .catch(ex => {
                Modal.error({
                    title: '错误',
                    content: ex.message+',错误码：'+ex.code
                })
                this.setState({loading: false});
            })
    };

    componentWillReceiveProps(nextProps) {
        this.setState({ currentSelectUser: nextProps.currentSelectUser });
    }

    /**
     * 更新用户角色后，更新usertable
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
                wrapedFetch('/sys/user/updateRole',{
                    data:[{
                            id: this.state.currentSelectUser.id,
                            userId: this.state.currentSelectUser.userId,
                            userRoleIdList:this.state.selectedRoleIdList,
                            isNewRecord: false
                        }]
                })
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
                // let url = '/sys/user/updateRole';
                // fetch(url,{
                //     credentials: 'include',
                //     method: 'POST',
                //     headers: { 'Accept': 'application/json', 'Content-Type': 'application/json', },
                //     body: JSON.stringify({
                //         data:[{
                //             id: this.state.currentSelectUser.id,
                //             userId: this.state.currentSelectUser.userId,
                //             userRoleIdList:this.state.selectedRoleIdList,
                //             isNewRecord: false
                //         }]
                //     }),
                // })
                //     .then(res => res.json())
                //     .then(data => {
                //         this.setState({
                //             loading: false
                //         });
                //         if (data.success === false ) {
                //             message.error(data.msg);
                //         }
                //         if (data.success === true){
                //             message.success(data.msg);
                //             this.updateUserTable();
                //         }
                //     });
            }
        });
    }

    /**
     * 选中一行时，将该行的css改变
     * @param record
     * @param index
     * @returns {string}
     */
    setRowClassName = (record,index)=>{
        const roleList = this.state.selectedRoleIdList;
        let flag = false;
        for(let i=0;i<roleList.length;i++) if (roleList[i] === record.id) flag = true;

        if (flag) return 'high-light';
        return '';
    }

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

        const rowSelection = {
            selectedRowKeys: this.state.selectedRoleIdList,
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState({
                    selectedRoleIdList:selectedRowKeys
                });
            }
        };

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
                    <FormItem label="姓名"  {...formItemLayout} style={{marginTop:'-20px'}}>
                        {getFieldDecorator('userName',{
                            initialValue: this.state.currentSelectUser.userName
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="当前机构"  {...formItemLayout} style={{marginTop:"-20px"}}>
                        {getFieldDecorator('organizationName',{
                            initialValue: this.state.currentSelectUser.organizationName
                        })(
                            <Input disabled={true}/>
                        )}
                    </FormItem>
                    <FormItem label="角色列表"  {...formItemLayout} style={{marginTop:'-20px',paddingBottom:'0px',marginBottom:'0px'}}>
                    </FormItem>
                    <Table
                        showHeader={false}
                        bordered={true}
                        style={{marginTop:'0px'}}
                        scroll={{y:300}}
                        size="small"
                        rowSelection={rowSelection}
                        rowKey="id" //dataSource中的属性
                        rowClassName={this.setRowClassName}
                        columns={columns}
                        dataSource={this.state.roles}
                        pagination={false}
                    />
                    <FormItem {...tailFormItemLayout}>
                        <Button type="primary" size="large" htmlType="submit" style={{marginTop:'20px'}}>确定</Button>
                    </FormItem>
                </Form>
            </Spin>
        )
    }
}

export default Form.create()(AlterUserRoleWindow);