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

class ReportUpload extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            clazz_id: '',
            experimental_item_id: '',
            experimental_task_id: '',
            clazz_options: [],
            experimental_item_options: [],
            experimental_task_options: []
        }
    }

    getData = () => {
        $.ajax({
            url: `/api/clazz`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if(this.state.clazz_options.length || this.state.experimental_item_options.length || this.state.experimental_task_options.length) {
                    this.setState({clazz_options: [], experimental_item_options: [], experimental_task_options: []})
                }
                let data = jsonData.data.detail.map(ele => {
                    return <Option value={ele.clazz_id}>{ele.clazz_name}</Option>
                })
                this.setState({clazz_options: data})
            }
        })
    }

    componentWillMount() {
        this.getData()
    }

    onClazzChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel();
        values.clazz_id = val
        update(item, {...values})
        this.setState({clazz_id: val})
        $.ajax({
            url: `/api/experimental-item?clazz_id=${val}`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if(this.state.experimental_item_options.length || this.state.experimental_task_options.length) {
                    this.setState({experimental_item_options: [], experimental_task_options: []})
                }
                let data = jsonData.data.detail.map(ele => {
                    return <Option value={ele.experimental_item_id}>{ele.experimental_item_name}</Option>
                })
                this.setState({experimental_item_options: data})
            }
        })
    }

    onExperimentalItemChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel();
        values.experimental_item_id = val
        update(item, {...values})
        this.setState({experimental_item_id: val})
        $.ajax({
            url: `/api/experimental-task?experimental_item_id=${val}`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if(this.state.experimental_task_options.length) {
                    this.setState({experimental_task_options: []})
                }
                let data = jsonData.data.detail.filter(ele => {
                    return ele.status === '正在进行'
                })
                data = data.map(ele => {
                    return <Option value={ele.experimental_task_id}>{ele.experimental_task_name}</Option>
                })
                this.setState({experimental_task_options: data})
            }
        })
    }

    onExperimentalTaskChange = val => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel();
        values.experimental_task_id = val
        update(item, {...values})
        this.setState({experimental_task_id: val})
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

        let experimental_task_select = (<Select showSearch style={{ width: 130 }} placeholder="选择实验任务" onChange={this.onExperimentalTaskChange}>
                             {this.state.experimental_task_options}
                         </Select>)
        if(this.state.experimental_task_id !== '') {
            experimental_task_select = (<Select showSearch style={{ width: 130 }} defaultValue={this.state.experimental_task_id} onChange={this.onExperimentalTaskChange}>
                             {this.state.experimental_task_options}
                         </Select>)
        }

        return(
            <div>
                <Collapse defaultActiveKey={['1']} accordion expandIconPosition={'right'} style={{'margin-bottom': '45px'}}>
                    <Panel header="基础参数" key="1">
                        <div>班级</div>
                        {clazz_select}
                        <div>实验项目</div>
                        {experimental_item_select}
                        <div>实验任务</div>
                        {experimental_task_select}
                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        实验结果提交
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(ReportUpload);