import React from 'react'
import {Link} from 'react-router-dom'
import 'antd/dist/antd.css';
import './static/css/ant.css';
import {Layout, Menu} from 'antd';
import {
    HomeOutlined,
    ApartmentOutlined,
    ExperimentOutlined,
    MonitorOutlined,
    UserOutlined,
} from '@ant-design/icons';

const {Sider} = Layout;
const {SubMenu} = Menu;

export default class Nav extends React.Component {
    constructor(props) {
        super(props)
    }


    render() {
        return (
            <Sider collapsed={true} style={{"background": "#29292A"}}>
                <div className="logo"/>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline" style={{"background": "#29292A"}}>
                    <Menu.Item key="1">
                        <HomeOutlined style={{color: '#F0F2F5'}}/>
                        <span>首页</span>
                        <Link to="/home"/>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <ExperimentOutlined style={{color: '#F0F2F5'}}/>
                        <span>实验</span>
                        <Link to="/experimental-item"/>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <ApartmentOutlined style={{color: '#F0F2F5'}}/>
                        <span>工程</span>
                        <Link to="/project"/>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <MonitorOutlined style={{color: '#F0F2F5'}}/>
                        <span>任务</span>
                        <Link to="/monitor"/>
                    </Menu.Item>
                    <SubMenu
                        key="sub_mine"
                        title={
                            <span>
                                    <UserOutlined style={{color: '#F0F2F5'}}/>
                                    <span>用户中心</span>
                                </span>
                        }>
                        <Menu.Item key="5"><Link to="/mine"/><span>个人中心</span></Menu.Item>
                        <Menu.Item key="6"><Link to="/clazz"/><span>班级管理</span></Menu.Item>
                        <Menu.Item key="7"><Link to="/grade"/><span>成绩记录</span></Menu.Item>
                    </SubMenu>
                </Menu>
            </Sider>
        );
    }
}
