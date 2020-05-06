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
import SVMClassifier from "./svm_classifier";
import KNNClassifier from "./knn_classifier";
import NBClassifier from "./nb_classifier";
import LRClassifier from "./lr_classifier";
import CARTRegressor from "./cart_regressor";
import Apriori from "./apriori";
import CustomizedAssociationRule from "./customized_association_rule";
import CustomizedClassifier from "./customized_classifier";
import CustomizedRegressor from "./customized_regressor";
import SVMRegressor from "./svm_regressor";
import ReportUpload from "./report_upload";

const {Item}=Form;

class NodeDetail extends React.Component{

    render(){
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        let values =item.getModel()

        let Component  = null;
        let MenuComponent = FlowContextMenu;
        switch(values.label) {
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
            case '支持向量机':
                Component = SVMClassifier;
                break;
            case '最近邻分类':
                Component = KNNClassifier;
                break;
            case '朴素贝叶斯':
                Component = NBClassifier;
                break;
            case '逻辑回归':
                Component = LRClassifier;
                break;
            case 'CART回归树':
                Component = CARTRegressor;
                break;
            case '支持向量回归':
                Component = SVMRegressor;
                break;
            case 'Apriori':
                Component = Apriori;
                break;
            case '实验提交':
                Component = ReportUpload;
                break;
        }
        if(Component === null) {
            switch (values.class_name) {
                case 1:
                    Component = CustomizedAssociationRule;
                    break;
                case 2:
                    Component = CustomizedClassifier;
                    break;
                case 3:
                    Component = CustomizedRegressor;
            }
        }
        return(<div>
            <Component/>
            <MenuComponent/></div>
        )
    }
}


export default withPropsAPI(NodeDetail);