import React from 'react'
import 'antd/dist/antd.css';
import $ from 'jquery'
import {
    Button,
    Radio,
    DatePicker,
    Descriptions,
    Form,
    Input,
    message,
    Modal,
    Divider,
    PageHeader,
    Popconfirm,
    Select,
    Table,
    Tabs,
    Tag,
    Upload,
    Card,
    Row,
    Col
} from 'antd';
import 'react-markdown-editor-lite/lib/index.css';
import {DateUtil} from "../static/js/date_util";
var echarts = require('echarts');

const {Option} = Select

export default class Mine extends React.Component{
    render() {
        $("#header_title").text('个人中心')
        return (<div>
            <MineMessage/>
            <MineRank/>
            <MineCommitHeatMap/>
        </div>)
    }
}

class MineMessage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            user : ''
        }
        this.update_info_modal_visible = false
        this.update_password_modal_visible = false
        this.update_user = null
    }

    getData = () => {
        $.ajax({
            type: 'GET',
            url: '/api/auth/info',
            async: false,
            success: resp => {
                this.setState({user: resp.data})
            }
        })
    }

    componentWillMount() {
        this.getData()
    }

    updatePassword = () => {
        this.update_password_modal_visible = true
        this.update_user = this.state.user
        this.refs.updatePasswordModal.setInfo({
            visible: this.update_password_modal_visible,
            user: this.update_user
        })
    }

    updateUserInfo = () => {
        this.update_info_modal_visible = true
        this.refs.updateUserInfoModal.setInfo({
            visible: this.update_info_modal_visible
        })
    }

    getModalMsg = (result, msg) => {
        this.update_info_modal_visible = false
        this.update_password_modal_visible = false
        this.update_user = null;
        this.getData()
    }

    render() {
        return (<div className="site-page-header-ghost-wrapper" style={{margin: '8px', 'background-color': '#fff'}}>
                    <PageHeader
                      title={this.state.user.school_id}
                      extra={[
                        <Button key="1" type="primary" onClick={this.updatePassword} style={{'border-radius': '4px'}}>
                          密码修改
                        </Button>,
                          <Button key="2" type="primary" onClick={this.updateUserInfo} style={{'border-radius': '4px'}}>
                          个人信息修改
                        </Button>,
                      ]}
                    >
                      <Divider style={{'margin': '6px 0px', 'height': '2px'}}/>
                      {/*<Descriptions size="small" column={3}>*/}
                      {/*  <Descriptions.Item label="学号">{this.state.user.school_id}</Descriptions.Item>*/}
                      {/*</Descriptions>*/}
                      <Descriptions size="small" column={4}>
                        <Descriptions.Item label="姓名">{this.state.user.hasOwnProperty('name')?this.state.user.name:null}</Descriptions.Item>
                        <Descriptions.Item label="学号">{this.state.user.hasOwnProperty('school_id')?this.state.user.school_id:null}</Descriptions.Item>
                        <Descriptions.Item label="性别">{this.state.user.hasOwnProperty('sex')&&this.state.user.sex?(this.state.user.sex === 1?'男':'女'):null}</Descriptions.Item>
                        <Descriptions.Item label="学院">{this.state.user.hasOwnProperty('department')?this.state.user.department:null}</Descriptions.Item>
                        <Descriptions.Item label="专业">{this.state.user.hasOwnProperty('major')?this.state.user.major:null}</Descriptions.Item>
                        <Descriptions.Item label="年级">{this.state.user.hasOwnProperty('grade')?this.state.user.grade:null}</Descriptions.Item>
                        <Descriptions.Item label="班级">{this.state.user.hasOwnProperty('clazz')?this.state.user.clazz:null}</Descriptions.Item>
                        <Descriptions.Item label="邮箱">{this.state.user.email}</Descriptions.Item>
                      </Descriptions>
                      {/*<Descriptions size="small" column={3}>*/}
                      {/*  <Descriptions.Item label="性别">{this.state.user.sex===1 ? '男': '女'}</Descriptions.Item>*/}
                      {/*</Descriptions>*/}
                      {/*<Descriptions size="small" column={3}>*/}
                      {/*  <Descriptions.Item label="年级">{this.state.user.grade}</Descriptions.Item>*/}
                      {/*</Descriptions>*/}
                      {/*<Descriptions size="small" column={3}>*/}
                      {/*  <Descriptions.Item label="学院">{this.state.user.department}</Descriptions.Item>*/}
                      {/*</Descriptions>*/}
                    </PageHeader>
                    <UpdatePasswordModal visiable={this.update_password_modal_visible}
                                    user={this.update_user}
                                    ref={"updatePasswordModal"} parent={this}/>
                    <UpdateUserInfoModal visiable={this.update_info_modal_visible}
                                    ref={"updateUserInfoModal"} parent={this}/>
                  </div>
        )
    }
}

class UpdatePasswordModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: props.visible,
            user: props.user
        };
    }

    setInfo = val => {
        this.setState({visible: val.visible, user: val.user})
    }

    hideModal = () => {
        this.setState({visible: false, loading: false});
        this.refs.form.resetFields();
    }

    setParentMsg = () => {
        this.props.parent.getModalMsg(this, true)
    }

     handleLogout = () => {
        $.ajax({
            type: 'GET',
            url: '/api/auth/logout',
            async: false,
            success: resp => {
                window.location.href = '/login'
            }
        })
    }


    handleUpdatePassword = values => {
        this.setState({loading: true});
        $.ajax({
            type: 'POST',
            url: '/api/auth/password',
            async: false,
            data: {
                'old_password': values.old_password,
                'new_password': values.new_password
            },
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData.msg);
                } else {
                    this.setParentMsg();
                    message.success('密码修改成功');
                }
                this.refs.form.resetFields();
                this.setState({loading: false, visible: false});
                this.handleLogout();
            }
        });
    }

    render() {
        return (
            <Modal
                width="300px"
                visible={this.state.visible}
                title="修改密码"
                onOk={this.handleUpdatePassword}
                onCancel={this.hideModal}
                footer={null}>
                <Form
                    ref="form"
                    name="update-password"
                    className="update-password-form"
                    onFinish={this.handleUpdatePassword}>
                    <Form.Item
                        name="old_password"
                        rules={[
                            {
                                required: true,
                                message: '请输入旧密码!',
                            },
                        ]}>
                        <Input placeholder="旧密码" type="password"/>
                    </Form.Item>
                    <Form.Item
                        name="new_password"
                        rules={[
                            {
                                required: true,
                                message: '请输入新密码!',
                            },
                        ]}>
                        <Input placeholder="新密码" type="password"/>
                    </Form.Item>
                    <Form.Item style={{"textAlign": "center"}}>
                        <Button key="submit" type="primary" htmlType="submit" loading={this.state.loading}>
                            修改
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

class UpdateUserInfoModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: props.visible,
            user: null
        };
    }

    getData = () => {
        $.ajax({
            type: 'GET',
            url: '/api/auth/info',
            async: false,
            success: resp => {
                this.setState({user: resp.data})
            }
        })
    }

    componentWillMount() {
        this.getData()
    }

    setInfo = val => {
        this.getData()
        this.setState({visible: val.visible})
    }

    hideModal = () => {
        this.setState({visible: false, loading: false});
        this.refs.form.resetFields();
    }

    setParentMsg = () => {
        this.props.parent.getModalMsg(this, true)
    }


    handleUpdateUserInfo = values => {
        this.setState({loading: true});
        $.ajax({
            type: 'POST',
            url: '/api/auth/info',
            async: false,
            data: {
                'name': values.hasOwnProperty('name')?values.name:null,
                'sex': values.hasOwnProperty('sex')?values.sex:null,
                'department': values.hasOwnProperty('department')?values.department:null,
                'grade': values.hasOwnProperty('grade')?values.grade:null,
                'clazz': values.hasOwnProperty('clazz')?values.clazz:null,
                'major': values.hasOwnProperty('major')?values.major:null,
                'email': values.hasOwnProperty('email')?values.email:null
            },
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData.msg);
                } else {
                    this.setParentMsg();
                    message.success('信息修改成功');
                }
                this.refs.form.resetFields();
                this.setState({loading: false, visible: false});
                this.getData()
            }
        });
    }

    render() {
        return (
            <Modal
                width="300px"
                visible={this.state.visible}
                title="修改个人信息"
                onOk={this.handleUpdateUserInfo}
                onCancel={this.hideModal}
                footer={null}>
                <Form
                    ref="form"
                    name="update-user-info"
                    className="update-user-info-form"
                    onFinish={this.handleUpdateUserInfo}
                    initialValues={{
                        name: this.state.user && this.state.user.hasOwnProperty('name')?this.state.user.name:null,
                        email: this.state.user && this.state.user.hasOwnProperty('email')?this.state.user.email:null,
                        department: this.state.user && this.state.user.hasOwnProperty('department')?this.state.user.department:null,
                        major: this.state.user && this.state.user.hasOwnProperty('major')?this.state.user.major:null,
                        grade: this.state.user && this.state.user.hasOwnProperty('grade')?this.state.user.grade:null,
                        clazz: this.state.user && this.state.user.hasOwnProperty('clazz')?this.state.user.clazz:null,
                        sex: this.state.user && this.state.user.hasOwnProperty('sex')?this.state.user.sex:null,
                    }}>
                    <Form.Item
                        style={{'margin-bottom': '6px'}}
                        name="name"
                        >
                        <Input placeholder="姓名"/>
                    </Form.Item>
                    <Form.Item
                        style={{'margin-bottom': '6px'}}
                        name="email"
                       >
                        <Input placeholder="邮箱"/>
                    </Form.Item>
                    <Form.Item
                        style={{'margin-bottom': '6px'}}
                        name="department"
                        >
                        <Input placeholder="学院"/>
                    </Form.Item>
                    <Form.Item
                        style={{'margin-bottom': '6px'}}
                        name="major"
                        >
                        <Input placeholder="专业"/>
                    </Form.Item>
                     <Form.Item
                         style={{'margin-bottom': '6px'}}
                        name="grade"
                        >
                        <Input placeholder="年级"/>
                    </Form.Item>
                    <Form.Item
                        style={{'margin-bottom': '6px'}}
                        name="clazz"
                       >
                        <Input placeholder="班级"/>
                    </Form.Item>
                    <Form.Item
                        style={{'margin-bottom': '6px'}}
                        name="sex"
                        >
                        <Select placeholder={'请选择性别'}>
                            <Option value={1}>男</Option>
                            <Option value={2}>女</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item style={{"textAlign": "center"}}>
                        <Button key="submit" type="primary" htmlType="submit" loading={this.state.loading}>
                            修改
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

class MineRank extends React.Component {
    constructor(props) {
        super(props)
    }

    getData = ({offset = this.offset, limit = this.limit} = {}) => {
        // this.offset = offset
        // this.limit = limit
        // let api = `/api/project?offset=${offset}&limit=${limit}&user_only=${true}`
        // $.ajax({
        //     url: api,
        //     type: 'GET',
        //     dataType: 'json',
        //     async: false,
        //     success: jsonData => {
        //         let data = jsonData.data.detail
        //         let projects = projectTableFilter(data)
        //         if (this.state.projects.length > 0) {
        //             this.setState({projects: []})
        //         }
        //         this.setState({projects: projects})
        //     }
        // })
    }

    componentWillMount = () => {
        this.getData()
    }

    render() {
        const date_week_component = (<div><span>TTC分类任务排名</span></div>)
        const date_month_component = (<div><span>TTC聚类任务排名</span></div>)
        const date_quarter_component = (<div><span>TTC回归任务排名</span></div>)
        return (
            <div className="site-card-wrapper" style={{"margin": "8px"}}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Card title= {date_week_component} bordered={false}>
                      <span style={{"font-size": '50px', 'text-align': 'center', 'color': 'green'}}>100%</span>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={date_month_component} bordered={false}>
                      <span style={{"font-size": '50px', 'text-align': 'center', 'color': 'green'}}>100%</span>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={date_quarter_component} bordered={false}>
                      <span style={{"font-size": '50px', 'text-align': 'center', 'color': 'green'}}>100%</span>
                    </Card>
                  </Col>
                </Row>
            </div>)
    }
}

class MineCommitHeatMap extends React.Component {
    constructor(props) {
        super(props);
        this.data = []
    }

    getData = () => {
        let api = `/api/mine-info/heat-map`
        $.ajax({
            url: api,
            type: 'GET',
            dataType: 'json',
            async: false,
            success: jsonData => {
                let data = []
                let today = new Date();
                // 获取一年前的今天
                let date = new Date(today.getFullYear()-1+'/'+(today.getMonth()+1)+'/'+today.getDate()).getTime();
                let end = new Date().getTime();
                let dayTime = 3600 * 24 * 1000; // 一天
                for (var time = date; time < end; time += dayTime) {
                    let tmp_date = echarts.format.formatTime('yyyy-MM-dd', time)
                    data.push([
                        tmp_date,
                        jsonData.data.hasOwnProperty(tmp_date) ? jsonData.data[tmp_date] : 0
                    ]);
                }
               this.data = data
            }
        })
    }

    componentWillMount = () => {
        this.getData()
    }

    componentDidMount() {
        let today = new Date();
        // 获取一年前的今天
        var date = new Date(today.getFullYear()-1+'/'+(today.getMonth()+1)+'/'+today.getDate()).getTime();
        var end = new Date().getTime();
        let data = this.data;
        let option = {
            legend: {
                top: '190',
                left: '80',
                tooltip: {
                    show: true,
                    position: 'top',
                    formatter: (el) => {
                        return el.name;
                    }
                },
                itemGap: -3,
                itemWidth: 15,
                itemHeight: 15,
                icon: 'rect',
                formatter: () => {
                    return '';
                }
            },
            tooltip: {
                position: 'top',
                formatter: function (p) {
                    var format = echarts.format.formatTime('yyyy-MM-dd', p.data[0]);
                    // return format + ': ' + p.data[1];
                    return `提交：${p.data[1]}<br>${echarts.format.formatTime('yyyy-MM-dd', p.data[0])}`;
                }
            },
            visualMap: {
                type: 'piecewise',
                show: false,
                pieces: [
                    {min: 0, max: 0, label: '0', color: '#EDEDED'},
                    {min: 1, max: 9, label: '1-9', color: '#acd5f2'},
                    {min: 10, max: 19, label: '10-19', color: '#7fa8c9'},
                    {min: 20, max: 29, label: '20-29', color: '#527ba0'},
                    {min: 30, label: '30+', color: '#254E77'}
                ]
            },
            calendar: {
                top: 50,
                left: 30,
                right: 30,
                cellSize: 17,
                // 设置月份轴的样式
                monthLabel: {
                    nameMap: 'cn',
                    borderWidth: 0
                },
                range: [date, end],
                // 设置日历格的样式
                itemStyle: {
                    borderWidth: 2,
                    borderColor: '#fff'
                },
                // 设置星期轴的样式
                dayLabel: {
                  nameMap: 'cn',
                  firstDay: 1
                },
                yearLabel: {show: false},
                // 设置分隔线样式
                splitLine: {
                    lineStyle: {
                        color: '#fff',
                        width: 1.25
                    }
                }
            },
            series: [{
                name: 'no commit',
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data.filter(item=>item[1]>=0 && item[1]<=5),
                itemStyle: {
                    color: '#EDEDED'
                },
                emphasis: {
                    itemStyle: {
                        borderColor: '#333'
                    }
                }
            },{
                name: '1-9',
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data.filter(item=>item[1]>5 && item[1]<=10),
                itemStyle: {
                    color: '#acd5f2'
                },
                emphasis: {
                    itemStyle: {
                        borderColor: '#333'
                    }
                }
            },{
                name: '10-19',
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data.filter(item=>item[1]>10 && item[1]<=40),
                itemStyle: {
                    color: '#7fa8c9'
                },
                emphasis: {
                    itemStyle: {
                        borderColor: '#333'
                    }
                }
            },{
                name: '20-29',
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data.filter(item=>item[1]>40),
                itemStyle: {
                    color: '#527ba0'
                },
                emphasis: {
                    itemStyle: {
                        borderColor: '#333'
                    }
                }
            },{
                name: '30+',
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data.filter(item=>item[1]>40),
                itemStyle: {
                    color: '#254E77'
                },
                emphasis: {
                    itemStyle: {
                        borderColor: '#333'
                    }
                }
            }],
            textStyle: {
                fontSize: 14
            },
            backgroundColor: '#fff'
        };
        var my_heat_map = echarts.init(document.getElementById('heat_map_main'));
        my_heat_map.setOption(option)
    }

    render() {
        console.log('return')
        return (
            <div style={{margin: '8px', 'background-color': '#fff'}}>
                <Card title={"实验提交情况概览"} bordered={false}>
                    <div style={{"textAlign": 'center'}}>
                        <div id={"heat_map_main"} style={{width: 1060, height: 220}}/>
                    </div>
                </Card>
            </div>)
    }
}


function projectTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['project_name'] = data[idx].project_name
        result['project_id'] = data[idx].project_id
        result['department'] = data[idx].department_name
        result['project_type'] = data[idx].project_type_name
        result['project_source'] = data[idx].project_source_name
        result['create_time'] = data[idx].create_time
        result['start_time'] = data[idx].start_time
        result['teacher_id'] = data[idx].teacher_id
        result['dead_line'] = data[idx].dead_line
        result['content'] = data[idx].content
        result['status'] = data[idx].status
        result['state'] = data[idx].state
        result['count_students'] = data[idx].count_students
        result['selected'] = data[idx].selected
        result['teacher_name'] = data[idx].teacher_name
        switch (result['state']) {
            case 0:
                result['project_status'] = '未处理'
                break;
            case 1:
                result['project_status'] = '同意'
                break;
            case -1:
                result['project_status'] = '拒绝'
                break;
            case 2:
                result['project_status'] = '邀请'
                break;
        }
        results.push(result)
    }
    return results
}