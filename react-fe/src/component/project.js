import React from 'react'
import 'antd/dist/antd.css';
import '../static/css/ant.css';
import {Item, ItemPanel} from "gg-editor";
import {Button, Tree, Card} from 'antd';
import 'antd/dist/antd.css';
import styles from '../component/editor/editor_item_panel/index.scss';
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
            <FlowPage/>
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



