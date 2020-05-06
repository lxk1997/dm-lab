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

class SVMClassifier extends React.Component{
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
            probability: false,
            shrinking: true,
            tol: 0.001,
            cache_size: 200,
            class_weight: 'None',
            max_iter: -1,
            random_state: 'None'
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

    onProbabilityChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.probability = val
        update(item, {...values})
        this.setState({probability: val})
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

    onClassWeightChange = e => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.class_weight = e.target.value
        update(item, {...values})
        this.setState({class_weight: e.target.value})
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
                        <div>概率估计</div>
                        <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.probability} onChange={this.onProbabilityChange}/>
                        <div>启发式收缩</div>
                        <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.shrinking} onChange={this.onShrinkingChange}/>
                        <div>停止训练的误差值大小</div>
                        <InputNumber min={0} step={0.001} defaultValue={this.state.tol} onChange={this.onTolChange} />
                        <div>核函数缓存大小</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.cache_size} onChange={this.onCacheSizeChange} />
                        <div>类别权重</div>
                        <Input defaultValue={this.state.class_weight} onChange={this.onClassWeightChange}/>
                        <div>最大迭代次数</div>
                        <InputNumber min={-1} step={1} defaultValue={this.state.max_iter} onChange={this.onMaxIterChange} />
                        <div>随机种子</div>
                        <Input defaultValue={this.state.random_state} onChange={this.onRandomStateChange}/>
                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        SVM（支持向量机）方法是通过一个非线性映射，把样本空间映射到一个高维乃至无穷维的特征空间中使得在原来的样本空间中非线性可分的问题转化为在特征空间中的线性可分的问题。
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(SVMClassifier);



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