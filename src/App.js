import React, { Component } from 'react';
import './App.css';
import './index.css';
import { Layout, Menu, Breadcrumb, Icon, Avatar, Popover, Modal, List} from 'antd';
import SysMenu from './components/sys/SysMenu';
import SysOrganization from './components/sys/SysOrganization';
import SysRole from './components/sys/SysRole';
import SysUser from './components/sys/SysUser';
import UpdateUserPasswordWindow from './components/sys/widgets/UpdateUserPasswordWindow';
import RepaymentNonPerformingLoan from './components/NonPerformingLoan/repayment';
import {connect} from 'react-redux';
import {logout} from './utils/xhr';

const {SubMenu} = Menu;
const {Header,Footer,Sider,Content} = Layout;
const BreadcrumbItem = Breadcrumb.Item;


class App extends Component {

    constructor(props){
        super(props);
        //绑定函数到this
        this.onMenuClick = this.onMenuClick.bind(this);
        this.getCnTitle = this.getCnTitle.bind(this);
        this.getCurrentMenuContent = this.getCurrentMenuContent.bind(this);

        //设置初始状态
        this.state = {
            collapsed: false,
            breadCrumb: ['homepage'],
            currentMenuKey: "",
            menus: [],
            tagName: 'link',
            userInfo: props.initialData,
            updateUserPasswordWindowModalVisible: false
        };
    }

    /**
     * props更新时更新state
     * @param nextProps
     */
    componentWillReceiveProps(nextProps) {
        this.setState({userInfo: nextProps.initialData});
    }

    /**
     * 点击菜单栏中的一项菜单
     * @param e
     */
    onMenuClick= (e)=> {
        this.setState ({
            breadCrumb: e.keyPath.reverse(),
            currentMenuKey: e.key
        });

        //设置当前菜单的按钮
        let buttons;
        const {onSingleMenuClick,initialData} = this.props;
        let menus = initialData.menuList[0].children;
        menus.map(menu =>{
            if (menu.children){
                menu.children.map(childMenu =>{
                    if (childMenu.children && childMenu.target === e.key){
                        buttons = childMenu.children;
                    }
                })
            }
        })
        //将当前菜单的所有button放入store中
        onSingleMenuClick(buttons);
    };

    /**
     * 获取菜单对应的中文名称，用于面包屑
     * @param enTitle
     * @returns {string}
     */
    getCnTitle = (enTitle) =>{
        switch(enTitle){
            case "homepage": return "首页";
            case "sys": return "系统设置";
            case "sysmenu": return "菜单管理";
            case "sysarea": return "区域管理";
            case "sysorganization": return "机构管理";
            case "sysrole": return "角色管理";
            case "sysuser": return "用户管理";

            default: return "无法解析";
        }
    };

    /**
     * 获取菜单对应的模块
     * @returns {*}
     */
    getCurrentMenuContent = ()=>{
        switch (this.state.currentMenuKey){
            case "sysmenu": return <SysMenu/>
            case "sysarea": return <RepaymentNonPerformingLoan/>
            case "sysorganization": return <SysOrganization/>
            case "sysrole": return <SysRole/>
            case "sysuser": return <SysUser/>

            default: return <div></div>
        }
    };

    /**
     * 折叠菜单
     * @param collapsed
     */
    onCollapse = (collapsed) => {
        this.setState({ collapsed });
    }

    /**
     * 用户退出登录
     */
    onLogoutClick=()=>{
        let history = this.props.history;
        logout()
            .then((logout)=>{
            if(logout === false){
                console.log('退出登录成功');
                history.push('/app');
            }
        });
    }

    /**
     * 隐藏modal
     */
    hideModal = ()=>{
        this.setState({
            updateUserPasswordWindowModalVisible:false
        });
    }

    /**
     * 用户点击查看、修改当前用户资料
     * */
    onUserInfoListItemClick = (e)=>{
        switch (e.target.textContent){
            case '修改密码': {
                this.setState({updateUserPasswordWindowModalVisible:true});
                return;
            }
        }
    }

