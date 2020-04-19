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
import 'react-markdown-editor-lite/lib/index.css';
import {checkFetchStatus} from "../page/utils";
import {getId} from "./utils";

export default class Dataset extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            limit: 20,
            offset: 0,
            datasets: []
        };
        this.offset = 0
        this.limit = 20
        this.total = 0
        this.current = 0
        this.experimental_item_id = props.experimental_item_id
        this.update_modal_visible = false
        this.update_dataset = null
        this.columns = [
            {
                title: '数据集名称',
                dataIndex: 'dataset_name',
                key: 'dataset_name',
                render: (text, recode) => <a href={"/dataset/" + recode.dataset_id}>{text}</a>,
                sorter: (a, b) => a.dataset_name > b.dataset_name,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                key: 'create_time',
                sorter: (a, b) => a.time > b.time,
                sortDirections: ['descend', 'ascend'],
            }
        ];
    }

    handleChangePage = (pageNumber) => {
        this.getData({offset: (pageNumber - 1) * this.limit, limit: this.limit})
    }

    getModalMsg = (result, msg) => {
        this.update_modal_visible = false
        this.update_dataset = null;
        this.getData()
    }


    getData = ({offset = this.offset, limit = this.limit} = {}) => {
        this.offset = offset
        this.limit = limit
        const api = `/api/dataset?experimental_item_id=${this.experimental_item_id}&offset=${offset}&limit=${limit}`
        fetch(api)
            .then(checkFetchStatus)
            .then(resp => resp.json())
            .then(jsonData => {
                let data = jsonData.data.detail
                this.total = jsonData.data.count
                this.current = Number.parseInt(offset / limit, 10) + 1
                let datasets = datasetTableFilter(data)
                if (this.state.datasets.length > 0) {
                    this.setState({datasets: []})
                }
                this.setState({datasets: datasets})
            })
            .catch(err => {
                alert(`fatal error, error message in console.`)
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
                <Table pagination={pagination} ref={"table"} dataSource={this.state.datasets}
                       columns={this.columns}/>
            </div>)
    }
}


function datasetTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['dataset_name'] = data[idx].dataset_name
        result['dataset_id'] = data[idx].dataset_id
        result['description'] = data[idx].description
        result['create_time'] = data[idx].create_time
        results.push(result)
    }
    return results
}