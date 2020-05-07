import React from 'react';
import {Collapse, Form, Select, Table, Button, message} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import 'rc-color-picker/assets/index.css';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import $ from 'jquery'
import {checkFetchStatus} from "../../../page/utils";

const {Item}=Form;
const { Panel } = Collapse;
const { Option } = Select;

class ReportUpload extends React.Component{
    constructor(props) {
        super(props);
    }

    render(){
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        return(
            <div><Collapse defaultActiveKey={['1']} accordion expandIconPosition={'right'} style={{'margin-bottom': '45px'}}>
                    <Panel header="基础参数" key="1">
                    </Panel>
                </Collapse>
                <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '160px'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        实验结果提交
                    </div>
                    </Panel>
                 </Collapse></div>
        )
    }
}

export default withPropsAPI(ReportUpload);