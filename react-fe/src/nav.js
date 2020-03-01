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
                        <Link to="/home">首页</Link>
                    </Menu.Item>
                    <Menu.Item key="2">
                        <ExperimentOutlined/>
                        <Link to="/experimental">实验</Link>
                    </Menu.Item>
                    <Menu.Item key="3">
                        <ApartmentOutlined/>
                        <Link to="/project">工程</Link>
                    </Menu.Item>
                    <Menu.Item key="4">
                        <MonitorOutlined/>
                        <Link to="/monitor">任务</Link>
                    </Menu.Item>
                    <SubMenu
                        key="sub_mine"
                        title={
                            <span>
                                    <UserOutlined/>
                                    <span>我的</span>
                                </span>
                        }>
                        <Menu.Item key="5"><Link to="/clazz">班级</Link></Menu.Item>
                        <Menu.Item key="6"><Link to="/grade">成绩</Link></Menu.Item>
                        <Menu.Item key="7"><Link to="/evaluation">评测</Link></Menu.Item>
                    </SubMenu>
                </Menu>
            </Sider>
        );
    }
}