  render() {

    const styleImage = {
        display: "block",
        width: '40px',
        height: '40px',
        marginTop:'10px',
        marginRight:'10px'
    };

    const data = ['修改密码'];

    const currentUserPopOverContent = (
        <div>
            <List
                header={<div style={{fontWeight:'bold',color:'#87d068'}}>Hi，{this.state.userInfo == null?'':this.state.userInfo.name}</div>}
                bordered
                dataSource={data}
                renderItem={item => (<List.Item style={{cursor:'pointer'}} onClick={this.onUserInfoListItemClick.bind(this)}>{item}</List.Item>)}
            />
        </div>
    );

    return (
        <div style={{height:'100%'}}>
        <Layout style={{height: '100%'}}>
            <Header className="header">
                <div className="header-logo">
                    <div>
                        <img src={require('./image/logo1.png')} style={styleImage} />
                    </div>
                    <h2 style={{color:'#fff'}}>伊金霍洛农村商业银行数据分析系统</h2>
                </div>
                <div style={{display:'flex',flexDirection:'row'}}>
                    <div style={{marginRight:'15px',cursor:'pointer'}}>
                        <Popover placement="bottomLeft" content={currentUserPopOverContent} trigger="click">
                            <Avatar icon="user" style={{ backgroundColor: '#87d068' }}/>
                        </Popover>
                    </div>
                    <div className="hvr-grow" onClick={this.onLogoutClick}>
                        <Icon type="logout" style={{ fontSize: 16, color: '#fff'}}/>
                        <span style={{ fontSize: 16, color: '#fff', paddingLeft:'10px'}}>退出</span>
                    </div>
                    <Modal
                        title="修改密码"
                        visible={this.state.updateUserPasswordWindowModalVisible}
                        destroyOnClose={true}
                        onCancel={this.hideModal}
                        footer={null}
                    >
                        <UpdateUserPasswordWindow currentSelectUser={this.state.userInfo}/>
                    </Modal>
                </div>
            </Header>
            <Layout style={{height: '100%'}}>
                <Sider width={220} style={{ background: '#fff'}} collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
                    <Menu
                        theme="light"
                        mode="inline"
                        // defaultSelectedKeys={['sysmenu']}
                        // defaultOpenKeys={['sys']}
                        style={{ height: '100%', borderRight: 0}}
                        onClick={this.onMenuClick}
                    >
                        {this.props.initialData != undefined?this.props.initialData.menuList[0].children.map(v => {
                            return v.children
                                ? <SubMenu key={v.target}
                                           // title={<span><FontAwesome name={v.iconCls} style={{paddingRight:"5px"}}/><span style={{fontSize:'16px'}}>{v.name}</span></span>}>
                                             title={<span><Icon type={v.iconCls} /><span>{v.name}</span></span>}>
                                    {
                                        v.children.map(v2 => {
                                            return <Menu.Item key={v2.target} style={{fontSize:'13px'}}>
                                                {/*<FontAwesome style={{paddingRight:'5px'}} name={v2.iconCls}/>*/}
                                                <Icon type={v2.iconCls}/>
                                                <span>{v2.name}</span>
                                            </Menu.Item>
                                        })
                                    }
                                </SubMenu>
                                : <Menu.Item key={v.target} style={{fontSize:'13px'}}>
                                    {v.name}
                                </Menu.Item>
                        }):null}

                    </Menu>
                </Sider>
                <Layout style={{ padding: '0 10px 10px',height:'100%',display:'flex',flexDirection:'column'}}>
                    <Breadcrumb style={{ padding: '10px 0 10px 10px' }}>
                        {
                            this.state.breadCrumb.map((title,index)=>{
                                let cnTitle = this.getCnTitle(title);
                                return <BreadcrumbItem key={index}>{cnTitle}</BreadcrumbItem>
                            })
                        }
                    </Breadcrumb>
                    <Content style={{ background: '#fff', paddingTop:'10px',paddingLeft:'10px', height: '83%'}}>
                        {
                            this.getCurrentMenuContent()
                        }
                    </Content>
                    <Footer style={{ textAlign: 'center' }}>
                        &copy;&nbsp;2017 伊金霍洛农村商业银行. All Rights Reserved.
                    </Footer>
                </Layout>

            </Layout>
        </Layout>
        </div>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
    return {
        onSingleMenuClick: (data) => {
            dispatch({
                type: 'SET_CURRENT_MENU_BUTTON',
                data: data
            });
        }
    };
}

const stateToProps = ({ loggedUserState }) => ({
    initialData: loggedUserState.initialData
})

export default connect(stateToProps,mapDispatchToProps)(App)

