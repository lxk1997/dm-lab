import React from 'react'
import $ from 'jquery'
import {Carousel, Card, Row, Col} from 'antd';
import {
    ApiTwoTone,
    CodeTwoTone,
    PieChartTwoTone
} from '@ant-design/icons';

export default class Home extends React.Component {

    render() {
        $("#header_title").text('主页');
        return (<div>
            <Carousel autoplay style={{"height": "200px"}}>
                <div className="welcome1"/>
                <div className="welcome2"/>
                <div className="welcome3"/>
            </Carousel>
          <div className="site-card-wrapper" style={{"margin": "8px"}}>
                <Row gutter={16}>
                  <Col span={8}>
                    <Card style={{'text-align': 'center'}}>
                      <ApiTwoTone style={{'font-size': '40px', 'margin-top': '40px', 'margin-bottom': '40px'}}/><br/>
                      <div style={{'text-align': 'center', 'font-size': '20px', 'margin-bottom': '20px'}}>流程化建模</div>
                      <div style={{'text-align': 'center', 'font-size': '14px'}}>提供全面的数据挖掘算法集, 可通过拖拽算法组件的方式完成模型的构建</div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card style={{'text-align': 'center'}}>
                      <CodeTwoTone style={{'font-size': '40px', 'margin-top': '40px', 'margin-bottom': '40px'}}/><br/>
                      <div style={{'text-align': 'center', 'font-size': '20px', 'margin-bottom': '20px'}}>自动化测评</div>
                      <div style={{'text-align': 'center', 'font-size': '14px'}}>提供中心化的在线评测服务以及评测排行榜，提供依据测评指标的辅助评分功能</div>
                    </Card>
                  </Col>
                  <Col span={8}>
                    <Card style={{'text-align': 'center'}}>
                        <PieChartTwoTone style={{'font-size': '40px', 'margin-top': '40px', 'margin-bottom': '40px'}}/><br/>
                        <div style={{'text-align': 'center', 'font-size': '20px', 'margin-bottom': '20px'}}>可视化报告</div>
                        <div style={{'text-align': 'center', 'font-size': '14px'}}>针对不同任务类型，提供相应的可视化功能，以便定性定量分析</div>
                    </Card>
                  </Col>
                </Row>
          </div></div>

        )
    }
}
