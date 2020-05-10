import React from 'react'
import {Link, NavLink, Route, Switch, Redirect} from 'react-router-dom'
import 'antd/dist/antd.css';
import $ from 'jquery'
import {
    Descriptions,
    notification,
    PageHeader,
    Button,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Select,
    Table,
    Tabs,
    DatePicker,
    Upload,
    Tag,
    List,
    Card,
    Avatar
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Highlighter from 'react-highlight-words';
import {SearchOutlined, InboxOutlined, StarOutlined} from '@ant-design/icons';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import {checkFetchStatus, haveField} from "../page/utils";
import {getId} from "./utils";
import Dataset from "./dataset";

export default class ExperimentalItem extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            limit: 20,
            offset: 0,
            experimental_items: []
        };
        this.offset = 0
        this.limit = 20
        this.total = 0
        this.current = 0
        this.columns = [
            {
                title: '实验项目',
                dataIndex: 'name',
                key: 'name',
                render: (text, recode) => <a href={"/experimental-item/" + recode.experimental_item_id}>{text}</a>,
                sorter: (a, b) => a.name > b.name,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '班级',
                dataIndex: 'clazz_name',
                key: 'clazz_name',
            },
            {
                title: '创建时间',
                dataIndex: 'time',
                key: 'time',
                sorter: (a, b) => a.time > b.time,
                sortDirections: ['descend', 'ascend'],
            }
        ];
    }

    handleChangePage = (pageNumber) => {
        this.getData({offset: (pageNumber - 1) * this.limit, limit: this.limit})
    }

    getModalMsg = (result, msg) => {
        this.getData()
    }


    getData = ({offset = this.offset, limit = this.limit} = {}) => {
        this.offset = offset
        this.limit = limit
        const api = `/api/experimental-item`
        fetch(api)
            .then(checkFetchStatus)
            .then(resp => resp.json())
            .then(jsonData => {
                let data = jsonData.data.detail
                this.total = jsonData.data.count
                this.current = Number.parseInt(offset / limit, 10) + 1
                let experimental_items = experimentalItemTableFilter(data)
                if (this.state.experimental_items.length > 0) {
                    this.setState({experimental_items: []})
                }
                this.setState({experimental_items: experimental_items})
            })
            .catch(err => {
                alert(`fatal error, error messge in console.`)
                console.log(err)
            })
    }

    componentWillMount = () => {
        this.getData()
    }

    render() {
        $("#header_title").text('实验项目')
        let CartText = ({item}) => {
            let id_icon = (<span style={{borderRadius: 4, background: '#81b3ff', marginRight: "12px"}}>
                  <span style={{margin: "4px 0 4px 4px"}}>
                  <span
                      style={{
                          borderTopLeftRadius: 4,
                          borderBottomLeftRadius: 4,
                          color: 'white',
                          marginRight: '3px',
                          fontSize: '13px'
                      }}>
                    ID
                  </span>
                  <span style={{
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                      background: '#E3EEFC',
                      color: '#81b3ff',
                      paddingLeft: '3px',
                      paddingRight: '4px'
                  }}>
                      {item.experimental_item_id}
                  </span>
                  </span>
            </span>)
            let title = (<div>
                <div><span>{id_icon}</span><a href={"/experimental-item/" + item.experimental_item_id} style={{color: 'black'}}>{item.experimental_item_name}</a><span
                    style={{position: "absolute", right: "20px"}}><span><Avatar style={{
                    color: '#ffffff',
                    backgroundColor: '#35caca',
                }} size={20}>{item.teacher_name[0]}</Avatar></span><span
                    style={{fontSize: '15px', marginRight: '5px'}}>{item.teacher_name}</span><span
                    style={{color: '#C0C0C0', fontSize: '15px'}}>{item.time}</span></span></div>
                <div style={{color: '#C0C0C0', marginTop: '5px'}}>{item.description}</div>
            </div>);
            let content = (
                <div>
                    <span>
                        <span style={{color: '#C0C0C0', fontSize: '13px'}}>未开始: </span>
                        <span>{item.pre}</span>
                        <span style={{color: '#C0C0C0', fontSize: '13px', marginLeft: '15px'}}>正在进行: </span>
                        <span>{item['now']}</span>
                        <span style={{color: '#C0C0C0', fontSize: '13px', marginLeft: '15px'}}>已结束: </span>
                        <span>{item.last}</span>
                        <span style={{color: '#C0C0C0', fontSize: '13px', marginLeft: '15px'}}>班级: </span>
                        <span>{item.clazz_name}</span>
                    </span>
                    <span style={{position: "absolute", right: "20px"}}/>
                </div>)
            return (<Card title={title}>{content}</Card>)
        };
        let pagination = {
            showQuickJumper: true,
            defaultPageSize: 20
        }
        return (
            <div>
                <List
                    grid={{gutter: 16, column: 1}}
                    dataSource={this.state.experimental_items}
                    pagination={pagination}
                    renderItem={item => (
                        <List.Item>
                            <CartText item={item}/>
                        </List.Item>
                    )}
                />
            </div>)
    }
}

