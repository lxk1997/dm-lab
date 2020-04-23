import React from 'react';
import {Card,Form,Input,InputNumber} from 'antd';
import ColorPicker from 'rc-color-picker';
import 'rc-color-picker/assets/index.css';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import InputSource from "./input_source";
import OutputSource from "./output_source";
import DuplicateRemoval from "./duplicate_removal";
import FlowContextMenu from "../flow_context_menu";
import CARTClassifier from "./cart_classifier";

const {Item}=Form;

class NodeDetail extends React.Component{

    render(){
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        const {label}=item.getModel()

        let Component  = null;
        let MenuComponent = FlowContextMenu;
        switch(label) {
            case '输入源':
                Component = InputSource;
                break;
            case '输出源':
                Component = OutputSource;
                break;
            case '记录去重':
                Component = DuplicateRemoval;
                break;
            case 'CART分类树':
                Component = CARTClassifier;
                break;
        }
        return(<div>
            <Component/>
            <MenuComponent/></div>
        )
    }
}


export default withPropsAPI(NodeDetail);