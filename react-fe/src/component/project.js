import React from 'react'
import 'antd/dist/antd.css';
import '../static/css/ant.css';
import $ from 'jquery'
import {withPropsAPI} from 'gg-editor';
import {Item, ItemPanel} from "gg-editor";
import {Button, Tree, Card, Form, Input, message, Modal, Divider, Select} from 'antd';
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

const {Option} = Select;
const {Search} = Input;

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
        this.state = {
            projects: [],
        }
        this.project = null;
        this.new_project_modal_visible = false
    }

    getModalMsg = val => {
        this.getData()
    }

    onProjectSelect = (selectedKeys, info) => {
        this.project = selectedKeys.length ? selectedKeys[0] : null
        if (this.project === -1) {
            this.project = null
        }
        $('#project_id').text(this.project)
    }

    getData = () => {
        $.ajax({
            url: '/api/project',
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                let data = jsonData.data.detail
                let projects = treeProjectFilter(data)
                if (this.state.projects.length) {
                    this.setState({projects: []})
                }
                this.setState({projects: projects})
            }
        })
    }

    componentWillMount() {
        this.getData()
    }

    handleCreateProject = () => {
        this.refs.newProjectModal.setInfo({visible: true})
    }

    render() {
        $("#header_title").text('工程')
        return (
            <div>
                <NewProjectModal ref={'newProjectModal'} visible={this.new_project_modal_visible} parent={this}/>
                <div style={{width: 150, background: "rgba(0,0,0,0)"}}>
                    <div style={{background: "#1890ff", width: 150, borderRadius: 18}}>
                        <span style={{
                            marginLeft: 28,
                            fontWeight: "bold",
                            color: "#ffffff",
                            textAlign: "center"
                        }}>工程</span>
                        <span style={{marginLeft: '32%'}}><Button type="primary" shape="circle"
                                                                  icon={< PlusCircleOutlined/>}
                                                                  onClick={this.handleCreateProject}/></span>
                    </div>
                    <Tree
                        style={{
                            background: "#EFF3F5",
                            width: 150,
                            paddingTop: 8,
                            height: '180px',
                            "overflow": "scroll"
                        }}
                        switcherIcon={< DownOutlined/>}
                        onSelect={this.onProjectSelect}
                        treeData={this.state.projects}
                    />
                </div>
            </div>
        );
    }
}

class NewProjectModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: false,
            clazz_options: [],
            experimental_item_options: [],
            experimental_task_options: [],
        };
        this.clazz_id = null
        this.experimental_item_id = null
        this.experimenatl_task = null
    }

    getData = () => {
        $.ajax({
            url: `/api/clazz`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if (this.state.clazz_options.length || this.state.experimental_item_options.length || this.state.experimental_task_options.length) {
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

    setInfo = val => {
        this.setState({visible: val.visible})
    }

    onClazzChange = val => {
        this.clazz_id = val
        $.ajax({
            url: `/api/experimental-item?clazz_id=${val}`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if (this.state.experimental_item_options.length || this.state.experimental_task_options.length) {
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
        this.experimental_item_id = val
        $.ajax({
            url: `/api/experimental-task?experimental_item_id=${val}`,
            async: false,
            type: 'GET',
            dataType: 'json',
            success: jsonData => {
                if (this.state.experimental_task_options.length) {
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

    hideModal = () => {
        this.setState({visible: false, loading: false});
        this.refs.form.resetFields();
    }

    setParentMsg = () => {
        this.props.parent.getModalMsg(this, true)
    }

    handleCreateProject = values => {
        this.setState({loading: true});
        $.ajax({
            type: 'POST',
            url: '/api/project/create',
            async: false,
            data: {
                'experimental_item_id': values.experimental_item_id,
                'name': values.name,
                'experimental_task_id': values.experimental_task_id,
                'clazz_id': values.clazz_id
            },
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData.msg);
                } else {
                    this.setParentMsg();
                    message.success('工程创建成功')
                }
                this.refs.form.resetFields()
                this.setState({loading: false, visible: false, score_field: false});
            }
        });
    }

    render() {
        let clazz_select = (<Select showSearch style={{width: 300}} placeholder="选择所在班级" onChange={this.onClazzChange}>
            {this.state.clazz_options}
        </Select>)

        let experimental_item_select = (
            <Select showSearch style={{width: 300}} placeholder="选择实验项目" onChange={this.onExperimentalItemChange}>
                {this.state.experimental_item_options}
            </Select>)

        let experimental_task_select = (<Select showSearch style={{width: 300}} placeholder="选择实验任务">
            {this.state.experimental_task_options}
        </Select>)

        return (
            <div>
                <Modal
                    width={'347px'}
                    visible={this.state.visible}
                    title="创建工程"
                    onOk={this.handleCreateProject}
                    onCancel={this.hideModal}
                    footer={null}>
                    <Form
                        name="new-project"
                        ref="form"
                        className="new-project-form"
                        onFinish={this.handleCreateProject}>
                        <Form.Item
                            name="name"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the Project Name!',
                                },
                            ]}>
                            <Input placeholder="Project Name" style={{'width': 300}}/>
                        </Form.Item>
                        <Form.Item
                            name="clazz_id"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select the class!',
                                },
                            ]}>
                            {clazz_select}
                        </Form.Item>
                        <Form.Item
                            name="experimental_item_id"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select the Experimental Item!',
                                },
                            ]}>
                            {experimental_item_select}
                        </Form.Item>
                        <Form.Item
                            name="experimental_task_id"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please select the Experimental Task!',
                                },
                            ]}>
                            {experimental_task_select}
                        </Form.Item>
                        <Form.Item style={{"textAlign": "center"}}>
                            <Button key="submit" type="primary" htmlType="submit" loading={this.state.loading}>
                                创建
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}


