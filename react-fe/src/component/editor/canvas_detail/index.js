import React from 'react';
import {Row,Col,Button,Card,Upload,Modal, Collapse, message} from 'antd';
import {withPropsAPI} from 'gg-editor';
import 'antd/dist/antd.css';
import $ from 'jquery'

const { Panel } = Collapse;

class CanvasDetail extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            project: null
        }
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
                    this.setState({project: jsonData.data})
                }
            })
        }
    }


    componentWillMount() {
        this.getData()
        $("#project_id").bind('DOMNodeInserted',e => {
            this.getData()
            const {propsAPI}=this.props;
            const {read}=propsAPI;
            read({})
        });

    }

    render(){
        if(this.project_id === null) {
            return <Card/>
        } else {
            return (<div>
                <Collapse defaultActiveKey={['1']} accordion expandIconPosition={'right'}>
                    <Panel header="工程信息" key="1" style={{'overflow-x': 'scroll'}}>
                        <div style={{'color': '#ccc'}}>名称</div>
                        <div>{this.state.project.project_name}</div>
                        <div style={{'color': '#ccc'}}>班级</div>
                        <div>{this.state.project.clazz_name}</div>
                        <div style={{'color': '#ccc'}}>实验项目</div>
                        <div>{this.state.project.experimental_item_name}</div>
                        <div style={{'color': '#ccc'}}>实验任务</div>
                        <div>{this.state.project.experimental_task_name}</div>
                        <div style={{'color': '#ccc'}}>创建时间</div>
                        <div>{this.state.project.create_time}</div>
                    </Panel></Collapse>
            </div>)
        }
    }
}

export default withPropsAPI(CanvasDetail)
