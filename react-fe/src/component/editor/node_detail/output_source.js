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

class OutputSource extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            dataset_columns: []
        }
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

    handleFieldRefresh = () => {
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        $.ajax({
            type: 'GET',
            url: `/api/component/${values.task_name}/${values.id}/data`,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error('当前组件运行数据不存在')
                } else {
                    if(this.state.dataset_columns.length) {
                        this.setState({dataset_columns: []})
                    }
                    let data = JSON.parse(jsonData.data.detail[0].data)
                    let dataset_columns = datasetColumnTableFilter(data)
                    this.setState({dataset_columns: dataset_columns})
                }
            }
        })
    }

    render(){
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        let fields_msg = null
        if(this.state.dataset_columns) {
            fields_msg = <Table columns={this.columns} dataSource={this.state.dataset_columns} pagination={null} scroll={{y: 150}}  style={{"overflow":"scroll", "width": "300px"}}/>
        }
        return(
            <Collapse defaultActiveKey={['1']}>
                <Panel header="字段属性" key="1">
                    <div>输出字段</div>
                    <Button type="primary" size={'small'} icon={<SyncOutlined />} onClick={this.handleFieldRefresh}/>
                    {fields_msg}
                </Panel>
                <Panel header="组件描述" key="2">
                <div>
                    输出源：将数据表中的数据导出到指定的数据库中
                </div>
                </Panel>
            </Collapse>
        )
    }
}

export default withPropsAPI(OutputSource);



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