export class Component extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            components: [],
            expandedKeys: [],
            searchValue: '',
            autoExpandParent: false,
        }
        this.new_component_modal_visible = false
        this.data_list = []
    }

    getData = () => {
        $.ajax({
            url: '/api/component',
            type: 'GET',
            dataType: 'json',
            async: false,
            success: jsonData => {
                let components = jsonData.data.detail
                if (this.state.components.length) {
                    this.setState({components: []})
                }
                this.setState({components: components})
            }
        })
    }

    componentWillMount() {
        this.getData()
    }

    generateList = data => {
        this.data_list = []
        for (let i = 0; i < data.length; i++) {
            const node = data[i];
            const {key} = node;
            this.data_list.push({key, title: key});
            if (node.children) {
                this.generateList(node.children);
            }
        }
    };

    onChange = e => {
        let components_elements = this.state.components.map(ele => {
            return ({ title: <Item
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
            />, key: ele.component_name})
        })
        const {value} = e.target;
        console.log(this.data_list)
        const expandedKeys = this.data_list
            .map(item => {
                if (item.title.indexOf(value) > -1) {
                    return this.getParentKey(item.key, generateComponent(components_elements));
                }
                return null;
            })
            .filter((item, i, self) => item && self.indexOf(item) === i);
        this.setState({
            expandedKeys,
            searchValue: value,
            autoExpandParent: true,
        });
    };

    onExpand = expandedKeys => {
        this.setState({
            expandedKeys,
            autoExpandParent: false,
        });
    };

    getParentKey = (key, tree) => {
        let parentKey;
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some(item => item.key === key)) {
                    parentKey = node.key;
                } else if (this.getParentKey(key, node.children)) {
                    parentKey = this.getParentKey(key, node.children);
                }
            }
        }
        return parentKey;
    };

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
            return ({ title: <Item
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
            />, key: ele.component_name})
        })
        this.generateList(generateComponent(components_elements));
        const {searchValue, expandedKeys, autoExpandParent} = this.state;

        return (<div>
                <NewComponentModel visiable={this.new_component_modal_visible}
                                   ref={"newComponentModal"} parent={this}/>
                <div style={{width: 150, background: "rgba(0,0,0,0)", paddingTop: 30}}>
                    <div style={{background: "#1890ff", width: 150, borderRadius: 18}}>
                        <span style={{
                            marginLeft: 28,
                            fontWeight: "bold",
                            color: "#ffffff",
                            textAlign: "center"
                        }}>组件</span>
                        <span style={{marginLeft: '32%'}}><Button type="primary" shape="circle"
                                                                  icon={< PlusCircleOutlined/>}
                                                                  onClick={this.handleNewComponent}/></span>
                    </div>
                    <ItemPanel className={styles["item-panel"]} style={{background: "#EFF3F5"}}>
                        <Tree
                            height={220}
                            draggable={true}
                            style={{background: "#EFF3F5", paddingTop: 8}}
                            onExpand={this.onExpand}
                            expandedKeys={expandedKeys}
                            autoExpandParent={autoExpandParent}
                            treeData={generateComponent(components_elements)}
                        />
                    </ItemPanel>
                </div>
            </div>
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
        let content = $.ajax({url: url, async: false})
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
                                theme: 'monokai',
                                mode: 'python',
                                styleActiveLine: true,
                                tabSize: 4,
                                smartIndent: true,
                                scrollbarStyle: "overlay",
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

function treeProjectFilter(data) {
    let children = []
    for (let idx = 0; idx < data.length; idx++) {
        children.push({title: data[idx].project_name, key: data[idx].project_id})
    }
    let rsts = [{
        title: '我的工程',
        key: '-1',
        children: children,
    }]
    return rsts
}

function generateComponent(div_components) {
    let rsts = [
        {
            title: '系统组件',
            key: '系统组件',
            children: [
            {
                title: '输入/输出',
                key: '输入/输出',
                children: [
                    {
                        title: <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color: '#1890ff',
                                label: '输入源',
                                task_name: 'Input Source',
                                status: '',
                                clazz_id: '',
                                experimental_item_id: '',
                                dataset: '',
                            }}
                            label={'输入源'}
                            children={<div>输入源</div>}
                        />,
                        key: '输入源'
                    },
                    {
                        title: <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color: '#1890ff',
                                label: '输出源',
                                task_name: 'Output Source',
                                status: ''
                            }}
                            label={'输出源'}
                            children={<div>输出源</div>}
                        />,
                        key: '输出源'
                    },
                ]
            },
            {
                title: '数据预处理',
                key: '数据预处理',
                children: [
                    {
                        title: <Item
                                type={'node'}
                                size={'80*28'}
                                shape={'flow-rect'}
                                model={{
                                    color:'#1890ff',
                                    label:'特征构造',
                                    task_name: 'Feature Structure',
                                    status: '',
                                    selected_columns: [],
                                    new_feature: 'new',
                                    expression: ''
                                }}
                                label={'特征构造'}
                                children={<div>特征构造</div>}
                            />,
                        key: '特征构造'
                    },
                    {
                        title: <Item
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
                            />,
                        key: '记录去重'
                    },
                    {
                        title: <Item
                                type={'node'}
                                size={'80*28'}
                                shape={'flow-rect'}
                                model={{
                                    color:'#1890ff',
                                    label:'缺失值处理',
                                    task_name: 'Missing Values Handle',
                                    status: '',
                                    selected_columns: [],
                                    solve_method: 'drop'
                                }}
                                label={'缺失值处理'}
                                children={<div>缺失值处理</div>}
                            />,
                        key: '缺失值处理'
                    }
                ]
            },
            {
                title: '统计分析',
                key: '统计分析',
            },
            {
                title: '分类',
                key: '分类',
                children: [
                    {
                        title: <Item
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
                            />,
                        key: 'CART分类树'
                    },
                    {
                        title: <Item
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
                            />,
                        key: '支持向量机'
                    },
                    {
                        title: <Item
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
                            />,
                        key: '最近邻分类'
                    },
                    {
                        title: <Item
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
                            />,
                        key: '朴素贝叶斯'
                    },
                    {
                        title: <Item
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
                            />,
                        key: '逻辑回归'
                    }
                ]
            },
            {
                title: '回归',
                key: '回归',
                children: [
                    {
                        title: <Item
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
                            />,
                        key: 'CART回归树'
                    },
                    {
                        title: <Item
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
                            />,
                        key: '支持向量回归'
                    },
                    {
                        title: <Item
                                type={'node'}
                                size={'80*28'}
                                shape={'flow-rect'}
                                model={{
                                    color:'#1890ff',
                                    label:'最近邻回归',
                                    task_name: 'KNN Regressor',
                                    status: '',
                                    selected_columns: [],
                                    target_column: '',
                                    n_neighbors: 5,
                                    weights: 'uniform',
                                    p: 2,
                                    algorithm: 'auto',
                                    leaf_size: 30,
                                    metric: 'minkowski'
                                }}
                                label={'最近邻回归'}
                                children={<div>最近邻回归</div>}
                            />,
                        key: '最近邻回归'
                    },
                    {
                        title: <Item
                                type={'node'}
                                size={'80*28'}
                                shape={'flow-rect'}
                                model={{
                                    color:'#1890ff',
                                    label:'LASSO回归',
                                    task_name: 'LASSO Regressor',
                                    status: '',
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
                                }}
                                label={'LASSO回归'}
                                children={<div>LASSO回归</div>}
                            />,
                        key: 'LASSO回归'
                    },
                    {
                        title: <Item
                                type={'node'}
                                size={'80*28'}
                                shape={'flow-rect'}
                                model={{
                                    color:'#1890ff',
                                    label:'线性回归',
                                    task_name: 'Linear Regressor',
                                    status: '',
                                    selected_columns: [],
                                    target_column: '',
                                    fit_intercept: true,
                                    normalize: false
                                }}
                                label={'线性回归'}
                                children={<div>线性回归</div>}
                            />,
                        key: '线性回归'
                    }
                ]
            },
            {
                title: '聚类',
                key: '聚类',
                children: [
                    {
                        title:  <Item
                                type={'node'}
                                size={'80*28'}
                                shape={'flow-rect'}
                                model={{
                                    color:'#1890ff',
                                    label:'K-Means',
                                    task_name: 'K-Means',
                                    status: '',
                                    selected_columns: [],
                                    n_clusters: 8,
                                    init: 'k-means++',
                                    n_init: 10,
                                    max_iter: 300,
                                    tol: 0.0001,
                                    precompute_distances: 'auto',
                                    random_state: 'None',
                                    algorithm: 'auto'
                                }}
                                label={'K-Means'}
                                children={<div>K-Means</div>}
                            />,
                        key: 'K-Means'
                    },
                    {
                        title: <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'DBSCAN密...',
                                task_name: 'DBSCAN',
                                status: '',
                                selected_columns: [],
                                eps: 0.5,
                                min_samples: 5,
                                algorithm: 'auto',
                                leaf_size: '30'
                            }}
                            label={'DBSCAN密度聚类'}
                            children={<div>DBSCAN密度聚类</div>}
                        />,
                        key: 'DBSCAN密度聚类'
                    },
                    {
                        title: <Item
                            type={'node'}
                            size={'80*28'}
                            shape={'flow-rect'}
                            model={{
                                color:'#1890ff',
                                label:'层次聚类',
                                task_name: 'Hierarchical',
                                status: '',
                                selected_columns: [],
                                n_clusters: 2,
                                affinity: 'euclidean',
                                linkage: 'average'
                            }}
                            label={'层次聚类'}
                            children={<div>层次聚类</div>}
                        />,
                        key: '层次聚类'
                    }
                ]
            },
            {
                title: '关联规则',
                key: '关联规则',
                children: [
                    {
                        title: <Item
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
                            />,
                        key: 'Apriori'
                    },
                    {
                        title: <Item
                                type={'node'}
                                size={'80*28'}
                                shape={'flow-rect'}
                                model={{
                                    color:'#1890ff',
                                    label:'FP-Growth',
                                    task_name: 'FP-Growth',
                                    status: '',
                                    min_support: 0.5,
                                    min_confidence: 0.5,
                                    max_length: 8
                                }}
                                label={'FP-Growth'}
                                children={<div>FP-Growth</div>}
                            />,
                        key: 'FP-Growth'
                    }
                ]
            },
            {
                title: '时序模型',
                key: '时序模型',
            },
            {
                title: '提交',
                key: '提交',
                children: [
                    {
                        title:  <Item
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
                            />,
                        key: '实验提交'
                    }
                ]
            },
        ]},
        {
            title: '自定义组件',
            key: '自定义组件',
            children: div_components
        }
    ]

    return rsts
}



