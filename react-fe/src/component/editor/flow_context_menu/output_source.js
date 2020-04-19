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

class OutputSourceContextMenu extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            rename_modal_visible: false,
            log_modal_visible: false,
            data_modal_visible: false
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
        values.color = "#1890ff"
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
        $.ajax({
            type: 'POST',
            url: '/api/component',
            async: false,
            dataType: 'json',
            data: {
                item_id: values.id,
                task_name: values.task_name,
                params: JSON.stringify({parent_id: parent_id})
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
        $.ajax({
            type: 'GET',
            url: `/api/component/${values.task_name}/${values.id}/data`,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error('当前组件运行数据不存在')
                } else {
                    let data = JSON.parse(jsonData.data.detail[0].data)
                    this.refs.dataModal.setInfo({visible: true, data: data});
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
            // case "3":
            //     this.handleGlobalRun();
            //     break;
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
                this.handleDisplayLog();
                break
            // case "9":
            //     this.handleDownloadData();
            //     break
        }
    }

    render(){
        return (
            <div>
                <RenameModal visiable={this.state.rename_modal_visible} ref={"renameModal"} parent={this}/>
                <LogModal visiable={this.state.log_modal_visible} ref={"logModal"} parent={this}/>
                <DataModal visiable={this.state.data_modal_visible} ref={"dataModal"} parent={this}/>
                <ContextMenu className={styles.contextMenu}>
                    <NodeMenu>
                        <Menu onClick={this.handleMenuClick}>
                            <Menu.Item key="1">
                              重命名
                            </Menu.Item>
                            <Menu.Item key="2">
                              删除
                            </Menu.Item>
                            <Menu.Divider/>
                            <Menu.Item key="3">
                              全部运行
                            </Menu.Item>
                            <Menu.Item key="4">
                              运行到此处
                            </Menu.Item>
                            <Menu.Item key="5">
                              运行该节点
                            </Menu.Item>
                            <Menu.Item key="6">
                              从此节点运行
                            </Menu.Item>
                            <Menu.Divider/>
                            <Menu.Item key="7">
                              查看数据
                            </Menu.Item>
                            <Menu.Item key="8">
                              查看日志
                            </Menu.Item>
                            <Menu.Item key="9">
                              数据下载
                            </Menu.Item>
                          </Menu>
                    </NodeMenu>
                </ContextMenu>
            </div>
        )
    }
}

export default withPropsAPI(OutputSourceContextMenu);

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
            data: {
                headers: [],
                content: []
            }
        };
    }

    setInfo = val => {
        this.setState({visible: val.visible, data: val.data})
    }

    hideModal = () => {
        this.setState({visible: false, data: {headers: [], content: []}});
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
                <Table columns={columns} dataSource={data} bordered pagination={pagination}/>
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