import React from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import $ from 'jquery'
import 'antd/dist/antd.css';
import '../static/css/ant.css';
import {Layout} from 'antd';
import {Form, Input, Button, Checkbox, Radio} from 'antd';
import {UserOutlined, LockOutlined, MailOutlined} from '@ant-design/icons';
import Home from "../page/home";
import page404 from "../404";
import loginLogo from "../static/images/login_logo.png"

const {Header, Content} = Layout;


const formItemLayout = {
    labelCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 8,
        },
    },
    wrapperCol: {
        xs: {
            span: 24,
        },
        sm: {
            span: 16,
        },
    },
};
const tailFormItemLayout = {
    wrapperCol: {
        xs: {
            span: 24,
            offset: 0,
        },
        sm: {
            span: 16,
            offset: 8,
        },
    },
};

export default class Parend extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (<Layout style={{'height': '-webkit-fill-available'}}>
            <Content style={{margin: "0 auto", 'background-color': '#F3F3F3'}}>
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
                'school_id': values.school_id,
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
        return (<div style={{"background-color": '#fff', "padding": '20px 20px 10px 20px', 'border-radius': '8px', "margin-top": "90px"}}>
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
                    name="school_id"
                    rules={[
                        {
                            required: true,
                            message: 'Please input your School ID!',
                        },
                    ]}>
                    <Input prefix={<UserOutlined className="site-form-item-icon"/>} placeholder="School ID"/>
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
                'school_id': values.school_id,
                'password': values.password,
                'email': values.email,
                'name': values.name,
                'sex': values.sex,
                'department': values.department,
                'major': values.major,
                'grade': values.grade,
                'clazz': values.clazz
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
            <div style={{"background-color": '#fff', "padding": '20px 20px 10px 20px', 'border-radius': '8px', 'text-align': 'center', "margin-top": "20px"}}>
                <div style={{'text-align': 'center', 'margin-bottom': '25px'}}>
                    <img src={loginLogo} width={"100%"} height={"100%"} style={{'width': '200px'}}/>
                </div>
            <Form
                {...formItemLayout}
                style={{'width': '350px'}}
                name="signup"
                className="signup-form"
                initialValues={{
                    remember: true,
                    sex: 1
                }}
                onFinish={this.onFinish}>
                <Form.Item
                    name="school_id"
                    label='School ID'
                    style={{'margin-bottom': '6px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your School ID!',
                        },
                    ]}>
                     <Input />
                </Form.Item>
                <Form.Item
                    name="password"
                    label='Password'
                    style={{'margin-bottom': '6px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Password!',
                        },
                    ]}>
                    <Input.Password/>
                </Form.Item>
                <Form.Item
                    name="confirm"
                    label='Confirm'
                    style={{'margin-bottom': '6px'}}
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
                    <Input.Password
                    />
                </Form.Item>

                <Form.Item
                    name="name"
                    label='Name'
                    style={{'margin-bottom': '6px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Name!',
                        },
                    ]}>
                     <Input />
                </Form.Item>

                <Form.Item
                    name="sex"
                    label='Sex'
                    style={{'margin-bottom': '6px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Please select your Sex!',
                        },
                    ]}>
                    <Radio.Group>
                        <Radio value={1}>男</Radio>
                        <Radio value={2}>女</Radio>
                    </Radio.Group>
                </Form.Item>

                <Form.Item
                    name="department"
                    label='Department'
                    style={{'margin-bottom': '6px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Department!',
                        },
                    ]}>
                     <Input />
                </Form.Item>

                <Form.Item
                    name="major"
                    label='Major'
                    style={{'margin-bottom': '6px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Major!',
                        },
                    ]}>
                     <Input />
                </Form.Item>

                <Form.Item
                    name="grade"
                    label='Grade'
                    style={{'margin-bottom': '6px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Grade!',
                        },
                    ]}>
                     <Input />
                </Form.Item>

                <Form.Item
                    name="clazz"
                    label='Clazz'
                    style={{'margin-bottom': '6px'}}
                    rules={[
                        {
                            required: true,
                            message: 'Please input your Clazz!',
                        },
                    ]}>
                     <Input />
                </Form.Item>

                <Form.Item
                    name="email"
                    label='E-mail'
                    style={{'margin-bottom': '6px'}}
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
                    <Input />
                </Form.Item>

                <Form.Item {...tailFormItemLayout}>
                    <Button type="primary" htmlType="submit" className="signup-form-button">
                        Sign Up
                    </Button>
                    Or <a href={"/login"}>login now!</a>
                </Form.Item>
            </Form></div>
        );
    }
}
