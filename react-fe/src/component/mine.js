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
        this.update_modal_visible = false
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

    updateUser = () => {
        this.update_modal_visible = true
        this.update_user = this.state.user
        this.refs.updateUserModal.setInfo({
            visible: this.update_modal_visible,
            user: this.update_user
        })
    }

    getModalMsg = (result, msg) => {
        this.update_modal_visible = false
        this.update_user = null;
        this.getData()
    }

    render() {
        return (<div className="site-page-header-ghost-wrapper" style={{margin: '8px', 'background-color': '#fff'}}>
                    <PageHeader
                      title={this.state.user.user_name}
                      extra={[
                        <Button key="1" type="primary" onClick={this.updateUser} style={{'border-radius': '4px'}}>
                          信息修改
                        </Button>,
                      ]}
                    >
                      <Divider style={{'margin': '6px 0px', 'height': '2px'}}/>
                      {/*<Descriptions size="small" column={3}>*/}
                      {/*  <Descriptions.Item label="学号">{this.state.user.school_id}</Descriptions.Item>*/}
                      {/*</Descriptions>*/}
                      <Descriptions size="small" column={3}>
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
                    <UpdateUserModal visiable={this.update_modal_visible}
                                    user={this.update_user}
                                    ref={"updateUserModal"} parent={this}/>
                  </div>
        )
    }
}

class UpdateUserModal extends React.Component {
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


    handleUpdateUser = values => {
        this.setState({loading: true});
        $.ajax({
            type: 'POST',
            url: '/api/auth',
            async: false,
            data: {
                'new_password': values.new_password,
                'email': values.email,
            },
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData.msg);
                } else {
                    this.setParentMsg();
                    message.success('修改成功');
                }
                this.refs.form.resetFields();
                this.setState({loading: false, visible: false});
            }
        });
    }

    render() {
        return (
            <Modal
                width="300px"
                visible={this.state.visible}
                title="修改个人信息"
                onOk={this.handleUpdateUser}
                onCancel={this.hideModal}
                footer={null}>
                <Form
                    ref="form"
                    name="update-user"
                    className="update-user-form"
                    onFinish={this.handleUpdateUser}
                    initialValues = {{
                        'email': this.state.user?this.state.user.email: null
                    }}>
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
                    <Form.Item
                        name="email"
                        rules={[
                            {
                                required: true,
                                message: '请输入邮箱!',
                            },
                        ]}>
                        <Input placeholder="邮箱"/>
                    </Form.Item>
                    <Form.Item style={{"textAlign": "center"}}>
                        <Button key="submit" type="primary" htmlType="submit" loading={this.state.loading}>
                            更新
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
        let date_util = new DateUtil()
        let date_week = date_util.getStartDayOfWeek() + ' ~ ' + date_util.getEndDayOfWeek()
        let date_month = date_util.getStartDayOfMonth() + ' ~ ' + date_util.getEndDayOfMonth()
        let date_quarter = date_util.getQuarter()
        const date_week_component = (<div><span>本周评测排名</span><span style={{'font-size': '10px', 'font-weight': 'bold', 'padding-top': '4px', 'position': 'absolute', 'right': '10px'}}>{date_week}</span></div>)
        const date_month_component = (<div><span>本月评测排名</span><span style={{'font-size': '10px', 'font-weight': 'bold', 'padding-top': '4px' , 'position': 'absolute', 'right': '10px'}}>{date_month}</span></div>)
        const date_quarter_component = (<div><span>本季度评测排名</span><span style={{'font-size': '10px', 'font-weight': 'bold', 'padding-top': '4px', 'position': 'absolute', 'right': '10px'}}>{date_quarter}</span></div>)
        return (
            <div className="site-card-wrapper" style={{"margin": "8px"}}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Card title= {date_week_component} bordered={false}>
                      <span style={{"font-size": '50px', 'text-align': 'center', 'color': 'green'}}>3.2%</span>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={date_month_component} bordered={false}>
                      <span style={{"font-size": '50px', 'text-align': 'center', 'color': 'green'}}>3.5%</span>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card title={date_quarter_component} bordered={false}>
                      <span style={{"font-size": '50px', 'text-align': 'center', 'color': 'green'}}>12.5%</span>
                    </Card>
                  </Col>
                </Row>
            </div>)
    }
}

class MineCommitHeatMap extends React.Component {
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

    componentDidMount() {
        let today = new Date();
        // 获取一年前的今天
        var date = new Date(today.getFullYear()-1+'/'+(today.getMonth()+1)+'/'+today.getDate()).getTime();
        var end = new Date().getTime();
        let data = this.getVirtulData('2020');
        let option = {
            legend: {
                top: '270',
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
                    {min: 0, max: 5, label: '0', color: '#e2e4e6'},
                    {min: 5, max: 10, label: '0-10', color: '#acd5f2'},
                    {min: 10, max: 40, label: '10-20', color: '#7fa8c9'},
                    {min: 40, label: '40+', color: '#527ba0'}
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
                name: '0-5',
                type: 'heatmap',
                coordinateSystem: 'calendar',
                data: data.filter(item=>item[1]>=0 && item[1]<=5),
                itemStyle: {
                    color: '#e2e4e6'
                },
                emphasis: {
                    itemStyle: {
                        borderColor: '#333'
                    }
                }
            },{
                name: '6-10',
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
                name: '11-40',
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
                name: '40+',
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
            }],
            textStyle: {
                fontSize: 14
            },
            backgroundColor: '#fff'
        };
        var my_heat_map = echarts.init(document.getElementById('heat_map_main'));
        my_heat_map.setOption(option)
    }

    getVirtulData = year => {
        let today = new Date();
        // 获取一年前的今天
        var date = new Date(today.getFullYear()-1+'/'+(today.getMonth()+1)+'/'+today.getDate()).getTime();
        var end = new Date().getTime();
        var dayTime = 3600 * 24 * 1000; // 一天
        var data = [];
        for (var time = date; time < end; time += dayTime) {
            data.push([
                echarts.format.formatTime('yyyy-MM-dd', time),
                Math.floor(Math.random() * 100)
            ]);
        }
        return data;
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