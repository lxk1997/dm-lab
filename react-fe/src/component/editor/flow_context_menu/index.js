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
import CustomizedAssociationRuleContextMenu from "./customized_association_rule";
import CustomizedClassifierContextMenu from "./customized_classifier";
import CustomizedRegressorContextMenu from "./customized_regressor";
import SVMRegressorContextMenu from "./svm_regressor";
import ReportUploadContextMenu from "./report_upload";
import KNNRegressorContextMenu from "./knn_regressor";
import LASSORegressorContextMenu from "./lasso_regressor";
import LinearRegressorContextMenu from "./linear_regressor";
import KMeansClusterContextMenu from "./k_means_cluster";
import DBSCANClusterContextMenu from "./dbscan_cluster";
import HierarchicalClusterContextMenu from "./hierarchical_cluster";
import FeatureStructureContextMenu from "./feature_structure";
import MissingValuesHandleContextMenu from "./missing_values_handle";
import FPGrowthContextMenu from "./fp_growth";

const {Item}=Form;

class FlowContextMenu extends React.Component{

    render(){
        const {propsAPI}=this.props;
        const {getSelected}=propsAPI;

        const item=getSelected()[0]

        if(!item) return null;

        let values =item.getModel()

        let MenuComponent = null;
        switch(values.label) {
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
            case 'FP-Growth':
                MenuComponent = FPGrowthContextMenu;
                break;
            case '支持向量回归':
                MenuComponent = SVMRegressorContextMenu;
                break;
            case '最近邻回归':
                MenuComponent = KNNRegressorContextMenu;
                break;
            case 'LASSO回归':
                MenuComponent = LASSORegressorContextMenu;
                break;
            case '线性回归':
                MenuComponent = LinearRegressorContextMenu;
                break;
            case 'K-Means':
                MenuComponent = KMeansClusterContextMenu;
                break;
            case '实验提交':
                MenuComponent = ReportUploadContextMenu;
                break;
            case 'DBSCAN密度聚类':
                MenuComponent = DBSCANClusterContextMenu;
                break;
            case '层次聚类':
                MenuComponent = HierarchicalClusterContextMenu;
                break;
            case '特征构造':
                MenuComponent = FeatureStructureContextMenu;
                break;
            case '缺失值处理':
                MenuComponent = MissingValuesHandleContextMenu;
                break;
        }
        if(MenuComponent === null) {
            switch (values.class_name) {
                case 1:
                    MenuComponent = CustomizedAssociationRuleContextMenu;
                    break;
                case 2:
                    MenuComponent = CustomizedClassifierContextMenu;
                    break;
                case 3:
                    MenuComponent = CustomizedRegressorContextMenu;
                    break;
            }
        }
        return(<MenuComponent/>)
    }
}


export default withPropsAPI(FlowContextMenu);