export class ExperimentalItemDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            experimental_item: [],
            searchText: '',
            searchedColumn: '',
        };
        this.current_url = props.match.url
    }

    getData = () => {
        let url = window.location.href
        this.experimental_item_id = getId(url, 'experimental-item')
        $.ajax({
            type: 'GET',
            url: `/api/experimental-item/${this.experimental_item_id}`,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.errer(jsonData)
                } else {
                    if (this.state.experimental_item.length) {
                        this.setState({experimental_item: []})
                    }
                    let data = jsonData.data
                    this.setState({experimental_item: data})
                }
            }
        })
    }

    getModalMsg = (result, msg) => {
        this.getData()
    }

    handleTabUpdate = activeKey => {
        switch (Number.parseInt(activeKey)) {
            case 2:
                window.history.replaceState(null, null, this.current_url + '/dataset')
                break;
            default:
                window.history.replaceState(null, null, this.current_url + '/experimental-task')
                break;
        }
    }


    componentWillMount() {
        this.getData();
    }


    render() {
        $("#header_title").text('')
        const {TabPane} = Tabs
        const renderContent = (column = 1) => (
            <Descriptions size="small" column={column}>
                <Descriptions.Item label="创建时间">{this.state.experimental_item.create_time}</Descriptions.Item>
                <Descriptions.Item label="描述">
                    {this.state.experimental_item.description}
                </Descriptions.Item>
            </Descriptions>
        );
        const extraContent = (
            <div
                style={{
                    display: 'flex',
                    width: 'max-content',
                    justifyContent: 'flex-end',
                }}
            >
            </div>
        );

        const ExperimentalItemDetailContent = ({children, extra}) => {
            return (
                <div>
                    <div className="main">{children}</div>
                    <div className="extra">{extra}</div>
                </div>
            );
        };
        return (<div>
            <PageHeader
                className="site-page-header-responsive"
                onBack={() => window.history.back()}
                title={this.state.experimental_item.experimental_item_name}
                footer={
                    <Tabs defaultActiveKey="1" onChange={this.handleTabUpdate}>
                        <TabPane tab="实验任务" key="1">
                            <ExperimentalTask experimental_item_id={this.experimental_item_id}/>
                        </TabPane>
                        <TabPane tab="实验数据" key="2">
                            <Dataset experimental_item_id={this.experimental_item_id}/>
                        </TabPane>
                    </Tabs>
                }>
                <ExperimentalItemDetailContent extra={extraContent}>{renderContent()}</ExperimentalItemDetailContent>
            </PageHeader>
        </div>)

    }
}

