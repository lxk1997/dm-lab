import React from 'react';
import {Collapse, Form, Select, Table, Button, message, Modal, Input, Upload} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import 'rc-color-picker/assets/index.css';
import TextArea from 'antd/lib/input/TextArea';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import $ from 'jquery'
import {checkFetchStatus} from "../../../page/utils";
import {SearchOutlined, InboxOutlined, StarOutlined} from '@ant-design/icons';

const {Item}=Form;
const { Panel } = Collapse;
const { Option } = Select;

class InputSource extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            datasets: [],
            dataset_columns: [],
            dataset_id: '',
            dataset_options: [],
            project: null
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

    getFirstData(){
        let project_id = $('#project_id').text()
        if(project_id !== '') {
            project_id = Number.parseInt(project_id)
        }
        $.ajax({
            url: `/api/dataset?project_id=${project_id}&user_only=${-1}`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if(this.state.dataset_options.length) {
                    this.setState({dataset_options: []})
                }
                let data = jsonData.data.detail.map(ele => {
                    return <Option value={ele.dataset_id}>{ele.dataset_name}</Option>
                })
                this.setState({dataset_options: data})
            }
        })
        $.ajax({
            url: `/api/project/${project_id}`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if(this.state.project) {
                    this.setState({project: null})
                }
                this.setState({project: jsonData.data})
            }
        })
    }

    getModalMsg = (result, msg) => {
        this.getFirstData()
    }

    componentWillMount(){
        this.getFirstData()
    }

    onDatasetChange = val => {
        const {propsAPI}=this.props;
        const {getSelected,update}=propsAPI;
        const item=getSelected()[0];
        if(!item) return;
        let values = item.getModel()
        values.dataset = val;
        this.setState({dataset_id: val});
        update(item,{
            ...values
        });
    }

    handleFieldRefresh = () => {
        if(this.state.dataset_id === "") {
            message.error('请先选择要使用的数据表')
        } else {
            $.ajax({
                type: 'GET',
                url: `/api/dataset/info?dataset_id=${this.state.dataset_id}`,
                async: false,
                dataType: 'json',
                success: (jsonData) => {
                    if (jsonData.error) {
                        message.error(jsonData.error)
                    } else {
                        if(this.state.dataset_columns.length) {
                            this.setState({dataset_columns: []})
                        }
                        let data = jsonData.data.detail
                        let dataset_columns = datasetColumnTableFilter(data)
                        this.setState({dataset_columns: dataset_columns})

                    }
                }
            })
        }
    }

    handleNewDataset = () => {
        this.refs.newDatasetModal.setInfo({
            visible: true,
            experimental_item_id: this.state.project.experimental_item_id
        })
    }

    render(){
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        let dataset_select = (<Select showSearch style={{ width: 130 }} placeholder="选择数据集" onChange={this.onDatasetChange}>
                             {this.state.dataset_options}
                         </Select>)
        if(this.state.dataset_id !== '') {
            dataset_select = (<Select showSearch style={{ width: 130 }} defaultValue={this.state.dataset_id} onChange={this.onDatasetChange}>
                             {this.state.dataset_options}
                         </Select>)
        }
        let fields_msg = null
        if(this.state.dataset_columns) {
            fields_msg = <Table columns={this.columns} dataSource={this.state.dataset_columns} pagination={null} scroll={{y: 150}}  style={{"overflow":"scroll", "width": "300px"}}/>
        }
        return(
            <div>
                <Collapse defaultActiveKey={['1']} accordion expandIconPosition={'right'} style={{'margin-bottom': '45px'}}>
                    <NewDatasetModal parent={this} ref={'newDatasetModal'}/>
                    <Panel header="字段属性" key="1">
                        <div><span>数据集</span> <Button type="primary" size={'small'} onClick={this.handleNewDataset}>+</Button></div>
                        {dataset_select}
                        <div>字段信息</div>
                        <Button type="primary" size={'small'} icon={<SyncOutlined />} onClick={this.handleFieldRefresh}/>
                        {fields_msg}
                    </Panel>
                </Collapse>
                 <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        输入源：读取表数据组件。当输入表名后，会自动读取表的结构数据，在字段信息中可查看当数据源是来来源于数据库时，表字段修改后，如增加或删除某个字段，在平台是无法感知的，需要用户重新设置一下数据源，数据同步一下这个表信息.
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(InputSource);

class NewDatasetModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: false,
        };
        this.experimental_item_id = null
    }


    hideModal = () => {
        this.setState({visible: false, loading: false});
        this.refs.form.resetFields();

    }

    setInfo = (val) => {
        this.experimental_item_id = val.experimental_item_id
        this.setState({visible: val.visible})
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


function datasetColumnTableFilter(data) {
    let columns = data.headers
    let rsts = [];
    for(var i=0; i< columns.length; i++) {
        let rst = {}
        rst.field = columns[i];
        rst.type = '字符'
        rst.range = ''
        rsts.push(rst)
    }
    return rsts
}