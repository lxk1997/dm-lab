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
            <DetailPanel className={styles.detailPanel}>
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