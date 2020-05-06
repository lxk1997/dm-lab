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
            dataset_columns: [],
            clazz_id: '',
            experimental_item_id: '',
            dataset_id: '',
            clazz_options: [],
            experimental_item_options: [],
            dataset_options: []
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

    getFirstData(){
        $.ajax({
            url: `/api/clazz`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if(this.state.clazz_options.length || this.state.experimental_item_options.length || this.state.dataset_options.length) {
                    this.setState({clazz_options: [], experimental_item_options: [], dataset_options: []})
                }
                let data = jsonData.data.detail.map(ele => {
                    return <Option value={ele.clazz_id}>{ele.clazz_name}</Option>
                })
                this.setState({clazz_options: data})
            }
        })
    }

    componentWillMount(){
        this.getFirstData()
    }

    onClazzChange = val => {
        this.setState({clazz_id: val})
        $.ajax({
            url: `/api/experimental-item?clazz_id=${val}`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if(this.state.experimental_item_options.length || this.state.dataset_options.length) {
                    this.setState({experimental_item_options: [], dataset_options: []})
                }
                let data = jsonData.data.detail.map(ele => {
                    return <Option value={ele.experimental_item_id}>{ele.experimental_item_name}</Option>
                })
                this.setState({experimental_item_options: data})
            }
        })
    }

    onExperimentalItemChange = val => {
        this.setState({experimental_item_id: val})
        $.ajax({
            url: `/api/dataset?experimental_item_id=${val}`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if(this.state.dataset_options.length) {
                    this.setState({dataset_options: []})
                }
                let data = jsonData.data.detail
                data = data.map(ele => {
                    return <Option value={ele.dataset_id}>{ele.dataset_name}</Option>
                })
                this.setState({dataset_options: data})
            }
        })
    }

    onDatasetChange = val => {
        const {propsAPI}=this.props;
        const {getSelected,update}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        let values = item.getModel()
        values.dataset = val;
        this.setState({dataset_id: val});
        update(item,{
            ...values
        });
    }

    handleFieldRefresh = () => {
        if(this.state.dataset_id === "") {
            message.error('请先选择要使用的数据表')
        } else {
            $.ajax({
                type: 'GET',
                url: `/api/dataset/info?dataset_id=${this.state.dataset_id}`,
                async: false,
                dataType: 'json',
                success: (jsonData) => {
                    if (jsonData.error) {
                        message.error(jsonData.error)
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
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let clazz_select = (<Select showSearch style={{ width: 130 }} placeholder="选择所在班级" onChange={this.onClazzChange}>
                             {this.state.clazz_options}
                         </Select>)
        if(this.state.clazz_id !== '') {
            clazz_select = (<Select showSearch style={{ width: 130 }} defaultValue={this.state.clazz_id} onChange={this.onClazzChange}>
                             {this.state.clazz_options}
                         </Select>)
        }

        let experimental_item_select = (<Select showSearch style={{ width: 130 }} placeholder="选择实验项目" onChange={this.onExperimentalItemChange}>
                             {this.state.experimental_item_options}
                         </Select>)
        if(this.state.experimental_item_id !== '') {
            experimental_item_select = (<Select showSearch style={{ width: 130 }} defaultValue={this.state.experimental_item_id} onChange={this.onExperimentalItemChange}>
                             {this.state.experimental_item_options}
                         </Select>)
        }

        let dataset_select = (<Select showSearch style={{ width: 130 }} placeholder="选择数据集" onChange={this.onDatasetChange}>
                             {this.state.dataset_options}
                         </Select>)
        if(this.state.dataset_id !== '') {
            dataset_select = (<Select showSearch style={{ width: 130 }} defaultValue={this.state.dataset_id} onChange={this.onDatasetChange}>
                             {this.state.dataset_options}
                         </Select>)
        }
        let fields_msg = null
        if(this.state.dataset_columns) {
            fields_msg = <Table columns={this.columns} dataSource={this.state.dataset_columns} pagination={null} scroll={{y: 150}}  style={{"overflow":"scroll", "width": "300px"}}/>
        }
        return(
            <div>
                <Collapse defaultActiveKey={['1']} accordion expandIconPosition={'right'} style={{'margin-bottom': '45px'}}>
                    <Panel header="字段属性" key="1">
                        <div>班级</div>
                        {clazz_select}
                        <div>实验项目</div>
                        {experimental_item_select}
                        <div>数据集</div>
                        {dataset_select}
                        <div>字段信息</div>
                        <Button type="primary" size={'small'} icon={<SyncOutlined />} onClick={this.handleFieldRefresh}/>
                        {fields_msg}
                    </Panel>
                </Collapse>
                 <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        输入源：读取表数据组件。当输入表名后，会自动读取表的结构数据，在字段信息中可查看当数据源是来来源于数据库时，表字段修改后，如增加或删除某个字段，在平台是无法感知的，需要用户重新设置一下数据源，数据同步一下这个表信息.
                    </div>
                    </Panel>
                 </Collapse>
            </div>
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