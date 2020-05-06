import React from 'react'
import 'antd/dist/antd.css';
import '../static/css/ant.css';
import $ from 'jquery'
import {Item, ItemPanel} from "gg-editor";
import {Button, Tree, Card, Form, Input, message, Modal, Divider,Select} from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import 'antd/dist/antd.css';
import styles from '../static/css/ggeditor.scss';
import {
    PlusCircleOutlined,
    FrownFilled,
    FrownOutlined,
    DownOutlined
} from '@ant-design/icons';
import {UnControlled as CodeMirror} from 'react-codemirror2'
import 'codemirror/theme/monokai.css'
import 'codemirror/lib/codemirror.css'
import 'codemirror/mode/python/python'
import 'codemirror/addon/scroll/simplescrollbars.css'
import 'codemirror/addon/scroll/simplescrollbars'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/anyword-hint'
import 'codemirror/addon/hint/css-hint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/fold/markdown-fold'
import 'codemirror/mode/meta'
import "codemirror/addon/fold/foldgutter.css"
import "codemirror/addon/fold/foldcode"
import "codemirror/addon/fold/brace-fold"
import 'codemirror/addon/selection/active-line'
import FlowPage from "./editor/flow";
import association_rule from '../static/component_templates/association_rule.py';
import classification from '../static/component_templates/classification.py';
import regression from '../static/component_templates/regression.py';

const { Option } = Select;

export default class ProjectParent extends React.Component {
    render() {
        return (
            <div className="gg-editor-background">
                <FlowPage/>
            </div>
        )
    }

}

export class Project extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        $("#header_title").text('工程')
        return (
            <div style={{width: 150, background: "rgba(0,0,0,0)"}}>
                <div style={{background: "#1890ff", width: 150, borderRadius: 18}}>
                    <span style={{marginLeft: 28, fontWeight: "bold", color: "#ffffff", textAlign: "center"}}>工程</span>
                    <span style={{marginLeft: '32%'}}><Button type="primary" shape="circle"
                                                              icon={< PlusCircleOutlined/>}/></span>
                </div>
                <Tree
                    style={{background: "rgba(0,0,0,0.048)", maxHeight: 200, width: 150, paddingTop: 8}}
                    defaultSelectedKeys={['0-0-0']}
                    switcherIcon={< DownOutlined/>}
                    treeData={treeData}
                />
            </div>
        );
    }
}

