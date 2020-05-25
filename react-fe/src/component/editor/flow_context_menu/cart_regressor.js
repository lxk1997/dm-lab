import React from 'react';
import {
    Command,
    NodeMenu,
    CanvasMenu,
    ContextMenu
}from 'gg-editor';
import $ from 'jquery'
import {Menu, Button, Descriptions, Form, Input, message, Modal, notification, PageHeader, Popconfirm, Table} from 'antd';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import styles from './index.scss';
import iconfont from '../theme/iconfont.scss';
import CARTRegressor from "../node_detail/cart_regressor";

class CARTRegressorContextMenu extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            rename_modal_visible: false,
            log_modal_visible: false,
            data_modal_visible: false,
            report_modal_visible: false
        }
    }

    handleRename = () => {
        this.refs.renameModal.setInfo({visible: true})
    }

    rename = val => {
        const {propsAPI}=this.props;
        const {getSelected,update}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        let values = item.getModel();
        values.label = val;
        update(item,{
            ...values
        });
        this.refs.renameModal.setInfo({visible: false})
    }

    handleRemove = () => {
        const {propsAPI}=this.props;
        const {getSelected,remove}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        remove(item);
    }

    handleRunThis = () => {
        const {propsAPI}=this.props;
        const {getSelected,update, save}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        let values = item.getModel();
        values.color = "#FAFF37"
        values.status = false
        update(item, {...values})
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
        let project_id = $('#project_id').text()
        if(project_id !== '') {
            project_id = Number.parseInt(project_id)
        } else {
            project_id = null
        }
        $.ajax({
            type: 'POST',
            url: '/api/component',
            async: false,
            dataType: 'json',
            data: {
                item_id: values.id,
                task_name: values.task_name,
                params: JSON.stringify({
                    parent_id: parent_id,
                    project_id: project_id,
                    selected_columns: values.selected_columns,
                    target_column: values.target_column === '' ? null: values.target_column,
                    criterion: values.criterion,
                    splitter: values.splitter,
                    max_depth: values.max_depth === 'None' ? null: values.max_depth,
                    min_samples_split: values.min_samples_split,
                    min_samples_leaf: values.min_samples_leaf,
                    min_weight_fraction_leaf: values.min_weight_fraction_leaf,
                    max_features: values.max_features === 'None' ? null : values.max_features,
                    random_state: values.random_state === 'None' ? null : values.random_state,
                    max_leaf_nodes: values.max_leaf_nodes === 'None' ? null : values.max_leaf_nodes,
                    min_impurity_decrease: values.min_impurity_decrease,
                    min_impurity_split: values.min_impurity_split,
                    ccp_alpha: values.ccp_alpha
                })
            },
            success: (jsonData) => {
                if (jsonData.error) {
                    values.color = "#EE0000"
                    values.status = false
                    update(item, {...values})
                } else {
                    let test2 = setInterval(function(){
                        $.ajax({
                            url: `/api/component/status/${jsonData.data}`,
                            type: 'GET',
                            async: false,
                            dataType: 'json',
                            success: jsonData => {
                                if(jsonData.data.status === 'fail') {
                                    values.color = "#EE0000"
                                    values.status = false
                                    update(item, {...values})
                                    clearInterval(test2)
                                } else if (jsonData.data.status === 'success') {
                                    values.color = "#00EE00"
                                    values.status = true
                                    update(item, {...values})
                                    clearInterval(test2)
                                }
                            }
                        })
                    },2000)
                }
            }
        })
    }

    handleGlobalRun = () => {
        const {propsAPI}=this.props;
        const {getSelected,update, save, find}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        let values = item.getModel();
        let mp = save();
        let edges = mp.edges;
        let nodes = mp.nodes;
        if(edges === null) {
            edges = []
        }
        if(nodes === null) {
            nodes = []
        }
        let idx = 0;
        let arr_nodes = []
        for(idx = 0; idx < nodes.length; idx++) {
            let tmp_item = find(nodes[idx].id)
            arr_nodes.push(nodes[idx].id)
            let tmp_values = tmp_item.getModel();
            tmp_values.color = "#1890ff"
            tmp_values.status = false
            update(tmp_item, {...tmp_values})
        }
        //top_sort
        let in_degree = {};
        let out_degree = {};
        let one_way = {};
        let anti_way = {};
        for(idx = 0; idx < edges.length; idx++) {
            let source = edges[idx].source;
            let target = edges[idx].target;
            if(out_degree.hasOwnProperty(source)) {
                out_degree[source] += 1
            } else {
                out_degree[source] = 1
            }
            if(in_degree.hasOwnProperty(target)) {
                in_degree[target] += 1
            } else {
                in_degree[target] = 1
            }
            anti_way[target] = source
            one_way[source] = target
        }
        while(arr_nodes.length) {
            for(idx = 0; idx < arr_nodes.length; idx++) {
                let tmp_node = arr_nodes[idx];
                if(!in_degree.hasOwnProperty(tmp_node) || in_degree[tmp_node] === 0) {
                    let tmp_item = find(tmp_node)
                    let tmp_values = tmp_item.getModel()
                    if(anti_way.hasOwnProperty(tmp_values.id)) {
                        let par_item = find(anti_way[tmp_values.id])
                        let par_values = par_item.getModel();
                        if(par_values.status !== true) {
                            arr_nodes.splice(idx, 1)
                            in_degree[one_way[tmp_values.id]] -= 1
                            continue;
                        }
                    }
                    let params = {}
                    switch(tmp_values.task_name) {
                        case "Input Source":
                            params = {dataset_name: tmp_values.dataset !== '' ? tmp_values.dataset: null};
                            break;
                        case "Output Source":
                            params = {parent_id: anti_way.hasOwnProperty(tmp_values.id) ? anti_way[tmp_values.id]: null};
                            break;
                        case "Duplicate Removal":
                            params = {parent_id: anti_way.hasOwnProperty(tmp_values.id) ? anti_way[tmp_values.id]: null, selected_columns: tmp_values.selected_columns};
                            break;
                    }
                    $.ajax({
                        type: 'POST',
                        url: '/api/component',
                        async: false,
                        dataType: 'json',
                        data: {
                            item_id: tmp_values.id,
                            task_name: tmp_values.task_name,
                            params: JSON.stringify(params)
                        },
                        success: (jsonData) => {
                            if (jsonData.error) {
                                tmp_values.color = "#EE0000"
                                tmp_values.status = false
                                update(tmp_item, {...tmp_values})
                            } else {
                                tmp_values.color = "#00EE00"
                                tmp_values.status = true
                                update(tmp_item, {...tmp_values})
                            }
                        }
                    })
                    arr_nodes.splice(idx, 1)
                    in_degree[one_way[tmp_values.id]] -= 1
                }
            }
        }
        //end
        $.ajax({
            type: 'POST',
            url: '/api/component',
            async: false,
            dataType: 'json',
            data: {
                item_id: values.id,
                task_name: values.task_name,
                params: JSON.stringify({dataset_name: values.dataset !== '' ? values.dataset: null})
            },
            success: (jsonData) => {
                if (jsonData.error) {
                    values.color = "#EE0000"
                    values.status = false
                    update(item, {...values})
                } else {
                    values.color = "#00EE00"
                    values.status = true
                    update(item, {...values})
                }
            }
        })
    }

    handleDisplayData = () => {
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        let values = item.getModel();
        let api = `/api/component/${values.task_name}/${values.id}/data`
        this.refs.dataModal.setInfo({visible: true, api: api})
    }

    handleDisplayReport = () => {
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        let values = item.getModel();
        $.ajax({
            type: 'GET',
            url: `/api/component/${values.task_name}/${values.id}/report`,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error('当前组件运行数据不存在')
                } else {
                    let data = jsonData.data.detail
                    this.refs.reportModal.setInfo({visible: true, data: data});
                }
            }
        })
    }

    handleDisplayLog = () => {
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        let values = item.getModel();
        $.ajax({
            type: 'GET',
            url: `/api/component/${values.task_name}/${values.id}/log`,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error('当前组件运行日志不存在')
                } else {
                    let data = jsonData.data.detail[0].data
                    this.refs.logModal.setInfo({visible: true, data: data});
                }
            }
        })
    }

    handleMenuClick = obj => {
        switch(obj.key) {
            case '1':
                this.handleRename();
                break;
            case "2":
                 this.handleRemove();
                 break;
             case "3":
                 this.handleGlobalRun();
                 break;
            // case "4":
            //     this.handleRunToThis();
            //     break;
            case "5":
                this.handleRunThis();
                break;
            // case "6":
            //     this.handleRunFromThis();
            //     break;
            case "7":
                this.handleDisplayData();
                break;
            case "8":
                this.handleDisplayReport();
                break;
            case "9":
                this.handleDisplayLog();
                break
        }
    }

    render(){
        return (
            <div>
                <RenameModal visiable={this.state.rename_modal_visible} ref={"renameModal"} parent={this}/>
                <LogModal visiable={this.state.log_modal_visible} ref={"logModal"} parent={this}/>
                <DataModal visiable={this.state.data_modal_visible} ref={"dataModal"} parent={this}/>
                <ReportModal visiable={this.state.report_modal_visible} ref={"reportModal"} parent={this}/>
                <ContextMenu className={styles.contextMenu} style={{'box-shadow': 'darkgrey 0px 0px 3px 1px', 'text-align': 'center'}}>
                    <NodeMenu>
                        <Menu onClick={this.handleMenuClick} style={{'text-align': 'center'}}>
                            <Menu.Item key="1" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              重命名
                            </Menu.Item>
                            <Menu.Item key="2" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              删除
                            </Menu.Item>
                            <Menu.Divider/>
                            <Menu.Item key="3" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              全部运行
                            </Menu.Item>
                            <Menu.Item key="4" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              运行到此处
                            </Menu.Item>
                            <Menu.Item key="5" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              运行该节点
                            </Menu.Item>
                            <Menu.Item key="6" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              从此节点运行
                            </Menu.Item>
                            <Menu.Divider/>
                            <Menu.Item key="7" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              查看数据
                            </Menu.Item>
                            <Menu.Item key="8" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              查看报告
                            </Menu.Item>
                            <Menu.Item key="9" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              查看日志
                            </Menu.Item>
                          </Menu>
                    </NodeMenu>
                </ContextMenu>
            </div>
        )
    }
}

