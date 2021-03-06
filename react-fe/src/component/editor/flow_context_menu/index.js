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
import FrequencyAnalysisContextMenu from "./frequency_analysis";
import FactorAnalysisContextMenu from "./factor_analysis";

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
            case '?????????':
                MenuComponent = InputSourceContextMenu;
                break;
            case '?????????':
                MenuComponent = OutputSourceContextMenu;
                break;
            case '????????????':
                MenuComponent = DuplicateRemovalContextMenu;
                break;
            case 'CART?????????':
                MenuComponent = CARTClassifierContextMenu;
                break;
            case '???????????????':
                MenuComponent = SVMClassifierContextMenu;
                break;
            case '???????????????':
                MenuComponent = KNNClassifierContextMenu;
                break;
            case '???????????????':
                MenuComponent = NBClassifierContextMenu;
                break;
            case '????????????':
                MenuComponent = LRClassifierContextMenu;
                break;
            case 'CART?????????':
                MenuComponent = CARTRegressorContextMenu;
                break;
            case 'Apriori':
                MenuComponent = AprioriContextMenu;
                break;
            case 'FP-Growth':
                MenuComponent = FPGrowthContextMenu;
                break;
            case '??????????????????':
                MenuComponent = SVMRegressorContextMenu;
                break;
            case '???????????????':
                MenuComponent = KNNRegressorContextMenu;
                break;
            case 'LASSO??????':
                MenuComponent = LASSORegressorContextMenu;
                break;
            case '????????????':
                MenuComponent = LinearRegressorContextMenu;
                break;
            case 'K-Means':
                MenuComponent = KMeansClusterContextMenu;
                break;
            case '????????????':
                MenuComponent = ReportUploadContextMenu;
                break;
            case 'DBSCAN????????????':
                MenuComponent = DBSCANClusterContextMenu;
                break;
            case '????????????':
                MenuComponent = HierarchicalClusterContextMenu;
                break;
            case '????????????':
                MenuComponent = FeatureStructureContextMenu;
                break;
            case '???????????????':
                MenuComponent = MissingValuesHandleContextMenu;
                break;
            case '????????????':
                MenuComponent = FrequencyAnalysisContextMenu;
                break;
            case '????????????':
                MenuComponent = FactorAnalysisContextMenu;
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