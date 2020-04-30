import React from 'react'
import 'antd/dist/antd.css';
import '../static/css/ant.css';
import {Item, ItemPanel} from "gg-editor";
import {Button, Tree, Card} from 'antd';
import 'antd/dist/antd.css';
import styles from '../static/css/ggeditor.scss';
import {
    PlusCircleOutlined,
    FrownFilled,
    FrownOutlined,
    DownOutlined
} from '@ant-design/icons';
import FlowPage from "./editor/flow";


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
    }

    render() {
        return (
            <div style={{width: 150, background: "rgba(0,0,0,0)", paddingTop: 130}}>
                <div style={{background: "#1890ff", width: 150, borderRadius: 18}}>
                    <span style={{marginLeft: 28, fontWeight: "bold", color: "#ffffff", textAlign: "center"}}>组件</span>
                    <span style={{marginLeft: '32%'}}><Button type="primary" shape="circle"
                                                              icon={< PlusCircleOutlined/>}/></span>
                </div>
                <ItemPanel className={styles["item-panel"]}>
                    <Card>
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
                    </Card>
                </ItemPanel>
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



