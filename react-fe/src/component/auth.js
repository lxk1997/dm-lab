import React from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import $ from 'jquery'
import 'antd/dist/antd.css';
import '../static/css/ant.css';
import {Layout} from 'antd';
import {Form, Input, Button, Checkbox} from 'antd';
import {UserOutlined, LockOutlined, MailOutlined} from '@ant-design/icons';
import Home from "../page/home";
import page404 from "../404";
import loginLogo from "../static/images/login_logo.png"

const {Header, Content} = Layout;

export default class Parend extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<Layout style={{'height': '-webkit-fill-available'}}>
            <Content style={{margin: "0 auto", "margin-top": "90px", 'background-color': '#F3F3F3'}}>
                <Switch>
                    <Redirect from='/' to='/login' exact/>
                    <Route path='/login' exact component={Login}/>
                    <Route path='/signup' exact component={SignUp}/>

                    <Route path='*' component={page404}/>

                </Switch>
            </Content>
        </Layout>);
    }
}

export class Login extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {}
        }
    }

    onFinish = values => {
        $.ajax({
            type: 'POST',
            url: '/api/auth/login',
            data: {
                'username': values.username,
                'password': values.password
            },
            dataType: 'json',
            success: function (jsonData) {
                if(jsonData.error) {
                    alert(jsonData.msg)
                } else {
                    window.location.reload();
                }
            }
        });
    };

    render() {
        return (<div style={{"background-color": '#fff', "padding": '20px 20px 10px 20px', 'border-radius': '8px'}}>
                <div style={{'text-align': 'center', 'margin-bottom': '25px'}}>
                    <img src={loginLogo} width={"100%"} height={"100%"} style={{'width': '200px'}}/>
                </div>
            <Form
                style={{'width': '300px'}}
                name="login"
                className="login-form"
                initialValues={{
                    remember: true,
                }}
                onFinish={this.onFinish}>
                <Form.Item
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Username!',
                        },
                    ]}>
                    <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Username"/>
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Password!',
                        },
                    ]}>
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon"/>}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item>
                    <Form.Item name="remember" valuePropName="checked" noStyle>
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>

                    <a className="login-form-forgot" href="">
                        Forgot password
                    </a>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="login-form-button">
                        Log in
                    </Button>
                    Or <a href={"/signup"}>signup now!</a>
                </Form.Item>
            </Form></div>
        );
    }
}

export class SignUp extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {}
        }
    }

    onFinish = values => {
        $.ajax({
            type: 'POST',
            url: '/api/auth/register',
            data: {
                'username': values.username,
                'password': values.password,
                'email': values.email
            },
            dataType: 'json',
            success: function (jsonData) {
                if(jsonData.error) {
                    alert(jsonData.msg)
                } else {
                    window.location.href = '/login';
                }
            }
        });
    };

    render() {
        return (
            <div style={{"background-color": '#fff', "padding": '20px 20px 10px 20px', 'border-radius': '8px'}}>
                <div style={{'text-align': 'center', 'margin-bottom': '25px'}}>
                    <img src={loginLogo} width={"100%"} height={"100%"} style={{'width': '200px'}}/>
                </div>
            <Form
                style={{'width': '300px'}}
                name="signup"
                className="signup-form"
                initialValues={{
                    remember: true,
                }}
                onFinish={this.onFinish}>
                <Form.Item
                    name="username"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Username!',
                        },
                    ]}>
                    <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Username"/>
                </Form.Item>
                <Form.Item
                    name="password"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Password!',
                        },
                    ]}>
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon"/>}
                        type="password"
                        placeholder="Password"
                    />
                </Form.Item>
                <Form.Item
                    name="confirm"
                    dependencies={['password']}
                    hasFeedback
                    rules={[
                        {
                            required: true,
                            message: 'Please confirm your Password!',
                        },
                        ({getFieldValue}) => ({
                            validator(rule, value) {
                                if (!value || getFieldValue('password') === value) {
                                    return Promise.resolve();
                                }

                                return Promise.reject('The two passwords that you entered do not match!');
                            },
                        }),
                    ]}>
                    <Input
                        prefix={<LockOutlined className="site-form-item-icon"/>}
                        type="password"
                        placeholder="Confirm Password"
                    />
                </Form.Item>

                <Form.Item
                    name="email"
                    rules={[
                        {
                            type: 'email',
                            message: 'The input is not valid E-mail!',
                        },
                        {
                            required: true,
                            message: 'Please input your E-mail!',
                        },
                    ]}>
                    <Input prefix={<MailOutlined className="site-form-item-icon"/>}
                           placeholder="Email"/>
                </Form.Item>
                <Form.Item
                    name="nickname"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Nickname!',
                        },
                    ]}>
                    <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="Nickname"/>
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" className="signup-form-button">
                        Sign Up
                    </Button>
                    Or <a href={"/login"}>login now!</a>
                </Form.Item>
            </Form></div>
        );
    }
}