class ExperimentalTask extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            limit: 20,
            offset: 0,
            experimental_tasks: []
        };
        this.offset = 0
        this.limit = 20
        this.total = 0
        this.current = 0
        this.experimental_item_id = props.experimental_item_id
        this.update_modal_visible = false
        this.update_experimental_task = null
        this.columns = [
            {
                title: '实验任务',
                dataIndex: 'name',
                key: 'name',
                render: (text, recode) => <a href={"/experimental-task/" + recode.experimental_task_id}>{text}</a>,
                sorter: (a, b) => a.name > b.name,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                render: status => {
                    let color = ""
                    switch (status) {
                        case "未开始":
                            color = "green"
                            break
                        case "正在进行":
                            color = "blue"
                            break
                        default:
                            color = 'gray'
                            break
                    }
                    return (
                        <span>
                            <Tag color={color} key={status}>
                              {status}
                            </Tag>
                        </span>
                    );
                }
            },
            {
                title: '开始时间',
                dataIndex: 'start_time',
                key: 'start_time',
                sorter: (a, b) => a.start_time > b.start_time,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '结束时间',
                dataIndex: 'dead_line',
                key: 'dead_line',
                sorter: (a, b) => a.dead_line > b.dead_line,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '创建时间',
                dataIndex: 'time',
                key: 'time',
                sorter: (a, b) => a.time > b.time,
                sortDirections: ['descend', 'ascend'],
            }
        ];
    }

    handleChangePage = (pageNumber) => {
        this.getData({offset: (pageNumber - 1) * this.limit, limit: this.limit})
    }


    getModalMsg = (result, msg) => {
        this.update_experimental_task = null;
        this.getData()
    }


    getData = ({offset = this.offset, limit = this.limit} = {}) => {
        this.offset = offset
        this.limit = limit
        const api = `/api/experimental-task?experimental_item_id=${this.experimental_item_id}&offset=${offset}&limit=${limit}`
        fetch(api)
            .then(checkFetchStatus)
            .then(resp => resp.json())
            .then(jsonData => {
                let data = jsonData.data.detail
                this.total = jsonData.data.count
                this.current = Number.parseInt(offset / limit, 10) + 1
                let experimental_tasks = experimentalTaskTableFilter(data)
                if (this.state.experimental_tasks.length > 0) {
                    this.setState({experimental_tasks: []})
                }
                this.setState({experimental_tasks: experimental_tasks})
            })
            .catch(err => {
                alert(`fatal error, error messge in console.`)
                console.log(err)
            })
    }

    componentWillMount = () => {
        this.getData()
    }

    render() {
        $("#header_title").text('')
        let Status = ({item}) => {
                    let color = ""
                    switch (item.status) {
                        case "未开始":
                            color = "green"
                            break
                        case "正在进行":
                            color = "blue"
                            break
                        default:
                            color = 'gray'
                            break
                    }
                    return (
                        <span>
                            <Tag color={color} key={item.status}>
                              {item.status}
                            </Tag>
                        </span>
                    );
                }
        let CartText = ({item}) => {
            let id_icon = (<span style={{borderRadius: 4, background: '#81b3ff', marginRight: "12px"}}>
                  <span style={{margin: "4px 0 4px 4px"}}>
                  <span
                      style={{
                          borderTopLeftRadius: 4,
                          borderBottomLeftRadius: 4,
                          color: 'white',
                          marginRight: '3px',
                          fontSize: '13px'
                      }}>
                    ID
                  </span>
                  <span style={{
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                      background: '#E3EEFC',
                      color: '#81b3ff',
                      paddingLeft: '3px',
                      paddingRight: '4px'
                  }}>
                      {item.experimental_task_id}
                  </span>
                  </span>
            </span>)
            let title = (<div>
                <div><span>{id_icon}</span><a href={"/experimental-task/" + item.experimental_task_id} style={{color: 'black', 'margin-right': '20px'}}>{item.experimental_task_name}</a><Status item={item}/><span
                    style={{position: "absolute", right: "20px"}}><span><Avatar style={{
                    color: '#ffffff',
                    backgroundColor: '#35caca',
                }} size={20}>{item.teacher_name[0]}</Avatar></span><span
                    style={{fontSize: '15px', marginRight: '5px'}}>{item.teacher_name}</span><span
                    style={{color: '#C0C0C0', fontSize: '15px'}}>{item.time}</span></span></div>
                <div style={{color: '#C0C0C0', marginTop: '5px'}}>{item.description}</div>
            </div>);
            let content = (
                <div>
                    <span>
                        <span style={{color: '#C0C0C0', fontSize: '13px'}}>开始时间: </span>
                        <span>{item.start_time}</span>
                        <span style={{color: '#C0C0C0', fontSize: '13px', marginLeft: '15px'}}>结束时间: </span>
                        <span>{item['dead_line']}</span>
                    </span>
                    <span style={{position: "absolute", right: "20px"}}/>
                </div>)
            return (<Card title={title}>{content}</Card>)
        };
        let pagination = {
            showQuickJumper: true,
            defaultPageSize: 20
        }
        return (
            <div>
                <List
                    grid={{gutter: 16, column: 1}}
                    dataSource={this.state.experimental_tasks}
                    pagination={pagination}
                    renderItem={item => (
                        <List.Item>
                            <CartText item={item}/>
                        </List.Item>
                    )}
                />
            </div>)
    }
}

