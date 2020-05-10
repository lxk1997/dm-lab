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

class KMeansCluster extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            dataset_columns: [],
            selected_columns: [],
            n_clusters: 8,
            init: 'k-means++',
            n_init: 10,
            max_iter: 300,
            tol: 0.0001,
            precompute_distances: 'auto',
            random_state: 'None',
            algorithm: 'auto'
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

    onNClusterChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.n_clusters = val
        update(item, {...values})
        this.setState({n_clusters: val})
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

    onNInitChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.n_init = val
        update(item, {...values})
        this.setState({n_init: val})
    }

    onInitChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.init = val
        update(item, {...values})
        this.setState({init: val})
    }

    onPrecomputeDistancesChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.precompute_distances = val
        update(item, {...values})
        this.setState({precompute_distances: val})
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
        if(this.state.dataset_columns) {
            fields_msg = <Table rowSelection={rowSelection} columns={this.columns} dataSource={this.state.dataset_columns} pagination={null} scroll={{y: 150}}  style={{"overflow":"scroll", "width": "300px"}}/>

        }
        return(
            <div>
                <Collapse defaultActiveKey={['1']} accordion expandIconPosition={'right'} style={{'margin-bottom': '45px'}}>
                    <Panel header="字段属性" key="1">
                        <div>特征</div>
                        <Button type="primary" size={'small'} icon={<SyncOutlined />} onClick={this.handleFieldRefresh}/>
                        {fields_msg}
                    </Panel>
                    <Panel header="基础参数" key="2">
                        <div>聚类数</div>
                        <InputNumber min={1} step={1} defaultValue={this.state.n_clusters} onChange={this.onNClusterChange} />
                        <div>最大迭代次数</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.max_iter} onChange={this.onMaxIterChange} />
                    </Panel>
                    <Panel header="高级参数" key="3">
                        <div>算法算法次数</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.n_init} onChange={this.onNInitChange} />
                         <div>初始化方法</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.init} onChange={this.onInitChange}>
                            <Option value={"k-means++"}>{"k-means++"}</Option>
                            <Option value={"random"}>{"随机"}</Option>
                        </Select>
                         <div>预计算距离</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.precompute_distances} onChange={this.onPrecomputeDistancesChange}>
                            <Option value={'auto'}>{"Auto"}</Option>
                            <Option value={true}>{"True"}</Option>
                            <Option value={false}>{"False"}</Option>
                        </Select>
                        <div>收敛阈值</div>
                        <InputNumber min={0} step={0.0001} defaultValue={this.state.tol} onChange={this.onTolChange} />
                        <div>实现算法</div>
                        <Select style={{ width: 130 }} defaultValue={this.state.algorithm} onChange={this.onAlgorithmChange}>
                            <Option value={'auto'}>{"Auto"}</Option>
                            <Option value={'full'}>{"Full"}</Option>
                            <Option value={'elkan'}>{"Elkan"}</Option>
                        </Select>
                        <div>随机种子</div>
                        <Input defaultValue={this.state.random_state} onChange={this.onRandomStateChange} />
                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        K-Means是Mac Queen提出的一种非监督实时聚类算法，在最小化误差函数的基础上将数据划分为预定的类数K。
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(KMeansCluster);



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