export class Component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            components: []
        }
        this.new_component_modal_visible = false
    }

    getData = () => {
        $.ajax({
            url: '/api/component',
            type: 'GET',
            dataType: 'json',
            async: false,
            success: jsonData => {
                let components = jsonData.data.detail
                if(this.state.components.length) {
                    this.setState({components: []})
                }
                this.setState({components: components})
            }
        })
    }

    componentWillMount() {
        this.getData()
    }

    getModalMsg = (result, msg) => {
        this.new_component_modal_visible = false
        this.getData()
    }

    handleNewComponent = () => {
        this.new_component_modal_visible = true
        this.refs.newComponentModal.setInfo({
            visible: this.new_component_modal_visible,
        })
    }

    render() {
        let components_elements = this.state.components.map(ele => {
            return (<Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color: '#1890ff',
                                label: ele.component_name,
                                task_name: ele.component_name,
                                class_name: ele.component_type_id,
                                status: '',
                                description: ele.description,
                                params: "{}"
                            }}
                            label={ele.component_name}
                            children={<div>{ele.component_name}</div>}
                        />)
        })
        return (<div>
            <NewComponentModel visiable={this.new_component_modal_visible}
                                             ref={"newComponentModal"} parent={this}/>
            <div style={{width: 150, background: "rgba(0,0,0,0)", paddingTop: 130}}>
                <div style={{background: "#1890ff", width: 150, borderRadius: 18}}>
                    <span style={{marginLeft: 28, fontWeight: "bold", color: "#ffffff", textAlign: "center"}}>组件</span>
                    <span style={{marginLeft: '32%'}}><Button type="primary" shape="circle"
                                                              icon={< PlusCircleOutlined/>} onClick={this.handleNewComponent}/></span>
                </div>
                <ItemPanel className={styles["item-panel"]}>
                    <Card style={{height: '260px', "overflow": "scroll"}}>
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'输入源',
                                task_name: 'Input Source',
                                status: '',
                                clazz_id: '',
                                experimental_item_id: '',
                                dataset: '',
                            }}
                            label={'输入源'}
                            children={<div>输入源</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'输出源',
                                task_name: 'Output Source',
                                status: ''
                            }}
                            label={'输出源'}
                            children={<div>输出源</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'记录去重',
                                task_name: 'Duplicate Removal',
                                status: '',
                                selected_columns: []
                            }}
                            label={'记录去重'}
                            children={<div>记录去重</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'CART分类树',
                                task_name: 'CART Classifier',
                                status: '',
                                selected_columns: [],
                                target_column: '',
                                criterion: 'gini',
                                splitter: 'best',
                                max_depth: 'None',
                                min_samples_split: 2,
                                min_samples_leaf: 1,
                                min_weight_fraction_leaf: 0,
                                max_features: "None",
                                random_state: "None",
                                max_leaf_nodes: "None",
                                min_impurity_decrease: 0,
                                min_impurity_split: 'None',
                                class_weight: 'None',
                                presort: false
                            }}
                            label={'CART分类树'}
                            children={<div>CART分类树</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'支持向量机',
                                task_name: 'SVM Classifier',
                                status: '',
                                selected_columns: [],
                                target_column: '',
                                C: 1.0,
                                kernel: 'rbf',
                                degree: 3,
                                gamma: 'scale',
                                coef0: 0.0,
                                probability: false,
                                shrinking: true,
                                tol: 0.001,
                                cache_size: 200,
                                class_weight: 'None',
                                max_iter: -1,
                                random_state: 'None'
                            }}
                            label={'支持向量机'}
                            children={<div>支持向量机</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'最近邻分类',
                                task_name: 'KNN Classifier',
                                status: '',
                                selected_columns: [],
                                target_column: '',
                                n_neighbors: 5,
                                weights: 'uniform',
                                algorithm: 'auto',
                                leaf_size: 30
                            }}
                            label={'最近邻分类'}
                            children={<div>最近邻分类</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'朴素贝叶斯',
                                task_name: 'NB Classifier',
                                status: '',
                                selected_columns: [],
                                target_column: '',
                                method: 'Gaussian'
                            }}
                            label={'朴素贝叶斯'}
                            children={<div>朴素贝叶斯</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'逻辑回归',
                                task_name: 'LR Classifier',
                                status: '',
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
                                l1_ratio: 'None'
                            }}
                            label={'逻辑回归'}
                            children={<div>逻辑回归</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'CART回归树',
                                task_name: 'CART Regressor',
                                status: '',
                                selected_columns: [],
                                target_column: '',
                                criterion: 'mse',
                                splitter: 'best',
                                max_depth: 'None',
                                min_samples_split: 2,
                                min_samples_leaf: 1,
                                min_weight_fraction_leaf: 0,
                                max_features: "None",
                                random_state: "None",
                                max_leaf_nodes: "None",
                                min_impurity_decrease: 0,
                                min_impurity_split: 0.0000001,
                                ccp_alpha: 0.0
                            }}
                            label={'CART回归树'}
                            children={<div>CART回归树</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'支持向量回归',
                                task_name: 'SVM Regressor',
                                status: '',
                                selected_columns: [],
                                target_column: '',
                                C: 1.0,
                                kernel: 'rbf',
                                degree: 3,
                                gamma: 'scale',
                                coef0: 0.0,
                                epsilon: 0.1,
                                shrinking: true,
                                tol: 0.001,
                                cache_size: 200,
                                max_iter: -1
                            }}
                            label={'支持向量回归'}
                            children={<div>支持向量回归</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'Apriori',
                                task_name: 'Apriori',
                                status: '',
                                min_support: 0.5,
                                min_confidence: 0.5,
                                max_length: 8
                            }}
                            label={'Apriori'}
                            children={<div>Apriori</div>}
                        />
                        <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'实验提交',
                                task_name: 'Report Upload',
                                status: '',
                                clazz_id: '',
                                experimental_item_id: '',
                                experimental_task_id: ''
                            }}
                            label={'实验提交'}
                            children={<div>实验提交</div>}
                        />
                        <Divider style={{"margin-top": '4px', "margin-bottom": '4px'}}/>
                        {components_elements}
                    </Card>
                </ItemPanel>
            </div></div>
        );
    }
}

