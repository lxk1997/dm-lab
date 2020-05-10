import React from 'react';
import GGEditor, {Flow}from 'gg-editor';
import {Row,Col} from 'antd';
import FlowDetailPanel from '../editor_detail_panel';
import styles from './index.scss';
import 'antd/dist/antd.css';
import {Component, Project} from "../../project";
import EditorMenu from "../editor_menu";

class FlowPage extends React.Component{
    constructor(props) {
        super(props);
    }

    render(){
        return(
        <GGEditor className={styles.editor}>
            <span style={{'display': 'none'}} id={'project_id'}/>
            <Row className={styles.editorBd}>
                <Col span={3} className={styles.editorSidebar}>
                    <Project/>
                    <Component/>
                </Col>
                <Col span={17} className={styles.editorContent} style={{marginLeft: '14px'}}>
                    <EditorMenu/>
                    <Flow grid={grid} className={styles.flow} style={{"height": '462px', background: '#FEFEFE', 'border-left': '1px solid #F6C67B', 'border-right': '1px solid #DCDCDC', 'border-bottom': '1px solid #F6C67B'}}/>
                </Col>
                <Col span={3} className={styles.editorSidebar}>
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