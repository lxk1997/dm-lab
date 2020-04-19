import React from 'react';
import {Card} from 'antd';
import {ItemPanel,Item, ContextMenu, NodeMenu, Command} from 'gg-editor';
import styles from './index.scss';
import 'antd/dist/antd.css';

class EditorItemPanel extends React.Component{

    render(){
        return (
            <ItemPanel className={styles["item-panel"]}>
                <Card>
                    <Item
                        type={'node'}
                        size={'80*28'}
                        shape={'flow-rect'}
                        model={{
                            color:'#1890ff',
                            label:'输入源'
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
                            label:'输出源'
                        }}
                        label={'输出源'}
                        children={<div>输出源</div>}
                    />
                </Card>
            </ItemPanel>
        )
    }
}

export default EditorItemPanel;