import React from 'react'
import {render} from 'react-dom'
import {BrowserRouter, Redirect} from 'react-router-dom'
import Nav from './nav'
import AppContent from "./content";
import 'antd/dist/antd.css';
import './static/css/ant.css';
import {Layout, Breadcrumb, Avatar, Dropdown, Menu} from 'antd';
import Parend from "./component/auth";

const {Content, Header} = Layout;
const {} = Menu;

const $ = require('jquery');
window.$ = $;
window.jQuery = $;

class App extends React.Component {
    constructor(props) {
        super(props)
        this.login = false
    }

    // check user login or not
    checkLogin() {
        $.ajax({
            type: 'GET',
            url: '/api/auth/info',
            async: false,
            success: resp => {
                this.login = resp.error === 0;
                this.user = resp.data
            }
        })
    }

    handleLogout() {
        $.ajax({
            type: 'GET',
            url: '/api/auth/logout',
            async: false,
            success: resp => {
                this.login = resp.error === 0;
                window.location.href = '/'
            }
        })
    }

    handleMenuClick(e) {
        if(e.key === '2') {
            this.handleLogout()
        } else {
            window.location.href = '/mine'
        }
    }


    render() {
        this.checkLogin();
        const menu = (
          <Menu onClick={this.handleMenuClick}>
            <Menu.Item key="1">
              个人中心
            </Menu.Item>
            <Menu.Item key="2">
              退出登录
            </Menu.Item>
          </Menu>
        );
        if (this.login !== true) {
            return (
                <div>
                    <Parend/>
                </div>
            )
        } else {
            return (
                <div>
                    <Layout style={{minHeight: '100vh'}}>
                        <Nav/>
                        <Layout className="site-layout">
                            <Header className="site-layout-background" style={{ padding: 0, textAlign: 'right' }} >
                                <div id="components-dropdown-demo-dropdown-button" style={{"marginRight": '30px'}}>
                                    <Dropdown overlay={menu}>
                                    <Avatar
                                      style={{
                                        color: '#ffffff',
                                        backgroundColor: '#35caca',
                                      }}>
                                        {this.user.user_name[0].toUpperCase()}
                                    </Avatar>
                                    </Dropdown>
                                </div>
                            </Header>
                            <Content style={{margin: '0 5px'}}>
                                {/*<Breadcrumb style={{ margin: '16px 0' }}>*/}
                                {/*    <Breadcrumb.Item>主页</Breadcrumb.Item>*/}
                                {/*    <Breadcrumb.Item>实验项目</Breadcrumb.Item>*/}
                                {/*</Breadcrumb>*/}
                                <AppContent/>
                            </Content>
                        </Layout>
                    </Layout>
                </div>
            )
        }
    }
}

render((
    <BrowserRouter>
        <App/>
    </BrowserRouter>
), document.getElementById('root'))