class NewComponentModel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: props.visible,
            python_code: ''
        };
        this.component_types = []
        this.python_code = ''
    }

    getData = () => {
        $.ajax({
            url: '/api/component_type',
            type: 'GET',
            dataType: 'json',
            async: false,
            success: jsonData => {
                this.component_types = jsonData.data.detail.map(ele => {
                    return (<Option value={ele.component_type_id}>{ele.component_type_name}</Option>)
                })
            }
        })
    }

    componentWillMount() {
        this.getData()
    }

    setInfo = val => {
        this.setState({visible: val.visible, loading: false})
    }


    hideModal = () => {
        this.setState({visible: false, loading: false});
        this.refs.form.resetFields();
    }

    setParentMsg = () => {
        this.props.parent.getModalMsg(this, true)
    }


    handleCreateComponent = values => {
        this.setState({loading: true});
        $.ajax({
            type: 'POST',
            url: '/api/component/create',
            async: false,
            data: {
                'component_name': values.name,
                'description': values.description,
                'content': this.python_code,
                'component_type_id': values.component_type_id
            },
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData.msg);
                } else {
                    this.setParentMsg();
                    message.success('自定义组件添加成功')
                }
                this.refs.form.resetFields()
                this.python_code = ""
                this.setState({loading: false, visible: false});
            }
        });
        this.getData()
    }

    handleOnSelectChange = val => {
        let url = null
        switch (val) {
            case 1:
                url = association_rule
                break
            case 2:
                url = classification
                break
            case 3:
                url = regression
                break
        }
        let content = $.ajax({url:url,async:false})
        content = content.responseText
        this.setState({python_code: content})
        this.python_code = content
    }

    render() {
        return (
            <div>
                <Modal
                    width="600px"
                    height="400px"
                    visible={this.state.visible}
                    title="添加自定义组件"
                    onOk={this.handleCreateComponent}
                    onCancel={this.hideModal}
                    footer={null}>
                    <Form
                        name="new-component"
                        ref="form"
                        className="new-component-form"
                        onFinish={this.handleCreateComponent}>
                        <Form.Item
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the Component Name!',
                                },
                            ]}>
                            <Input placeholder="Component Name"/>
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
                            name="component_type_id"
                            rules={[
                                {
                                    required: true
                                }
                            ]}>
                            <Select
                                style={{width: '100%'}}
                                placeholder="Algorithm Component Type"
                                onChange={this.handleOnSelectChange}>
                                {this.component_types}
                            </Select>
                        </Form.Item>
                        <CodeMirror
                          value={this.state.python_code}
                          options={{
                            theme:'monokai',
                            mode: 'python',
                            styleActiveLine: true,
                            tabSize: 4,
                            smartIndent: true,
                            scrollbarStyle:"overlay",
                            extraKeys: {"Alt": "autocomplete"},
                            lineNumbers: true
                          }}
                          onChange={(editor, data, value) => {
                              this.python_code = value
                          }}
                        />
                        <br/>
                        <Form.Item style={{"textAlign": "center"}}>
                            <Button key="submit" type="primary" htmlType="submit" loading={this.state.loading}>
                                添加
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

const treeData = [
    {
        title: '我的工程',
        key: '0-0',
        children: [
            {
                title: 'test1',
                key: '0-0-0',
            },
            {
                title: 'test2',
                key: '0-0-1',
                icon: ({selected}) => (selected ? <FrownFilled/> : <FrownOutlined/>),
            },
        ],
    },
];



