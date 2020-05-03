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

class SVMRegressor extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            dataset_columns: [],
            selected_columns: [],
            target_column: '',
            C: 1.0,
            kernel: 'rbf',
            degree: 3,
            gamma: 'scale',
            coef0: 0.0,
            epsilon: 0.1,
            shrinking: true,
            tol: 0.001,
            cache_size: 200,
            max_iter: -1
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

    onCChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.C = val
        update(item, {...values})
        this.setState({C: val})
    }

    onKernelChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.kernel = val
        update(item, {...values})
        this.setState({kernel: val})
    }

    onDegreeChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.degree = val
        update(item, {...values})
        this.setState({degree: val})
    }

    onGammaChange = e => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.gamma = e.target.value
        update(item, {...values})
        this.setState({gamma: e.target.value})
    }

    onCoef0Change = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.coef0 = val
        update(item, {...values})
        this.setState({coef0: val})
    }

    onEpsilonChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.epsilon = val
        update(item, {...values})
        this.setState({epsilon: val})
    }

    onShrinkingChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.shrinking = val
        update(item, {...values})
        this.setState({shrinking: val})
    }

    onTolChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.tol = val
        update(item, {...values})
        this.setState({tol: val})
    }

    onCacheSizeChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.tol = val
        update(item, {...values})
        this.setState({tol: val})
    }

    onMaxIterChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.max_iter = val
        update(item, {...values})
        this.setState({max_iter: val})
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
                        <div>惩罚系数</div>
                        <InputNumber min={0} step={0.1} defaultValue={this.state.C} onChange={this.onCChange} />
                        <div>核函数</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.kernel} onChange={this.onKernelChange}>
                            <Option value={"linear"}>{"线性核"}</Option>
                            <Option value={"poly"}>{"多项式核"}</Option>
                            <Option value={"rbf"}>{"高斯核"}</Option>
                            <Option value={"sigmoid"}>{"sigmoid"}</Option>
                        </Select>
                    </Panel>
                    <Panel header="高级参数" key="3">
                        <div>多项式核函数次数</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.degree} onChange={this.onDegreeChange} />
                        <div>核函数系数</div>
                        <Input defaultValue={this.state.gamma} onChange={this.onGammaChange}/>
                        <div>核函数常数项</div>
                        <InputNumber min={0} step={0.1} defaultValue={this.state.coef0} onChange={this.onCoef0Change} />
                        <div>距离误差</div>
                        <InputNumber min={0} step={0.1} defaultValue={this.state.epsilon} onChange={this.onEpsilonChange} />
                        <div>启发式收缩</div>
                        <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.shrinking} onChange={this.onShrinkingChange}/>
                        <div>停止训练的误差值大小</div>
                        <InputNumber min={0} step={0.001} defaultValue={this.state.tol} onChange={this.onTolChange} />
                        <div>核函数缓存大小</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.cache_size} onChange={this.onCacheSizeChange} />
                        <div>最大迭代次数</div>
                        <InputNumber min={-1} step={1} defaultValue={this.state.max_iter} onChange={this.onMaxIterChange} />
                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '100%'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        SVR（支持向量回归）是使用支持向量机解决回归问题。支持向量回归假设我们能容忍的f(x)与之间最多有ε的偏差，当且仅当f(x)与y的差别绝对值大于ε时，才计算损失，此时相当于以f(x)为中心，构建一个宽度为2ε的间隔带，若训练样本落入此间隔带，则认为是被预测正确的。
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(SVMRegressor);



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