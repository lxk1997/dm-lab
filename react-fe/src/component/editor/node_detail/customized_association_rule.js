import React from 'react';
import {Collapse, Form, Select, Table, Button, message, Input} from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import 'rc-color-picker/assets/index.css';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import $ from 'jquery'

const {Item}=Form;
const { Panel } = Collapse;
const { Option } = Select;

class CustomizedAssociationRule extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            params: "{}"
        }
    }

    onParamsChange = e => {
        const {propsAPI}=this.props;
        const {getSelected, update}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()
        values.params = e.target.value
        update(item, {...values})
        this.setState({params: e.target.value})
    }

    render(){
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;
        let values = item.getModel()

        return(
            <div>
                <Collapse defaultActiveKey={['1']} accordion expandIconPosition={'right'} style={{'margin-bottom': '45px'}}>
                    <Panel header="基础参数" key="1">
                        <div>参数列表</div>
                        <Input defaultValue={this.state.params} onChange={this.onParamsChange} />
                    </Panel>
                </Collapse>
                 <Collapse accordion expandIconPosition={'right'} style={{'position': 'absolute', 'bottom': '0px', 'width': '100%'}}>
                    <Panel header="组件描述" key="1">
                    <div>
                        {values.description}
                    </div>
                    </Panel>
                 </Collapse>
            </div>
        )
    }
}

export default withPropsAPI(CustomizedAssociationRule);