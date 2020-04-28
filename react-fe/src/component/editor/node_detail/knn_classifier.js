import React from 'react';
import {Collapse, Form, Select, Table, Button, message, Input, InputNumber,Switch} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import 'rc-color-picker/assets/index.css';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import $ from 'jquery'
import {checkFetchStatus} from "../../../page/utils";

const {Item}=Form;
const { Panel } = Collapse;
const { Option } = Select;

class KNNClassifier extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            dataset_columns: [],
            selected_columns: [],
            target_column: '',
            n_neighbors: 5,
            weights: 'uniform',
            algorithm: 'auto',
            leaf_size: 30
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
        const {getSelected, save, find}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        let mp = save();
        let edges = mp.edges;
        if(edges === null) {
            edges = []
        }
        let parent_id = null;
        for(var idx = 0; idx < edges.length; idx++) {
            if(edges[idx].target === values.id) {
                parent_id = edges[idx].source;
                break;
            }
        }
        if(parent_id === null) {
            message.error('当前组件运行数据不存在')
        } else {
            let tmp_item = find(parent_id)
            let tmp_values = tmp_item.getModel()
            $.ajax({
                type: 'GET',
                url: `/api/component/${tmp_values.task_name}/${tmp_values.id}/data`,
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
    }

    onSelectChange = selectedRowKeys => {
        let selected_columns = []
        for(var idx = 0; idx < selectedRowKeys.length; idx++) {
            selected_columns.push(this.state.dataset_columns[selectedRowKeys[idx]].field)
        }
        this.setState({selected_columns: selected_columns});
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.selected_columns = selected_columns
        update(item, {...values})
    };

    onTargetFieldChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.target_column = val
        update(item, {...values})
        this.setState({target_column: val})
        console.log(val)
    }

    onNNeighborsChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.n_neighbors = val
        update(item, {...values})
        this.setState({n_neighbors: val})
    }

    onAlgorithmChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.algorithm = val
        update(item, {...values})
        this.setState({algorithm: val})
    }

    onWeightsChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.weights = val
        update(item, {...values})
        this.setState({weights: val})
    }

    onLeafSizeChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.leaf_size = val
        update(item, {...values})
        this.setState({leaf_size: val})
    }

    render(){
        const {selected_columns } = this.state;
        const rowSelection = {
          selected_columns,
          onChange: this.onSelectChange,
        };
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        let fields_msg = null
        let target_fields_msg = null
        if(this.state.dataset_columns) {
            let options = this.state.dataset_columns.map(ele => (<Option value={ele.field}>{ele.field}</Option>))
            fields_msg = <Table rowSelection={rowSelection} columns={this.columns} dataSource={this.state.dataset_columns} pagination={null} scroll={{y: 150}}  style={{"overflow":"scroll", "width": "300px"}}/>
            if(this.state.target_column === '') {
                target_fields_msg = <Select showSearch style={{ width: 130 }} placeholder="选择分类字段" onChange={this.onTargetFieldChange}>{options}</Select>
            } else {
                target_fields_msg = <Select showSearch style={{ width: 130 }} defaultValue={this.state.target_column} placeholder="选择分类字段" onChange={this.onTargetFieldChange}>{options}</Select>
            }

        }
        return(
            <div>
                <Collapse defaultActiveKey={['1']} accordion expandIconPosition={'right'} style={{'margin-bottom': '45px'}}>
                    <Panel header="字段属性" key="1">
                        <div>特征</div>
                        <Button type="primary" size={'small'} icon={<SyncOutlined />} onClick={this.handleFieldRefresh}/>
                        {fields_msg}
                        <div>标签</div>
                        <Button type="primary" size={'small'} icon={<SyncOutlined />} onClick={this.handleFieldRefresh}/>
                        {target_fields_msg}
                    </Panel>
                    <Panel header="基础参数" key="2">
                        <div>最近邻数</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.n_neighbors} onChange={this.onNNeighborsChange} />
                    </Panel>
                    <Panel header="高级参数" key="3">
                        <div>算法</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.algorithm} onChange={this.onAlgorithmChange}>
                            <Option value={"auto"}>{"自动"}</Option>
                            <Option value={"ball_tree"}>{"BallTree"}</Option>
                            <Option value={"kd_tree"}>{"KDTree"}</Option>
                            <Option value={"brute"}>{"暴力搜索法"}</Option>
                        </Select>
                        <div>权重类型</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.weights} onChange={this.onWeightsChange}>
                            <Option value={"uniform"}>{"权重相等"}</Option>
                            <Option value={"distance"}>{"权重与距离成反比"}</Option>
                        </Select>
                        <div>叶子大小</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.leaf_size} onChange={this.onLeafSizeChange} />
                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '100%'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        kNN算法的核心思想是如果一个样本在特征空间中的k个最相邻的样本中的大多数属于某一个类别，则该样本也属于这个类别，并具有这个类别上样本的特性。
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(KNNClassifier);



function datasetColumnTableFilter(data) {
    let columns = data.headers
    let rsts = [];
    for(var i=0; i< columns.length; i++) {
        let rst = {}
        rst.key = i;
        rst.field = columns[i];
        rst.type = '字符'
        rst.range = ''
        rsts.push(rst)
    }
    return rsts
}