export class ExperimentalTaskDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            experimental_task: [],
            searchText: '',
            searchedColumn: '',
            score_leaderboard_modal_visible: false
        };
    }

    getData = () => {
        let url = window.location.href
        this.experimental_task_id = getId(url, 'experimental-task')
        $.ajax({
            type: 'GET',
            url: `/api/experimental-task/${this.experimental_task_id}`,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.errer(jsonData)
                } else {
                    if (this.state.experimental_task.length) {
                        this.setState({experimental_task: []})
                    }
                    let data = jsonData.data
                    this.setState({experimental_task: data})
                }
            }
        })
    }

    getModalMsg = (result, msg) => {
        this.update_modal_visible = false
        this.getData()
    }

    componentWillMount() {
        this.getData();
    }

    handleScoreLeaderBoardDisplay = () => {
        this.refs.scoreLeaderboardModal.setInfo({visible: true, experimental_task_id: this.experimental_task_id})
    }


    render() {
        $("#header_title").text('')
        const attachments = {
            defaultFileList: [
                {
                    uid: '1',
                    name: this.state.experimental_task.file_name,
                    status: 'done',
                    response: '200',
                    url: this.state.experimental_task.file_path
                },
            ],
            showUploadList: {
                showDownloadIcon: true,
                downloadIcon: 'download ',
                showRemoveIcon: false
            },
        };
        let tag = null;
        switch (this.state.experimental_task.status) {
            case "未开始":
                tag = <Tag color="green">未开始</Tag>
                break
            case "正在进行":
                tag = <Tag color="blue">正在进行</Tag>
                break
            default:
                tag = <Tag color="gray">已结束</Tag>
        }
        const renderContent = (column = 1) => (
            <Descriptions size="small" column={column}>
                <Descriptions.Item label="创建时间">{this.state.experimental_task.create_time}</Descriptions.Item>
                <Descriptions.Item label="开始时间">{this.state.experimental_task.start_time}</Descriptions.Item>
                <Descriptions.Item label="结束时间">{this.state.experimental_task.dead_line}</Descriptions.Item>
                <Descriptions.Item label="描述">
                    {this.state.experimental_task.description}
                </Descriptions.Item>
            </Descriptions>
        );
        const extraContent = (
            <div
                style={{
                    display: 'flex',
                    width: 'max-content',
                    justifyContent: 'flex-end',
                }}
            >
            </div>
        );

        const ExperimentalTaskDetailContent = ({children, extra}) => {
            return (
                <div>
                    <div className="main">{children}</div>
                    <div className="extra">{extra}</div>
                </div>
            );
        };
        return (<div>
            <ScoreLeaderboard visiable={this.state.score_leaderboard_modal_visible}
                              experimental_task_id={this.experimental_task_id} ref={"scoreLeaderboardModal"}
                              parent={this}/>
            <PageHeader
                tags={tag}
                className="site-page-header-responsive"
                onBack={() => window.history.back()}
                title={this.state.experimental_task.experimental_task_name}
                extra={[
                    <Button key="1" type="primary" onClick={this.handleScoreLeaderBoardDisplay}
                            style={{'border-radius': '4px'}}>
                        积分榜
                    </Button>,
                ]}>
                <ExperimentalTaskDetailContent extra={extraContent}>{renderContent()}</ExperimentalTaskDetailContent>
            </PageHeader>
            <TextArea defaultValue={this.state.experimental_task.content} disabled={true}/>
            <Upload {...attachments}/>
        </div>)

    }
}

class ScoreLeaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
            report_modal_visible: false,
            experimental_task_id: props.experimental_task_id,
            reports: []
        }

        this.columns = [
            {
                title: '用户',
                dataIndex: 'user_name',
                key: 'user_name',
                render: (text, recode) => <a href={"/user/" + recode.user_id}>{text}</a>
            },
            {
                title: '评测',
                dataIndex: 'score_content',
                key: 'score_content',
            },
            {
                title: '提交时间',
                dataIndex: 'create_time',
                key: 'create_time',
                sorter: (a, b) => a.create_time > b.create_time,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '成绩',
                dataIndex: 'score',
                key: 'score',
                sorter: (a, b) => a.score > b.score,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '',
                key: 'action',
                render: (text, record) => {
                    if (record.score !== '') {
                        return (<span>
                        <a style={{marginRight: 8}} href={"#"}
                           onClick={() => this.handleDisplayReport(record)}><Tag key={'查看报告'} color={'green'}>查看报告</Tag></a>
                    </span>)
                    } else {
                        return <span/>
                    }
                },
            },
        ];

    }

    getData = () => {
        const api = `/api/experimental-task/${this.state.experimental_task_id}/leaderboard`
        $.ajax({
            url: api,
            type: 'GET',
            dataType: 'json',
            async: false,
            success: jsonData => {
                let data = jsonData.data
                let reports = reportTableFilter(data)
                if (this.state.reports.length > 0) {
                    this.setState({reports: []})
                }
                this.setState({reports: reports})
            }
        })
    }

    componentWillMount = () => {
        this.getData()
    }

    handleDisplayReport = record => {
        let data = []
        $.ajax({
            type: 'GET',
            url: `/api/component/${record.task_name}/${record.data_id}/report`,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error('当前组件运行数据不存在')
                } else {
                    data = jsonData.data.detail
                }
            }
        })
        this.refs.reportModal.setInfo({visible: true, data: data});
    }

    setInfo = val => {
        this.setState({visible: val.visible, experimental_task_id: val.experimental_task_id})
    }

    hideModal = () => {
        this.setState({visible: false});
    }

    render() {
        let pagination = {
            showQuickJumper: true,
            defaultPageSize: 20
        }
        return (
            <Modal
                width="800px"
                height="600px"
                visible={this.state.visible}
                title="积分榜"
                onCancel={this.hideModal}
                footer={null}>
                <ReportModal visiable={this.state.report_modal_visible} ref={"reportModal"} parent={this}/>
                <Table size={"small"} pagination={pagination} ref={"table"} dataSource={this.state.reports}
                       columns={this.columns}/>
            </Modal>
        );
    }
}

class ReportModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
            data: []
        }
    }

    setInfo = val => {
        this.setState({visible: val.visible, data: val.data})
    }

    hideModal = () => {
        this.setState({visible: false, data: []});
    }

    render() {
        let report_elements = reportFilter(this.state.data);
        return (
            <Modal
                width="800px"
                height="500px"
                visible={this.state.visible}
                title="报告"
                onCancel={this.hideModal}
                footer={null}>
                <div style={{'textAlign': 'center'}}>{report_elements}</div>
            </Modal>
        );
    }
}

function experimentalItemTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['experimental_item_name'] = data[idx].experimental_item_name
        result['clazz_name'] = data[idx].clazz_name
        result['clazz_id'] = data[idx].clazz_id
        result['teacher_id'] = data[idx].teacher_id
        result['teacher_name'] = data[idx].teacher_name
        result['pre'] = data[idx].pre
        result['now'] = data[idx]['now']
        result['last'] = data[idx].last
        result['time'] = data[idx].create_time
        result['experimental_item_id'] = data[idx].experimental_item_id
        result['description'] = data[idx].description === '' || data[idx].description === null ? "暂无描述" : data[idx].description
        results.push(result)
    }
    return results
}

function experimentalTaskTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['experimental_task_name'] = data[idx].experimental_task_name
        result['time'] = data[idx].create_time
        result['start_time'] = data[idx].start_time
        result['dead_line'] = data[idx].dead_line
        result['teacher_id'] = data[idx].teacher_id
        result['teacher_name'] = data[idx].teacher_name
        result['experimental_item_id'] = data[idx].experimental_item_id
        result['experimental_task_id'] = data[idx].experimental_task_id
        result['status'] = data[idx].status
        result['description'] = data[idx].description === '' || data[idx].description === null ? "暂无描述" : data[idx].description
        results.push(result)
    }
    return results
}

function reportTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['report_id'] = haveField(data[idx], 'report_id') ? data[idx].report_id : ''
        result['experimental_task_id'] = haveField(data[idx], 'experimental_task_id') ? data[idx].experimental_task_id : ''
        result['experimental_task_name'] = haveField(data[idx], 'experimental_task_name') ? data[idx].experimental_task_name : ''
        result['task_name'] = haveField(data[idx], 'task_name') ? data[idx].task_name : ''
        result['data_id'] = haveField(data[idx], 'data_id') ? data[idx].data_id : ''
        result['user_id'] = haveField(data[idx], 'user_id') ? data[idx].user_id : ''
        result['user_name'] = haveField(data[idx], 'user_name') ? data[idx].user_name : ''
        result['content'] = haveField(data[idx], 'content') ? data[idx].content : ''
        result['file_key'] = haveField(data[idx], 'file_key') ? data[idx].file_key : ''
        result['score'] = haveField(data[idx], 'score') ? data[idx].score : '暂无'
        result['score_content'] = haveField(data[idx], 'score_content') ? data[idx].score_content : ''
        result['create_time'] = haveField(data[idx], 'create_time') ? data[idx].create_time : ''
        results.push(result)
    }
    return results
}

function reportFilter(data) {
    let rsts = []
    for (var idx = 0; idx < data.length; idx++) {
        let element = null
        if (data[idx].type === 'table') {
            element = tableRender(data[idx])
        } else if (data[idx].type === 'image') {
            element = imageRender(data[idx])
        }
        rsts.push(element)
    }
    return rsts
}

function tableRender(data) {
    let columns = []
    for (let idx = 0; idx < data.data.headers.length; idx++) {
        columns.push({
            title: data.data.headers[idx],
            dataIndex: data.data.headers[idx],
            key: data.data.headers[idx],
            align: 'center'
        })
    }
    let contents = []
    for (let idx = 0; idx < data.data.content.length; idx++) {
        let content = {key: idx}
        for (let idx1 = 0; idx1 < data.data.headers.length; idx1++) {
            content[data.data.headers[idx1]] = data.data.content[idx][idx1]
        }
        contents.push(content)
    }
    return <Table style={{'margin-bottom': '5px'}} bordered size={'small'}
                  title={() => <div style={{'textAlign': 'center'}}>{data.name}</div>} columns={columns}
                  dataSource={contents} pagination={false}/>
}

function imageRender(data) {
    if (data.name === 'Overview') {
        return (<div style={{'text-align': 'center'}}><img src={data.data} width={"500px"}/><br/><span
            style={{'margin-bottom': '5px'}}>{data.name}</span></div>)
    } else {
        return (<div style={{'text-align': 'center'}}><img src={data.data} width={"680px"}/><br/><span
            style={{'margin-bottom': '5px'}}>{data.name}</span></div>)
    }
}
