import React from 'react'
import {Link, NavLink, Route, Switch, Redirect} from 'react-router-dom'
import 'antd/dist/antd.css';
import $ from 'jquery'
import {
    Descriptions,
    notification,
    PageHeader,
    Button,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Select,
    Table,
    Tabs,
    DatePicker,
    Upload,
    Tag,
    List,
    Card,
    Avatar
} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import Highlighter from 'react-highlight-words';
import {SearchOutlined, InboxOutlined, StarOutlined} from '@ant-design/icons';
import 'react-markdown-editor-lite/lib/index.css';
import {checkFetchStatus} from "../page/utils";
import {getId} from "./utils";

export default class Dataset extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            datasets: []
        };
        this.experimental_item_id = props.experimental_item_id
        this.update_modal_visible = false
        this.update_dataset = null
        this.columns = [
            {
                title: '数据集名称',
                dataIndex: 'dataset_name',
                key: 'dataset_name',
                render: (text, recode) => <a href={"/dataset/" + recode.dataset_id}>{text}</a>,
                sorter: (a, b) => a.dataset_name > b.dataset_name,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '创建时间',
                dataIndex: 'create_time',
                key: 'create_time',
                sorter: (a, b) => a.time > b.time,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record) => {
                    if(record.user_only === 1) {
                        return (<span>
                            <a style={{marginRight: 8}} href={"#"}
                               onClick={() => this.handleUpdateDataset(record)}>修改</a>
                            <Popconfirm title='确认删除该数据集吗?请谨慎选择'
                                        onConfirm={() => this.handleDeleteDataset(record)}>
                                <a style={{"color": 'red'}}>删除</a>
                            </Popconfirm>
                        </span>)
                    } else {
                        return (<span/>)
                    }
                }
            }
        ];
    }

    handleUpdateDataset = recode => {
        this.update_modal_visible = true
        this.update_dataset = recode
        this.refs.updateDatasetModal.setInfo({
            visible: this.update_modal_visible,
            dataset: this.update_dataset
        })
    }

    handleDeleteDataset = recode => {
        $.ajax({
            type: 'DELETE',
            url: '/api/dataset/' + recode.dataset_id,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData.msg)
                } else {
                    message.success('数据集删除成功')
                    this.getData()
                }
            }
        })
    }

    getModalMsg = (result, msg) => {
        this.update_modal_visible = false
        this.update_dataset = null;
        this.getData()
    }


    getData = () => {
        let api = `/api/dataset?experimental_item_id=${this.experimental_item_id}&user_only=${-1}`
        $.ajax({
            url: api,
            type: 'GET',
            dataType: 'json',
            async: false,
            success: jsonData => {
                let data = jsonData.data.detail
                let datasets = datasetTableFilter(data)
                if (this.state.datasets.length > 0) {
                    this.setState({datasets: []})
                }
                this.setState({datasets: datasets})
            }
        })
    }

    componentWillMount = () => {
        this.getData()
    }

    render() {
        $("#header_title").text('')
        let CartText = ({item}) => {
            let id_icon = (<span style={{borderRadius: 4, background: '#81b3ff', marginRight: "12px"}}>
                  <span style={{margin: "4px 0 4px 4px"}}>
                  <span
                      style={{
                          borderTopLeftRadius: 4,
                          borderBottomLeftRadius: 4,
                          color: 'white',
                          marginRight: '3px',
                          fontSize: '13px'
                      }}>
                    ID
                  </span>
                  <span style={{
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                      background: '#E3EEFC',
                      color: '#81b3ff',
                      paddingLeft: '3px',
                      paddingRight: '4px'
                  }}>
                      {item.dataset_id}
                  </span>
                  </span>
            </span>)
            let title = (<div>
                <div><span>{id_icon}</span><a href={"/dataset/" + item.dataset_id} style={{color: 'black', 'margin-right': '20px'}}>{item.dataset_name}</a><span
                    style={{position: "absolute", right: "20px"}}><span><Avatar style={{
                    color: '#ffffff',
                    backgroundColor: '#35caca',
                }} size={20}>{item.user_only===1?item.user_name[0]:item.teacher_name[0]}</Avatar></span><span
                    style={{fontSize: '15px', marginRight: '5px'}}>{item.user_only===1?item.user_name:item.teacher_name}</span><span
                    style={{color: '#C0C0C0', fontSize: '15px'}}>{item.create_time}</span></span></div>
                <div style={{color: '#C0C0C0', marginTop: '5px'}}>{item.description}</div>
            </div>);
            let content = (
                <div>
                    <span/>
                    <span style={{position: "absolute", right: "20px"}}>
                    {
                        item.user_only===1?(<span>
                            <a style={{marginRight: 8}} href={"#"}
                               onClick={() => this.handleUpdateDataset(item)}>修改</a>
                            <Popconfirm title='确认删除该数据集吗?请谨慎选择'
                                        onConfirm={() => this.handleDeleteDataset(item)}>
                                <a style={{"color": 'red'}}>删除</a>
                            </Popconfirm>
                        </span>):<span/>
                    }</span>
                </div>)
            return (<Card title={title}>{content}</Card>)
        };
        let pagination = {
            showQuickJumper: true,
            defaultPageSize: 20
        }
        return (
            <div>
                <NewDatasetModal parent={this} experimental_item_id={this.experimental_item_id}/>
                <UpdateDatasetModal visiable={this.update_modal_visible}
                                             update_dataset={this.update_dataset}
                                             ref={"updateDatasetModal"} parent={this}/>
                <List
                    grid={{gutter: 16, column: 1}}
                    dataSource={this.state.datasets}
                    pagination={pagination}
                    renderItem={item => (
                        <List.Item>
                            <CartText item={item}/>
                        </List.Item>
                    )}
                />
            </div>)
    }
}

class NewDatasetModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: false,
        };
        this.experimental_item_id = props.experimental_item_id
    }

    showModal = () => {
        this.setState({visible: true});
    }

    hideModal = () => {
        this.setState({visible: false, loading: false});
        this.refs.form.resetFields();

    }

    setParentMsg = () => {
        this.props.parent.getModalMsg(this, true)
    }

    handleCreateDataset = values => {
        this.setState({loading: true});
        if(this.dataset_file_path === null || this.dataset_file_path === '') {
            message.error('数据集上传失败,请重新上传数据集');
            this.setState({loading: false});
        } else {
            $.ajax({
            type: 'POST',
            url: '/api/dataset/create',
            async: false,
            data: {
                'experimental_item_id': this.experimental_item_id,
                'dataset_name': values.dataset_name,
                'description': values.description,
                'file': this.dataset_file_path,
                'user_only': 1
            },
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData.msg);
                } else {
                    this.setParentMsg();
                    message.success('数据集创建成功')
                }
                this.refs.form.resetFields()
                this.setState({loading: false, visible: false});
            }
        });
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
            <div>
                <div style={{"textAlign": "right"}}>
                    <Button type="primary" size={"large"} onClick={this.showModal}>
                        ＋&nbsp;&nbsp;新建数据集
                    </Button></div>
                <Modal
                    width="800px"
                    visible={this.state.visible}
                    title="添加数据集"
                    onOk={this.handleCreateDataset}
                    onCancel={this.hideModal}
                    footer={null}>
                    <Form
                        name="new-dataset"
                        ref="form"
                        className="new-dataset-form"
                        onFinish={this.handleCreateDataset}>
                        <Form.Item
                            name="dataset_name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the Dataset Name!',
                                },
                            ]}>
                            <Input placeholder="Dataset Name"/>
                        </Form.Item>
                        <Form.Item
                            name="description"
                            rules={[
                                {
                                    required: false
                                },
                            ]}>
                            <TextArea placeholder="Description"/>
                        </Form.Item>
                        <Form.Item
                            name="file"
                            rules={[
                                {
                                    required: true
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
            </div>
        );
    }
}

class UpdateDatasetModal extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <span/>
    }
}


function datasetTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['dataset_name'] = data[idx].dataset_name
        result['dataset_id'] = data[idx].dataset_id
        result['user_only'] = data[idx].user_only
        result['user_name'] = data[idx].hasOwnProperty('user_name')?data[idx].user_name: ''
        result['teacher_name'] = data[idx].teacher_name
        result['description'] = data[idx].description === '' || data[idx].description === null ? "暂无描述" : data[idx].description
        result['create_time'] = data[idx].create_time
        results.push(result)
    }
    return results
}