import React from 'react';
import GGEditor, {Flow}from 'gg-editor';
import {Row,Col} from 'antd';
import FlowDetailPanel from '../editor_detail_panel';
import styles from './index.scss';
import 'antd/dist/antd.css';
import {Component, Project} from "../../project";

class FlowPage extends React.Component{
    render(){
        return(
        <GGEditor className={styles.editor}>
            <Row className={styles.editorBd}>
                <Col flex="0 0 160px" className={styles.editorSidebar}>
                    <Project/>
                    <Component/>
                </Col>
                <Col flex="0 1 calc(100% - 540px)" className={styles.editorContent}>
                    <Flow grid={grid} className={styles.flow} style={{"height": '510px', marginLeft: '4px', background: '#FEFEFE', 'border-left': '1px solid #F6C67B', 'border-right': '1px solid #DCDCDC', 'border-top': '1px solid #F6C67B', 'border-bottom': '1px solid #F6C67B'}}/>
                </Col>
                <Col flex="0 1 160px" className={styles.editorSidebar}>
                    <FlowDetailPanel/>
                </Col>
            </Row>
        </GGEditor>
        );
    }
}

const grid = {
    cell:5,
    type:'line',
    line:{
      color:'#F8F8F8',
      fill:'#F8F8F8',
      stroke: '#F8F8F8',
      lineWidth: 0.1
    }
}

export default FlowPage;