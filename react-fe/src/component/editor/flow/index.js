import React from 'react';
import GGEditor, {Flow}from 'gg-editor';
import {Row,Col} from 'antd';
import FlowDetailPanel from '../editor_detail_panel';
import styles from './index.scss';
import 'antd/dist/antd.css';
import {Component, Project} from "../../project";
import FlowToolbar from "../editor_toolbar";

class FlowPage extends React.Component{
    render(){
        return(
        <GGEditor className={styles.editor}>
            <Row type='flex' className={styles.editorBd}>
                <Col span={4} className={styles.editorSidebar}>
                    <Project/>
                    <Component/>
                </Col>
                <Col span={16} className={styles.editorContent}>
                    <Flow grid={grid} className={styles.flow} style={{"height": 400, marginLeft: '8px', marginRight: '8px'}}/>
                </Col>
                <Col span={4} className={styles.editorSidebar}>
                    <FlowDetailPanel/>
                </Col>
            </Row>
        </GGEditor>
        );
    }
}

const grid = {
    cell:20,
    type:'point',
    line:{
      color:'#f7f7f7',
      fill:'#f7f7f7',
      stroke: '#D3D3D3',
      lineWidth: 0.1
    }
}

export default FlowPage;