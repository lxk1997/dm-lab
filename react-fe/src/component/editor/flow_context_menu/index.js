import React from 'react';
import {Card,Form,Input,InputNumber} from 'antd';
import ColorPicker from 'rc-color-picker';
import 'rc-color-picker/assets/index.css';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import InputSourceContextMenu from "./input_source";
import OutputSourceContextMenu from "./output_source";

const {Item}=Form;

class FlowContextMenu extends React.Component{

    render(){
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        const {label}=item.getModel()

        let MenuComponent = null;
        switch(label) {
            case '输入源':
                MenuComponent = InputSourceContextMenu;
                break;
            case '输出源':
                MenuComponent = OutputSourceContextMenu;
                break;
        }
        return(<MenuComponent/>)
    }
}


export default withPropsAPI(FlowContextMenu);