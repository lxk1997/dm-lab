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
    Tag
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Highlighter from 'react-highlight-words';
import {SearchOutlined, InboxOutlined, StarOutlined} from '@ant-design/icons';
import MarkdownIt from 'markdown-it'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css';
import {checkFetchStatus} from "../page/utils";
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
        const api = `/api/experimental-item?offset=${offset}&limit=${limit}`
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
        let pagination = {
            showQuickJumper: true,
            total: this.total,
            current: this.current,
            onChange: this.handleChangePage,
            defaultPageSize: 20
        }
        return (
            <div>
                <Table pagination={pagination} ref={"table"} dataSource={this.state.experimental_items}
                       columns={this.columns}/>
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
            case 3:
                window.history.replaceState(null, null, this.current_url + '/score-leaderboard')
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
                        <TabPane tab="完成情况" key="3">
                            <ScoreLeaderboard experimental_item_id={this.experimental_item_id}/>
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
        let pagination = {
            showQuickJumper: true,
            total: this.total,
            current: this.current,
            onChange: this.handleChangePage,
            defaultPageSize: 20
        }
        return (
            <div>
                <Table pagination={pagination} ref={"table"} dataSource={this.state.experimental_tasks}
                       columns={this.columns}/>
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
        };
        this.current_url = props.match.url
        this.md_text = null
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


    render() {
        const mdParser = new MarkdownIt();
        const attachments = {
          defaultFileList: [
            {
              uid: '1',
              name: '实验一 Apriori',
              status: 'done',
              response: 'Server Error 500', // custom error message to show
              url: 'http://www.baidu.com/xxx.png',
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
            <PageHeader
                tags={tag}
                className="site-page-header-responsive"
                onBack={() => window.history.back()}
                title={this.state.experimental_task.experimental_task_name}
                footer={
                    null
                }>
                <ExperimentalTaskDetailContent extra={extraContent}>{renderContent()}</ExperimentalTaskDetailContent>
            </PageHeader>
            <MdEditor
                style={{"height": "300px"}}
                value={this.state.experimental_task.content}
                config={{
                  view: {
                    menu: false,
                    md: false,
                    html: true
                  }
                }}
                renderHTML={(text) => mdParser.render(text)}/>
            <Upload {...attachments}/>
        </div>)

    }
}

class ScoreLeaderboard extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return <div>aaa</div>
    }
}

function experimentalItemTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['name'] = data[idx].experimental_item_name
        result['clazz_name'] = data[idx].clazz_name
        result['clazz_id'] = data[idx].clazz_id
        result['time'] = data[idx].create_time
        result['experimental_item_id'] = data[idx].experimental_item_id
        result['description'] = data[idx].description
        results.push(result)
    }
    return results
}

function experimentalTaskTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['name'] = data[idx].experimental_task_name
        result['time'] = data[idx].create_time
        result['start_time'] = data[idx].start_time
        result['dead_line'] = data[idx].dead_line
        result['experimental_item_id'] = data[idx].experimental_item_id
        result['experimental_task_id'] = data[idx].experimental_task_id
        result['status'] = data[idx].status
        results.push(result)
    }
    return results
}