export default withPropsAPI(CARTRegressorContextMenu);

class RenameModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: props.visible,
        };
    }

    setInfo = val => {
        this.setState({visible: val.visible})
    }

    hideModal = () => {
        this.setState({visible: false, loading: false});
        this.refs.form.resetFields();
    }

    handleRename = values => {
        this.setState({loading: true});
        this.props.parent.rename(values.name)
    }

    render() {
        return (
            <Modal
                width="300px"
                visible={this.state.visible}
                title="重命名"
                onOk={this.handleRename}
                onCancel={this.hideModal}
                footer={null}>
                <Form
                    ref="form"
                    name="update-class"
                    className="update-class-form"
                    onFinish={this.handleRename}>
                    <Form.Item
                        name="name"
                        rules={[
                            {
                                required: true,
                                message: 'Please input the Name!',
                            }
                        ]}>
                        <Input placeholder="Name"/>
                    </Form.Item>
                    <Form.Item style={{"textAlign": "center"}}>
                        <Button key="submit" type="primary" htmlType="submit" loading={this.state.loading}>
                            更新
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        );
    }
}

class LogModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
            data: ''
        };
    }

    setInfo = val => {
        this.setState({visible: val.visible, data: val.data})
    }

    hideModal = () => {
        this.setState({visible: false, data: ''});
    }

    render() {
        return (
            <Modal
                width="600px"
                height="400px"
                visible={this.state.visible}
                title="日志"
                onCancel={this.hideModal}
                footer={null}>
                {this.state.data}
            </Modal>
        );
    }
}

class DataModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
            table_loading: false,
            data: {
                headers: [],
                content: []
            }
        };
    }

    setInfo = val => {
        this.setState({visible: val.visible, table_loading: true})
        $.ajax({
            type: 'GET',
            url: val.api,
            async: true,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    this.hideModal()
                    message.error('当前组件运行数据不存在')
                } else {
                    let data = JSON.parse(jsonData.data.detail[0].data)
                    this.setState({data: data, table_loading: false})
                }
            }
        })
    }

    hideModal = () => {
        this.setState({visible: false, table_loading: false, data: {headers: [], content: []}});
    }

    render() {
        const pagination = {
            showQuickJumper: true,
            defaultPageSize: 25
        }

        let columns = columnsFilter(this.state.data.headers)
        let data = dataFilter(this.state.data)
        return (
            <Modal
                width="800px"
                height="500px"
                visible={this.state.visible}
                title="数据"
                onCancel={this.hideModal}
                footer={null}>
                <Table loading={this.state.table_loading} columns={columns} dataSource={data} bordered pagination={pagination}/>
            </Modal>
        );
    }
}

class ReportModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
            data: {}
        };
    }

    setInfo = val => {
        this.setState({visible: val.visible, data: val.data})
    }

    hideModal = () => {
        this.setState({visible: false, data: {}});
    }

    render() {
        let report_elements = reportFilter(this.state.data);
        return (
            <Modal
                width="800px"
                height="500px"
                visible={this.state.visible}
                title="报告"
                onCancel={this.hideModal}
                footer={null}>
                <div style={{'textAlign': 'center'}}>{report_elements}</div>
            </Modal>
        );
    }
}

