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
        this.state = {
            collapsed: false
        }
    }

    onCollapse = collapsed => {
        this.setState({collapsed});
    };

    render() {
        return (
            <Sider collapsible collapsed={this.state.collapsed} onCollapse={this.onCollapse}>
                <div className="logo"/>
                <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                    <Menu.Item key="1">
                        <HomeOutlined/>
                        <span>首页</span>
                        <Link to="/home"/>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <ExperimentOutlined/>
                        <span>实验</span>
                        <Link to="/experimental-item"/>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <ApartmentOutlined/>
                        <span>工程</span>
                        <Link to="/project"/>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <MonitorOutlined/>
                        <span>任务</span>
                        <Link to="/monitor"/>
                    </Menu.Item>
                    <SubMenu
                        key="sub_mine"
                        title={
                            <span>
                                    <UserOutlined/>
                                    <span>我的</span>
                                </span>
                        }>
                        <Menu.Item key="5"><Link to="/clazz"/><span>班级</span></Menu.Item>
                        <Menu.Item key="6"><Link to="/grade"/><span>成绩</span></Menu.Item>
                        <Menu.Item key="7"><Link to="/evaluation"/><span>评测</span></Menu.Item>
                    </SubMenu>
                </Menu>
            </Sider>
        );
    }
}
