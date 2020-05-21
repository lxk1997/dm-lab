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

class LRClassifier extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            dataset_columns: [],
            selected_columns: [],
            target_column: '',
            penalty: 'l2',
            dual: false,
            tol: 0.0001,
            fit_intercept: true,
            intercept_scaling: 1,
            class_weight: 'None',
            solver: 'lbfgs',
            C: 1.0,
            multi_class: 'auto',
            max_iter: 100,
            l1_ratio: 'None',
            table_loading: false,
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

    onPenaltyChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.penalty = val
        update(item, {...values})
        this.setState({penalty: val})
    }

    onSolverChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.solver = val
        update(item, {...values})
        this.setState({solver: val})
    }

    onDualChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.dual = val
        update(item, {...values})
        this.setState({dual: val})
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

    onFitInterceptChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.fit_intercept = val
        update(item, {...values})
        this.setState({fit_intercept: val})
    }

    onInterceptScalingChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.intercept_scaling = val
        update(item, {...values})
        this.setState({intercept_scaling: val})
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

    onMultiClassChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.multi_class = val
        update(item, {...values})
        this.setState({multi_class: val})
    }

    onL1RatioChange = e => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.l1_ratio = e.target.value
        update(item, {...values})
        this.setState({l1_ratio: e.target.value})
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
                        <div>正则化选择参数</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.penalty} onChange={this.onPenaltyChange}>
                            <Option value={"l1"}>{"L1"}</Option>
                            <Option value={"l2"}>{"L2"}</Option>
                            <Option value={"elasticnet"}>{"Elasticnet"}</Option>
                            <Option value={"none"}>{"None"}</Option>
                        </Select>
                        <div>损失函数优化方法</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.solver} onChange={this.onSolverChange}>
                            <Option value={"newton-cg"}>{"newton-cg"}</Option>
                            <Option value={"lbfgs"}>{"lbfgs"}</Option>
                            <Option value={"liblinear"}>{"liblinear"}</Option>
                            <Option value={"sag"}>{"sag"}</Option>
                            <Option value={"saga"}>{"saga"}</Option>
                        </Select>
                    </Panel>
                    <Panel header="高级参数" key="3">
                        <div>对偶转化</div>
                        <Switch checkedChildren="是" unCheckedChildren="否" defaultChecked={this.state.dual} onChange={this.onDualChange}/>
                        <div>残差收敛条件值</div>
                        <InputNumber min={0} step={0.0001} defaultValue={this.state.tol} onChange={this.onTolChange} />
                        <div>正则化系数</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.C} onChange={this.onCChange} />
                        <div>决策模型添加截距/方差</div>
                        <Switch checkedChildren="是" unCheckedChildren="否" defaultChecked={this.state.fit_intercept} onChange={this.onFitInterceptChange}/>
                        <div>实例矢量常数值</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.intercept_scaling} onChange={this.onInterceptScalingChange} />
                        <div>类别权重</div>
                        <Input defaultValue={this.state.class_weight} onChange={this.onClassWeightChange}/>
                        <div>最大迭代次数</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.max_iter} onChange={this.onMaxIterChange} />
                        <div>分类方法参数</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.multi_class} onChange={this.onMultiClassChange}>
                            <Option value={"auto"}>{"自动选择"}</Option>
                            <Option value={"ovr"}>{"ovr"}</Option>
                            <Option value={"multinomial"}>{"multinomial"}</Option>
                        </Select>
                       <div>弹性网络的混合比例</div>
                       <Input defaultValue={this.state.l1_ratio} onChange={this.onL1RatioChange}/>
                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        逻辑回归是广义线性模型的一种。广义线性模型是一般线性模型的推广，即因变量均值的函数与解释变量是线性关系，即 g(E(Y))=βX+ε。其中g 被称为连接函数。连接函数为 Logit 函数的广义线性模型就被称为逻辑回归。逻辑回归方程用解释变量预测事件发生的概率，所以可以用来处理分类问题。
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(LRClassifier);



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