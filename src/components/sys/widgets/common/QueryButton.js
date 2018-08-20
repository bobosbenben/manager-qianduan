import React,{Component} from 'react';
import { Form, Input, Button, Modal, Spin, Select, Popover, Col } from 'antd';
const FormItem = Form.Item;

class QueryButton extends Component {

    constructor(props){
        super(props);
        this.state = {
            items: props.items,
            loading: false,                                 //正在请求数据的状态
        };
    }

    /**
     * 备注：父组件给子组件的属性更新时，子组件不重新render。为了解决这个问题，使用componentWillReceiveProps函数，props更新时，该函数收到状态，通过在该函数中更新state状态实现更新子组件。
     * */
    componentWillReceiveProps(nextProps) {
        this.setState({item: nextProps.item});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                let obj = new Object();
                this.state.items.map(item=>{
                    let attrName = item.name;
                    obj[item.name] = values[attrName]===undefined?null:values[attrName];
                });

                this.props.setQueryParamsData(obj);
            }
        });
    }

    render(){

        const formItemLayout={
            labelCol: {
                xs: { span: 6 },
                sm: { span: 6 },
            },
            wrapperCol: {
                xs: { span: 18 },
                sm: { span: 18 },
            }
        }

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 16,
                    offset: 8,
                },
                sm: {
                    span: 16,
                    offset: 8,
                },
            },
        };

        const { getFieldDecorator } = this.props.form;

        const content = (
            <Spin spinning={this.state.loading} tip='正在查询...'>
                <Form onSubmit={this.handleSubmit.bind(this)}>
                    {
                        this.state.items.map(item=>{
                            return <FormItem label={item.enName} {...formItemLayout}>
                                        {getFieldDecorator(item.name, {
                                            })(
                                            <Input />
                                        )}
                                    </FormItem>
                        })
                    }
                    <FormItem {...tailFormItemLayout} style={{marginTop:'0px',marginBottom:'0px'}}>
                        <Button type="primary" size="large" htmlType="submit">查询</Button>
                    </FormItem>
                </Form>
            </Spin>
        );

        return(
            <Popover
                trigger="click"
                content={content}
                placement="bottomRight"
            >
                <Button>查询</Button>
            </Popover>
        )
    }
}

export default Form.create()(QueryButton);