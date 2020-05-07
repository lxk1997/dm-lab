import React from 'react'
import $ from 'jquery'
import {Link} from 'react-router-dom'
import {Button, Tree, Card, Form, Input, message, Modal, Divider,Select, Table} from 'antd';

export default class Monitor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            grades: []
        }
        this.columns = [
            {
                title: '用户',
                dataIndex: 'user_name',
                key: 'user_name',
            },
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
                title: '分数',
                dataIndex: 'score',
                key: 'score',
            },
            {
                title: '指标',
                dataIndex: 'score_content',
                key: 'score_content',
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
            url: '/api/report',
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

    componentDidMount() {
        setInterval("this.getData()", 150000)
    }

    render() {
        $("#header_title").text('提交队列');
        let pagination = {
            showQuickJumper: true,
            defaultPageSize: 20
        }
       return (<div>
                <Table pagination={pagination} dataSource={this.state.grades} size={'small'}
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
        result['user_name'] = data[idx].user_name
        result['experimental_item_id'] = data[idx].experimental_item_id
        result['experimental_item_name'] = data[idx].experimental_item_name
        result['experimental_task_name'] = data[idx].experimental_task_name
        result['experimental_task_id'] = data[idx].experimental_task_id
        result['user_id'] = data[idx].user_id
        results.push(result)
    }
    return results
}
