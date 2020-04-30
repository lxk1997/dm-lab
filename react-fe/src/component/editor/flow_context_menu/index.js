import React from 'react';
import {Card,Form,Input,InputNumber} from 'antd';
import ColorPicker from 'rc-color-picker';
import 'rc-color-picker/assets/index.css';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import InputSourceContextMenu from "./input_source";
import OutputSourceContextMenu from "./output_source";
import DuplicateRemovalContextMenu from "./duplicate_removal";
import CARTClassifierContextMenu from "./cart_classifier";
import SVMClassifierContextMenu from "./svm_classifier";
import KNNClassifierContextMenu from "./knn_classifier";
import NBClassifierContextMenu from "./nb_classifier";
import LRClassifierContextMenu from "./lr_classifier";
import CARTRegressorContextMenu from "./cart_regressor";
import AprioriContextMenu from "./apriori";

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
            case '记录去重':
                MenuComponent = DuplicateRemovalContextMenu;
                break;
            case 'CART分类树':
                MenuComponent = CARTClassifierContextMenu;
                break;
            case '支持向量机':
                MenuComponent = SVMClassifierContextMenu;
                break;
            case '最近邻分类':
                MenuComponent = KNNClassifierContextMenu;
                break;
            case '朴素贝叶斯':
                MenuComponent = NBClassifierContextMenu;
                break;
            case '逻辑回归':
                MenuComponent = LRClassifierContextMenu;
                break;
            case 'CART回归树':
                MenuComponent = CARTRegressorContextMenu;
                break;
            case 'Apriori':
                MenuComponent = AprioriContextMenu;
                break;
        }
        return(<MenuComponent/>)
    }
}


export default withPropsAPI(FlowContextMenu);