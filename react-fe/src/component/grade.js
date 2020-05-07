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
import {checkFetchStatus, haveField} from "../page/utils";
import {getId} from "./utils";

export default class Grade extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            grades: []
        }
        this.columns = [
            {
                title: '班级',
                dataIndex: 'clazz_name',
                key: 'clazz_name',
            },
            {
                title: '实验项目',
                dataIndex: 'experimental_item_name',
                key: 'experimental_item_name',
            },
            {
                title: '实验任务',
                dataIndex: 'experimental_task_name',
                key: 'experimental_task_name',
            },
            {
                title: '成绩',
                dataIndex: 'score',
                key: 'score',
            },
            {
                title: '排名',
                dataIndex: 'rank',
                key: 'rank',
            },
            {
                title: '提交时间',
                dataIndex: 'create_time',
                key: 'create_time',
            }
        ];
    }

    getData() {
        $.ajax({
            url: '/api/report/mine',
            type: 'GET',
            async: false,
            dataType: 'json',
            success: jsonData => {
                let data = reportFilter(jsonData.data.detail)
                this.setState({grades: data})
            }
        })
    }

    componentWillMount() {
        this.getData()
    }

    render() {
        $("#header_title").text('成绩记录');
        let pagination = {
            showQuickJumper: true,
            defaultPageSize: 20
        }
       return (<div>
                <Table pagination={pagination} dataSource={this.state.grades}
                       columns={this.columns}/>
            </div>)
    }
}

function reportFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['report_id'] = data[idx].report_id
        result['score'] = data[idx].score
        result['score_content'] = data[idx].score_content
        result['create_time'] = data[idx].create_time
        result['clazz_id'] = data[idx].clazz_id
        result['clazz_name'] = data[idx].clazz_name
        result['experimental_item_id'] = data[idx].experimental_item_id
        result['experimental_item_name'] = data[idx].experimental_item_name
        result['experimental_task_name'] = data[idx].experimental_task_name
        result['experimental_task_id'] = data[idx].experimental_task_id
        result['user_id'] = data[idx].user_id
        result['rank'] = data[idx].rank
        results.push(result)
    }
    return results
}
