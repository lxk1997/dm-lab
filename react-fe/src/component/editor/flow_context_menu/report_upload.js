import React from 'react';
import {
    Command,
    NodeMenu,
    CanvasMenu,
    ContextMenu
}from 'gg-editor';
import $ from 'jquery'
import TextArea from 'antd/lib/input/TextArea';
import {InboxOutlined} from '@ant-design/icons';
import {Menu, Button, Descriptions, Form, Input, message, Modal, notification, PageHeader, Popconfirm, Table, Upload} from 'antd';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import styles from './index.scss';
import iconfont from '../theme/iconfont.scss';

class ReportUploadContextMenu extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            upload_modal_visible: false,
            log_modal_visible: false
        }
    }

    handleRemove = () => {
        const {propsAPI}=this.props;
        const {getSelected,remove}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        remove(item);
    }

    handleUpload = () => {
        const {propsAPI} = this.props;
        const {getSelected, update, save, find} = propsAPI;
        const item = getSelected()[0];
        if (!item) return;
        let values = item.getModel();
        values.color = "#1890ff"
        values.status = false
        update(item, {...values})
        let mp = save();
        let edges = mp.edges;
        if (edges === null) {
            edges = []
        }
        let parent_id = null;
        for (var idx = 0; idx < edges.length; idx++) {
            if (edges[idx].target === values.id) {
                parent_id = edges[idx].source;
                break;
            }
        }
        let parent_task_name = null
        if (parent_id) {
            let par_item = find(parent_id)
            let par_values = par_item.getModel()
            parent_task_name = par_values.task_name;
        }
        this.refs.uploadModal.setInfo({visible: true, parent_id: parent_id, parent_task_name: parent_task_name, clazz_id: values.clazz_id === '' ? null : values.clazz_id, experimental_item_id: values.experimental_item_id === '' ? null : values.experimental_item_id, experimental_task_id: values.experimental_task_id === '' ? null : values.experimental_task_id, item_id: values.id, task_name: values.task_name});
    }

    update = val => {
        const {propsAPI} = this.props;
        const {getSelected, update} = propsAPI;
        const item = getSelected()[0];
        if (!item) return;
        let values = item.getModel();
        if(val) {
            values.color = "#00EE00"
            values.status = true
        } else {
            values.color = "#EE0000"
            values.status = false
        }
        update(item, {...values})
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
            case "1":
                 this.handleRemove();
                 break;
            case "2":
                this.handleUpload();
                 break;
            case '3':
                this.handleDisplayLog()
        }
    }

    render(){
        return (
            <div>
                <UploadReport visiable={this.state.upload_modal_visible} ref={"uploadModal"} parent={this}/>
                <LogModal visiable={this.state.log_modal_visible} ref={"logModal"} parent={this}/>
                <ContextMenu className={styles.contextMenu} style={{'box-shadow': 'darkgrey 0px 0px 3px 1px', 'text-align': 'center'}}>
                    <NodeMenu>
                        <Menu onClick={this.handleMenuClick} style={{'text-align': 'center'}}>
                            <Menu.Item key="1" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              删除
                            </Menu.Item>
                            <Menu.Divider/>
                            <Menu.Item key="2" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              提交实验结果
                            </Menu.Item>
                            <Menu.Divider/>
                            <Menu.Item key="3" style={{'margin':'0 auto', 'height':'26px', 'line-height': 'normal'}}>
                              查看日志
                            </Menu.Item>
                          </Menu>
                    </NodeMenu>
                </ContextMenu>
            </div>
        )
    }
}

export default withPropsAPI(ReportUploadContextMenu);


class UploadReport extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: props.visible,
            parent_id: null,
            parent_task_name: null,
            clazz_id: null,
            experimental_item_id: null,
            experimental_task_id: null,
            item_id: null,
            task_name: null
        };
    }

    setInfo = val => {
        this.setState({visible: val.visible, parent_id: val.parent_id, parent_task_name: val.parent_task_name, clazz_id: val.clazz_id, experimental_item_id: val.experimental_item_id, experimental_task_id: val.experimental_task_id, item_id: val.item_id, task_name: val.task_name})
    }


    hideModal = () => {
        this.setState({visible: false, loading: false});
        this.refs.form.resetFields();

    }

    handleUploadReport = vals => {
        this.setState({loading: true});
        if(this.dataset_file_path === null || this.dataset_file_path === '') {
            message.error('数据集上传失败,请重新上传数据集');
            this.setState({loading: false});
        } else {
            $.ajax({
                type: 'POST',
                url: '/api/component',
                async: false,
                dataType: 'json',
                data: {
                    item_id: this.state.item_id,
                    task_name: this.state.task_name,
                    params: JSON.stringify({
                        parent_id: this.state.parent_id,
                        parent_task_name: this.state.parent_task_name,
                        clazz_id: this.state.clazz_id,
                        experimental_item_id: this.state.experimental_item_id,
                        experimental_task_id: this.state.experimental_task_id,
                        content: vals.content,
                        file_key: this.dataset_file_path
                    })
                },
                success: (jsonData) => {
                    if (jsonData.error) {
                        this.props.parent.update(false)
                    } else {
                        this.props.parent.update(true)
                        message.success('实验结果提交成功')
                    }
                    this.refs.form.resetFields()
                    this.setState({loading: false, visible: false});
                }
            })
        }
        this.dataset_file_path = null;
    }

    render() {
        const props = {
          name: 'file',
          multiple: false,
          action: '/api/uploader',
          onChange: (info) => {
            let status = info.file.hasOwnProperty('response') && info.file.response.hasOwnProperty('status') ?info.file.response.status: ""
            if (status === 'done') {
              message.success(`${info.file.name} file uploaded successfully.`);
              this.dataset_file_path = info.file.response.name
            } else if (status === 'error'){
              message.error(`${info.file.name} file upload failed.`);
            }
          },
        };
        return (
            <Modal
                width="600px"
                height="400px"
                visible={this.state.visible}
                title="提交实验报告"
                onCancel={this.hideModal}
                footer={null}>
                <Form
                    name="upload-report"
                    ref="form"
                    className="upload-report-form"
                    onFinish={this.handleUploadReport}>
                    <Form.Item
                        name="content"
                        rules={[
                            {
                                required: false,
                            },
                        ]}>
                        <TextArea placeholder="Content"/>
                    </Form.Item>
                    <Form.Item
                            name="file"
                            rules={[
                                {
                                    required: false
                                }
                            ]}>
                            <div style={{"height":"70px"}}>
                                <Upload.Dragger {...props}>
                                    <p style={{"color": "blue"}}>
                                        <InboxOutlined/>
                                    </p>
                                    <p>Click or drag file to this area to upload</p>
                                </Upload.Dragger>
                            </div>
                        </Form.Item>
                    <Form.Item style={{"textAlign": "center"}}>
                        <Button key="submit" type="primary" htmlType="submit" loading={this.state.loading}>
                            提交
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