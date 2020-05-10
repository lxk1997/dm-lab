import React from 'react';
import GGEditor, {Flow}from 'gg-editor';
import {Row,Col, message} from 'antd';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import $ from 'jquery'

import {
    ZoomOutOutlined,
    ZoomInOutlined,
    CloudUploadOutlined,
    CloudSyncOutlined
} from '@ant-design/icons';


class EditorMenu extends React.Component {
    constructor(props) {
        super(props);
        this.project = null
        this.project_id = null
    }

    getData = () => {
        let project = $('#project_id').text()
        if(project!=='') {
            this.project_id = Number.parseInt(project)
            $.ajax({
                url: `/api/project/${this.project_id}`,
                type: 'GET',
                dataType: 'json',
                async: false,
                success: jsonData => {
                    this.project = jsonData.data
                }
            })
        }
    }

    handleUpload = e => {
        const {propsAPI}=this.props;
        const {save}=propsAPI;
        let content = JSON.stringify(save());
        this.getData()
        if(this.project_id === null) {
            message.warning('请先选择工程')
        } else {
            $.ajax({
                url: `/api/project/${this.project_id}`,
                type: 'POST',
                async: false,
                dataType: 'json',
                data: {
                    content: content
                },
                success: jsonData => {
                    if(jsonData.error) {
                        message.error(jsonData.msg)
                    } else {
                        message.success('上传成功')
                    }
                }
            })
        }
    }

    handleSync = e => {
        const {propsAPI}=this.props;
        const {read}=propsAPI;
        read({})

        this.getData()

        if(this.project === null) {
            message.warning('请先选择工程')
        } else {
            if(this.project.content !== null) {
                read(this.project.content)
            }
        }
    }

    handleZoomIn = e => {
        const {propsAPI}=this.props;
        const {executeCommand}=propsAPI;
        executeCommand('zoomIn')
    }

    handleZoomOut = e => {
        const {propsAPI}=this.props;
        const {executeCommand}=propsAPI;
        executeCommand('zoomOut')
    }

    render() {
        return (
            <div style={{'height': '48px', 'text-align': 'center', background: '#FEFEFE', 'border-left': '1px solid #F6C67B', 'border-right': '1px solid #DCDCDC', 'border-top': '1px solid #F6C67B', 'border-bottom': '2px solid #DCDCDC', 'padding-top': '13px'}}>
                <a href={"#"} style={{'margin': '0 12px'}} onClick={this.handleZoomOut}><ZoomOutOutlined style={{'color': '#666666', 'font-size': '20px'}}/></a>
                <a href={"#"} style={{'margin': '0 12px'}} onClick={this.handleZoomIn}><ZoomInOutlined style={{'color': '#666666', 'font-size': '20px'}}/></a>
                <a href={"#"} style={{'margin': '0 12px'}} onClick={this.handleUpload}><CloudUploadOutlined style={{'color': '#666666', 'font-size': '20px'}}/></a>
                <a href={"#"} style={{'margin': '0 12px'}} onClick={this.handleSync}><CloudSyncOutlined style={{'color': '#666666', 'font-size': '20px'}}/></a>
            </div>
        )
    }
}

export default withPropsAPI(EditorMenu)