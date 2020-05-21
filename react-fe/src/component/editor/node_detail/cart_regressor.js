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

class CARTRegressor extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            table_loading: false,
            dataset_columns: [],
            selected_columns: [],
            target_column: '',
            criterion: 'mse',
            splitter: 'best',
            max_depth: 'None',
            min_samples_split: 2,
            min_samples_leaf: 1,
            min_weight_fraction_leaf: 0,
            max_features: "None",
            random_state: "None",
            max_leaf_nodes: "None",
            min_impurity_decrease: 0,
            min_impurity_split: 0.0000001,
            ccp_alpha: 0.0
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
            this.setState({table_loading: true})
            $.ajax({
                type: 'GET',
                url: `/api/component/${tmp_values.task_name}/${tmp_values.id}/data`,
                async: true,
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
                        this.setState({dataset_columns: dataset_columns, table_loading: false})
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

    onCriterionChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.criterion = val
        update(item, {...values})
        this.setState({criterion: val})
    }

    onSplitterChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.splitter = val
        update(item, {...values})
        this.setState({splitter: val})
    }

    onMaxDepthChange = e => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.max_depth = e.target.value
        update(item, {...values})
        this.setState({max_depth: e.target.value})
    }

    onMaxFeaturesChange = e => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.max_features = e.target.value
        update(item, {...values})
        this.setState({max_features: e.target.value})
    }

    onRandomStateChange = e => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.random_state = e.target.value
        update(item, {...values})
        this.setState({random_state: e.target.value})
    }

    onMaxLeafNodesChange = e => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.max_leaf_nodes = e.target.value
        update(item, {...values})
        this.setState({max_leaf_nodes: e.target.value})
    }

    onMinImpuritySplitChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.min_impurity_split = val
        update(item, {...values})
        this.setState({min_impurity_split: val})
    }

    onMinSamplesSplitChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.min_samples_split = val
        update(item, {...values})
        this.setState({min_samples_split: val})
    }

    onMinSamplesLeafChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.min_samples_leaf = val
        update(item, {...values})
        this.setState({min_samples_leaf: val})
    }

    onMinWeightFractionLeafChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.min_weight_fraction_leaf = val
        update(item, {...values})
        this.setState({min_weight_fraction_leaf: val})
    }

    onMinImpurityDecreaseChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.min_impurity_decrease = val
        update(item, {...values})
        this.setState({min_impurity_decrease: val})
    }

    onCcpAlphaChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.ccp_alpha = val
        update(item, {...values})
        this.setState({ccp_alpha: val})
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
            fields_msg = <Table loading={this.state.table_loading} rowSelection={rowSelection} columns={this.columns} dataSource={this.state.dataset_columns} pagination={null} scroll={{y: 150}}  style={{"overflow":"scroll", "width": "300px"}}/>
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
                        <div>切分评价准则</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.criterion} onChange={this.onCriterionChange}>
                            <Option value={"mse"}>{"均方差"}</Option>
                            <Option value={"friedman_mse"}>{"改进分数均方差"}</Option>
                            <Option value={"mae"}>{"平均绝对误差"}</Option>

                        </Select>
                        <div>切分原则</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.splitter} onChange={this.onSplitterChange}>
                            <Option value={"best"}>{"最优切分"}</Option>
                            <Option value={"random"}>{"随机切分"}</Option>
                        </Select>
                    </Panel>
                    <Panel header="高级参数" key="3">
                        <div>最大深度</div>
                        <Input defaultValue={this.state.max_depth} onChange={this.onMaxDepthChange}/>
                        <div>最小分裂样本数</div>
                        <InputNumber min={0} step={0.1} defaultValue={this.state.min_samples_split} onChange={this.onMinSamplesSplitChange} />
                        <div>叶节点最少样本数</div>
                        <InputNumber min={0} step={0.1} defaultValue={this.state.min_samples_leaf} onChange={this.onMinSamplesLeafChange} />
                        <div>叶节点样本数最小权重</div>
                        <InputNumber min={0} step={0.1} max={1} defaultValue={this.state.min_weight_fraction_leaf} onChange={this.onMinWeightFractionLeafChange} />
                        <div>参与分裂特征数</div>
                        <Input defaultValue={this.state.max_features} onChange={this.onMaxFeaturesChange}/>
                        <div>随机模式参数</div>
                        <Input defaultValue={this.state.random_state} onChange={this.onRandomStateChange}/>
                        <div>最大叶节点数</div>
                        <Input defaultValue={this.state.max_leaf_nodes} onChange={this.onMaxLeafNodesChange}/>
                        <div>最小不纯度值减少量</div>
                        <InputNumber min={0} step={0.1} defaultValue={this.state.min_impurity_decrease} onChange={this.onMinImpurityDecreaseChange} />
                        <div>最小不纯度值</div>
                        <InputNumber min={0} step={0.1} defaultValue={this.state.min_impurity_split} onChange={this.onMinImpuritySplitChange}/>
                        <div>最小剪枝系数</div>
                        <InputNumber min={0} step={0.1} defaultValue={this.state.ccp_alpha} onChange={this.onCcpAlphaChange}/>

                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        使用Cart决策树算法的回归树。
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(CARTRegressor);



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