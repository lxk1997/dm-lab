import React from 'react';
import {
    NodePanel,
    CanvasPanel,
    DetailPanel
} from 'gg-editor';
import {Card} from 'antd';
import NodeDetail from '../node_detail';
import styles from './index.scss';
import 'antd/dist/antd.css';
import CanvasDetail from '../canvas_detail';

class FlowDetailPanel extends React.Component{
    render(){
        return (
            <DetailPanel className={styles.detailPanel} style={{width: '160px', 'max-width': '160px', background: '#FEFEFE', 'border-right': '1px solid #F6C67B', 'border-top': '1px solid #F6C67B', 'border-bottom': '1px solid #F6C67B', 'border-left': '1px solid #DCDCDC', "height": "510px", 'max-height': '510px', 'overflow':'overlay'}}>
                <NodePanel>
                    <NodeDetail/>
                </NodePanel>
                <CanvasPanel>
                    <CanvasDetail/>
                </CanvasPanel>
            </DetailPanel>
        )
    }
}

export default FlowDetailPanel;