import React from 'react';
import {Collapse, Form, Select, Table, Button, message} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import 'rc-color-picker/assets/index.css';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import $ from 'jquery'
import {checkFetchStatus} from "../../../page/utils";

const {Item}=Form;
const { Panel } = Collapse;
const { Option } = Select;

class InputSource extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            datasets: [],
            dataset_columns: []
        }
        this.dataset = ''
        this.columns = [
            {
                title: '字段',
                dataIndex: 'field',
                key: 'field',
                width: '40%'
            },
            {
                title: '类型',
                dataIndex: 'type',
                key: 'type',
                width: '20%'
            },
            {
                title: '取值范围',
                dataIndex: 'range',
                key: 'range',
                width: '40%'
            }
        ]
    }

    getFirstData(){
        const api = `/api/dataset`
        fetch(api)
            .then(checkFetchStatus)
            .then(resp => resp.json())
            .then(jsonData => {
                this.setState({datasets: jsonData.data.detail})
            })
            .catch(err => {
                alert(`fatal error, error message in console.`)
                console.log(err)
            })
    }

    componentWillMount(){
        this.getFirstData()
    }

    handleSubmit=v=>{
        const {propsAPI}=this.props;
        const {getSelected,update}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        let values = item.getModel()
        values.dataset = v;
        this.dataset = v;
        update(item,{
            ...values
        });
    };

    handleFieldRefresh = () => {
        if(this.dataset === "") {
            message.error('请先选择要使用的数据表')
        } else {
            $.ajax({
                type: 'GET',
                url: `/api/dataset/info?dataset_name=${this.dataset}`,
                async: false,
                dataType: 'json',
                success: (jsonData) => {
                    if (jsonData.error) {
                        message.error(jsonData)
                    } else {
                        if(this.state.dataset_columns.length) {
                            this.setState({dataset_columns: []})
                        }
                        let data = jsonData.data.detail
                        let dataset_columns = datasetColumnTableFilter(data)
                        this.setState({dataset_columns: dataset_columns})

                    }
                }
            })
        }
    }

    render(){
        this.dataset_options = this.state.datasets.length?this.state.datasets.map(ele => <Option value={ele.dataset_name}>{ele.dataset_name}</Option>):null;
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        const {dataset}=item.getModel()
        let fields_msg = null
        if(this.state.dataset_columns) {
            fields_msg = <Table columns={this.columns} dataSource={this.state.dataset_columns} pagination={null} scroll={{y: 150}}  style={{"overflow":"scroll", "width": "300px"}}/>
        }
        return(
            <Collapse defaultActiveKey={['1']}>
                <Panel header="字段属性" key="1">
                <Form onFinish={this.handleSubmit}
                initialValues={{dataset: dataset}}>
                    <div>数据表</div>
                    <Form.Item name="dataset">
                        <Select
                            style={{width: '60%'}}
                            placeholder="请选择数据集"
                            onChange={this.handleSubmit}>
                            {this.dataset_options}</Select>
                    </Form.Item>
                    <div>字段信息</div>
                    <Form.Item>
                        <Button type="primary" size={'small'} icon={<SyncOutlined />} onClick={this.handleFieldRefresh}/>
                        {fields_msg}
                    </Form.Item>
                </Form>
                </Panel>
                <Panel header="组件描述" key="2">
                <div>
                    输入源：读取表数据组件。当输入表名后，会自动读取表的结构数据，在字段信息中可查看当数据源是来来源于数据库时，表字段修改后，如增加或删除某个字段，在平台是无法感知的，需要用户重新设置一下数据源，数据同步一下这个表信息.
                </div>
                </Panel>
            </Collapse>
        )
    }
}

export default withPropsAPI(InputSource);



function datasetColumnTableFilter(data) {
    let columns = data.headers
    let rsts = [];
    for(var i=0; i< columns.length; i++) {
        let rst = {}
        rst.field = columns[i];
        rst.type = '字符'
        rst.range = ''
        rsts.push(rst)
    }
    return rsts
}