function columnsFilter(data) {
    let rsts = [];
    for(var idx = 0; idx < data.length; idx++) {
        let rst = {title: data[idx], dataIndex: data[idx]};
        rsts.push(rst);
    }
    return rsts;
}

function dataFilter(data) {
    let rsts = []
    let headers = data.headers;
    for(var idx = 0; idx < data.content.length; idx++) {
        let rst = {key: idx}
        for(var idx1 = 0; idx1 < headers.length; idx1++) {
            rst[headers[idx1]] = data.content[idx][idx1];
        }
        rsts.push(rst);
    }
    return rsts;
}

function reportFilter(data) {
    let rsts = []
    for(var idx = 0; idx < data.length; idx++) {
        let element = null
        if(data[idx].type === 'table') {
            element = tableRender(data[idx])
        } else if(data[idx].type === 'image') {
            element = imageRender(data[idx])
        }
        rsts.push(element)
    }
    return rsts
}

function tableRender(data) {
    let columns = []
    for(let idx = 0; idx < data.data.headers.length; idx++) {
        columns.push({
            title: data.data.headers[idx],
            dataIndex: data.data.headers[idx],
            key: data.data.headers[idx],
            align: 'center'
        })
    }
    let contents = []
    for(let idx = 0; idx < data.data.content.length; idx++) {
        let content = {key: idx}
        for(let idx1 = 0; idx1 < data.data.headers.length; idx1++) {
            content[data.data.headers[idx1]] = data.data.content[idx][idx1]
        }
        contents.push(content)
    }
    return <Table style={{'margin-bottom': '5px'}} bordered size={'small'} title={() => <div style={{'textAlign': 'center'}}>{data.name}</div>}columns={columns} dataSource={contents} pagination={false}/>
}

function imageRender(data) {
    if(data.name === 'Overview') {
        return (<div style={{'text-align': 'center'}}><img src={data.data} width={"500px"}/><br/><span style={{'margin-bottom': '5px'}}>{data.name}</span></div>)
    } else {
        return (<div style={{'text-align': 'center'}}><img src={data.data} width={"680px"}/><br/><span style={{'margin-bottom': '5px'}}>{data.name}</span></div>)
    }
}