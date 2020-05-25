import React from 'react'
import $ from 'jquery'
import {Link} from 'react-router-dom'
import {Button, Tree, Card, Form, Input, message, Modal, Divider,Select, Table, Tag} from 'antd';

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
                align: 'center'
            },
            {
                title: '班级',
                dataIndex: 'clazz_name',
                key: 'clazz_name',
                align: 'center'
            },
            {
                title: '实验项目',
                dataIndex: 'experimental_item_name',
                key: 'experimental_item_name',
                align: 'center'
            },
            {
                title: '实验任务',
                dataIndex: 'experimental_task_name',
                key: 'experimental_task_name',
                align: 'center'
            },
            // {
            //     title: '组件类型',
            //     dataIndex: 'task_name',
            //     key: 'task_name',
            //     align: 'center'
            // },
            {
                title: '状态',
                dataIndex: 'status',
                key: 'status',
                align: 'center',
                render: status => {
                    let color = ""
                    switch (status) {
                        case "pending":
                            color = "#1890ff"
                            break
                        case "running":
                            color = "#FAFF37"
                            break
                        case "success":
                            color = "#00EE00"
                            break
                        case "fail":
                            color = "#EE0000"
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
                title: '提交时间',
                dataIndex: 'create_time',
                key: 'create_time',
                align: 'center'
            }
        ];
    }

    getData() {
        $.ajax({
            url: '/api/evaluation',
            type: 'GET',
            async: false,
            dataType: 'json',
            success: jsonData => {
                let data = evaluationFilter(jsonData.data.detail)
                this.setState({grades: data})
            }
        })
    }

    componentWillMount() {
        this.getData()
    }

    componentDidMount() {
        setInterval(() => {
            $.ajax({
            url: '/api/evaluation',
            type: 'GET',
            async: false,
            dataType: 'json',
            success: jsonData => {
                let data = evaluationFilter(jsonData.data.detail)
                this.setState({grades: data})
            }
        })
        }, 10000)
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


function evaluationFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['evaluation_id'] = data[idx].evaluation_id
        result['status'] = data[idx].status
        result['create_time'] = data[idx].create_time
        result['clazz_id'] = data[idx].clazz_id
        result['clazz_name'] = data[idx].clazz_name
        result['user_name'] = data[idx].user_name
        result['task_name'] = data[idx].task_name
        result['experimental_item_id'] = data[idx].experimental_item_id
        result['experimental_item_name'] = data[idx].experimental_item_name
        result['experimental_task_name'] = data[idx].experimental_task_name
        result['experimental_task_id'] = data[idx].experimental_task_id
        result['user_id'] = data[idx].user_id
        results.push(result)
    }
    return results
}
