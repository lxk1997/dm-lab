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

class Apriori extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            min_support: 0.5,
            min_confidence: 0.5,
            max_length: 8
        }
    }

    onMinSupportChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.min_support = val
        update(item, {...values})
        this.setState({min_support: val})
    }

    onMinConfidenceChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.min_confidence = val
        update(item, {...values})
        this.setState({min_confidence: val})
    }

    onMaxLengthChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.max_length = val
        update(item, {...values})
        this.setState({max_length: val})
    }

    render(){
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        return(
            <div>
                <Collapse defaultActiveKey={['1']} accordion expandIconPosition={'right'} style={{'margin-bottom': '45px'}}>
                    <Panel header="基础参数" key="1">
                        <div>最小支持度</div>
                        <InputNumber min={0} step={0.1} max={1} defaultValue={this.state.min_support} onChange={this.onMinSupportChange} />
                        <div>最小置信度</div>
                        <InputNumber min={0} step={0.1} max={1} defaultValue={this.state.min_confidence} onChange={this.onMinConfidenceChange} />
                        <div>最大频繁项集长度</div>
                        <InputNumber min={0} step={1} defaultValue={this.state.max_length} onChange={this.onMaxLengthChange} />
                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        Apriori算法是一种挖掘关联规则的频繁项集算法，其核心思想是通过候选集生成和情节的向下封闭检测两个阶段来挖掘频繁项集。
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(Apriori);