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

class LASSORegressor extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            dataset_columns: [],
            selected_columns: [],
            target_column: '',
            alpha: 1.0,
            fit_intercept: true,
            max_iter: 500,
            normalize: false,
            precompute: false,
            tol: 0.001,
            warm_start: false,
            positive: false,
            selection: 'cyclic',
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

    onAlphaChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.alpha = val
        update(item, {...values})
        this.setState({alpha: val})
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

    onNormalizeChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.normalize = val
        update(item, {...values})
        this.setState({normalize: val})
    }

    onPrecomputeChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.precompute = val
        update(item, {...values})
        this.setState({precompute: val})
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

    onWarmStartChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.warm_start = val
        update(item, {...values})
        this.setState({warm_start: val})
    }

    onPositiveChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.positive = val
        update(item, {...values})
        this.setState({positive: val})
    }


    onSelectionChange = e => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.selection = e.target.value
        update(item, {...values})
        this.setState({selection: e.target.value})
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
                        <div>L1项系数</div>
                        <InputNumber min={0} step={0.1} defaultValue={this.state.alpha} onChange={this.onAlphaChange} />
                        <div>拟合截距</div>
                        <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.fit_intercept} onChange={this.onFitInterceptChange}/>
                        <div>最大迭代次数</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.max_iter} onChange={this.onMaxIterChange} />
                    </Panel>
                    <Panel header="高级参数" key="3">
                        <div>归一化</div>
                        <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.normalize} onChange={this.onNormalizeChange}/>
                        <div>预计算</div>
                        <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.precompute} onChange={this.onPrecomputeChange}/>
                        <div>容错率</div>
                        <InputNumber min={0} step={0.001} defaultValue={this.state.tol} onChange={this.onTolChange} />
                        <div>热启动</div>
                        <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.warm_start} onChange={this.onWarmStartChange}/>
                        <div>强制正相关</div>
                        <Switch checkedChildren="开" unCheckedChildren="关" defaultChecked={this.state.positive} onChange={this.onPositiveChange}/>
                        <div>选择器</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.selection} onChange={this.onSelectionChange}>
                            <Option value={"cyclic"}>{"循环"}</Option>
                            <Option value={"random"}>{"随机"}</Option>
                        </Select>
                        <div>随机种子</div>
                        <Input defaultValue={this.state.random_state} onChange={this.onRandomStateChange}/>
                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        Lasso(Least absolute shrinkage and selection operator)方法是以缩小变量集（降阶）为思想的压缩估计方法。它通过构造一个惩罚函数，可以将变量的系数进行压缩并使某些回归系数变为0，进而达到变量选择的目的。
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(LASSORegressor);



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