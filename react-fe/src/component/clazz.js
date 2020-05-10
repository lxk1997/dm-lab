import React from 'react'
import 'antd/dist/antd.css';
import $ from 'jquery'
import {Button, Descriptions, Form, Input, message, Modal, PageHeader, Popconfirm, Table, List, Card, Avatar} from 'antd';
import Highlighter from 'react-highlight-words';
import {SearchOutlined} from '@ant-design/icons';
import {checkFetchStatus} from "../page/utils";
import {getId} from "./utils";

export default class Clazz extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            limit: 20,
            offset: 0,
            clazzes: [],
        };
        this.offset = 0
        this.limit = 20
        this.total = 0
        this.current = 0
        this.columns = [
            {
                title: '班级',
                dataIndex: 'name',
                key: 'name',
                render: (text, recode) => <a href={"/clazz/" + recode.clazz_id}>{text}</a>,
                sorter: (a, b) => a.name > b.name,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '人数',
                dataIndex: 'count',
                key: 'count',
                sorter: (a, b) => a.count > b.count,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '加入时间',
                dataIndex: 'time',
                key: 'time',
                sorter: (a, b) => a.time > b.time,
                sortDirections: ['descend', 'ascend'],
            },
            {
                title: '操作',
                key: 'action',
                render: (text, record) => (
                    <span>
                        <Popconfirm title='确定退出班级吗? 退出后对应的实验提交记录将一并删除，请谨慎选择' onConfirm={() => this.handleDeleteClazz(record)}>
                            <a style={{"color": "red"}}>退出</a>
                        </Popconfirm>
                    </span>
                ),
            },

        ];
    }

    handleChangePage = (pageNumber) => {
        this.getData({offset: (pageNumber - 1) * this.limit, limit: this.limit})
    }


    handleDeleteClazz = recode => {
        $.ajax({
            type: 'DELETE',
            url: '/api/clazz/' + recode.clazz_id,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData.msg)
                } else {
                    message.success('已退出该班级')
                    this.getData({offset: 0})
                }
            }
        })
    }

    getModalMsg = (result, msg) => {
        this.getData({offset: 0})
    }


    getData = ({offset = this.offset, limit = this.limit} = {}) => {
        this.offset = offset
        this.limit = limit
        const api = `/api/clazz`
        fetch(api)
            .then(checkFetchStatus)
            .then(resp => resp.json())
            .then(jsonData => {
                let data = jsonData.data.detail
                this.total = jsonData.data.count
                this.current = Number.parseInt(offset / limit, 10) + 1
                let clazzes = clazzTableFilter(data)
                if (this.state.clazzes.length > 0) {
                    this.setState({clazzes: []})
                }
                this.setState({clazzes: clazzes})
            })
            .catch(err => {
                alert(`fatal error, error messge in console.`)
                console.log(err)
            })
    }

    componentDidMount = () => {
        this.getData()
    }

    render() {
        $("#header_title").text('班级管理')
        let CartText = ({item}) => {
            let id_icon = (<span style={{borderRadius: 4, background: '#81b3ff', marginRight: "12px"}}>
                  <span style={{margin: "4px 0 4px 4px"}}>
                  <span
                      style={{
                          borderTopLeftRadius: 4,
                          borderBottomLeftRadius: 4,
                          color: 'white',
                          marginRight: '3px',
                          fontSize: '13px'
                      }}>
                    ID
                  </span>
                  <span style={{
                      borderTopRightRadius: 4,
                      borderBottomRightRadius: 4,
                      background: '#E3EEFC',
                      color: '#81b3ff',
                      paddingLeft: '3px',
                      paddingRight: '4px'
                  }}>
                      {item.clazz_id}
                  </span>
                  </span>
            </span>)
            let title = (<div>
                <div><span>{id_icon}</span><a href={"/clazz/" + item.clazz_id} style={{color: 'black'}}>{item.clazz_name}</a><span
                    style={{position: "absolute", right: "20px"}}><span><Avatar style={{
                    color: '#ffffff',
                    backgroundColor: '#35caca',
                }} size={20}>{item.teacher_name[0]}</Avatar></span><span
                    style={{fontSize: '15px', marginRight: '5px'}}>{item.teacher_name}</span><span
                    style={{color: '#C0C0C0', fontSize: '15px'}}>{item.time}</span></span></div>
                <div style={{color: '#C0C0C0', marginTop: '5px'}}>{item.description}</div>
            </div>);
            let content = (
                <div>
                    <span>
                        <span style={{color: '#C0C0C0', fontSize: '13px'}}>人数: </span>
                        <span>{item.count}</span>
                    </span>
                    <span style={{position: "absolute", right: "20px"}}><Popconfirm title='确定退出班级吗? 退出后对应的实验提交记录将一并删除，请谨慎选择' onConfirm={() => this.handleDeleteClazz(item)}>
                            <a style={{"color": "red"}}>退出</a>
                        </Popconfirm></span>
                </div>)
            return (<Card title={title}>{content}</Card>)
        };
        let pagination = {
            showQuickJumper: true,
            defaultPageSize: 20
        }
        return (
            <div>
                <JoinClazzModal parent={this}/>
                <List
                    grid={{gutter: 16, column: 1}}
                    dataSource={this.state.clazzes}
                    pagination={pagination}
                    renderItem={item => (
                        <List.Item>
                            <CartText item={item}/>
                        </List.Item>
                    )}
                />
            </div>)
    }
}

class JoinClazzModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            visible: false
        };
    }

    showModal = () => {
        this.setState({visible: true});
    }

    hideModal = () => {
        this.setState({visible: false});
        this.refs.form.resetFields();
    }

    setParentMsg = () => {
        this.props.parent.getModalMsg(this, true)
    }

    handleJoinClazz = values => {
        this.setState({loading: true});
        $.ajax({
            type: 'POST',
            url: '/api/clazz/join',
            async: false,
            data: {
                invite_code: values.invite_code
            },
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData.msg);
                } else {
                    this.setParentMsg();
                    message.success('新班级加入成功')
                }
                this.refs.form.resetFields()
                this.setState({loading: false, visible: false});
            }
        });
    }

    render() {
        return (
            <div>
                <div style={{"textAlign": "right"}}>
                    <Button type="primary" size={"large"} onClick={this.showModal}>
                        加入班级
                    </Button></div>
                <Modal
                    width="300px"
                    visible={this.state.visible}
                    title="加入班级"
                    onOk={this.handleJoinClazz}
                    onCancel={this.hideModal}
                    footer={null}>
                    <Form
                        name="join-class"
                        ref="form"
                        className="join-class-form"
                        onFinish={this.handleJoinClazz}>
                        <Form.Item
                            name="invite_code"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please input the Invite Code!',
                                },
                            ]}>
                            <Input placeholder="Invite Code"/>
                        </Form.Item>
                        <Form.Item style={{"textAlign": "center"}}>
                            <Button key="submit" type="primary" htmlType="submit" loading={this.state.loading}>
                                提交
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        );
    }
}

export class ClazzDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clazz: [],
            students: [],
            searchText: '',
            searchedColumn: '',
            score_leaderboard_modal_visible: false
        };
        this.columns = [
            {
                title: '用户名',
                dataIndex: 'name',
                key: 'name',
                width: '30%',
                ...this.getColumnSearchProps('name'),
            },
            {
                title: '邮箱',
                dataIndex: 'email',
                key: 'email',
                width: '30%',
                ...this.getColumnSearchProps('email'),
            },
            {
                title: '入班时间',
                dataIndex: 'join_time',
                key: 'join_time',
                sorter: (a, b) => a.join_time > b.join_time,
                sortDirections: ['descend', 'ascend'],
                width: '30%'
            }
        ];
    }

    getData = () => {
        let url = window.location.href
        this.clazz_id = getId(url, 'clazz')
        $.ajax({
            type: 'GET',
            url: `/api/clazz/${this.clazz_id}`,
            async: false,
            dataType: 'json',
            success: (jsonData) => {
                if (jsonData.error) {
                    message.error(jsonData)
                } else {
                    if(this.state.clazz.length || this.state.students.length) {
                        this.setState({clazz: [], students: []})
                    }
                    let data = jsonData.data.detail
                    let students = studentTableFilter(data.students)
                    this.setState({clazz: data, students: students})

                }
            }
        })
    }

     handleScoreLeaderBoardDisplay = () => {
        this.refs.scoreLeaderboardModal.setInfo({visible: true, clazz_id: this.clazz_id})
    }

    handleDeleteClazz = () => {
        $.ajax({
            type: 'DELETE',
            url: `/api/clazz/${this.clazz_id}`,
            dataType: 'json',
            success: (jsonData) => {
                if(jsonData.error) {
                    message.error(jsonData.msg)
                } else {
                    message.success("已退出该班级")
                    window.location.href = '/clazz'
                }
            }
        })
    }

    componentWillMount() {
        this.getData();
    }

    getColumnSearchProps = dataIndex => ({
        filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
            <div style={{padding: 8}}>
                <Input
                    ref={node => {
                        this.searchInput = node;
                    }}
                    placeholder={`搜索 ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{width: 188, marginBottom: 8, display: 'block'}}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                    icon={<SearchOutlined/>}
                    size="small"
                    style={{width: 90, marginRight: 8}}
                >
                    搜索
                </Button>
                <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{width: 90}}>
                    重置
                </Button>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: visible => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: text =>
            this.state.searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
                    searchWords={[this.state.searchText]}
                    autoEscape
                    textToHighlight={text.toString()}
                />
            ) : (
                text
            ),
    });

    handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        this.setState({
            searchText: selectedKeys[0],
            searchedColumn: dataIndex,
        });
    };

    handleReset = clearFilters => {
        clearFilters();
        this.setState({searchText: ''});
    };


    render() {
        $("#header_title").text('')
        const renderContent = (column = 1) => (
            <Descriptions size="small" column={column}>
                <Descriptions.Item label="学生数">
                    {this.state.clazz.students?this.state.clazz.students.length:0}
                </Descriptions.Item>
                <Descriptions.Item label="创建时间">{this.state.clazz.create_time}</Descriptions.Item>
                <Descriptions.Item label="描述">
                    {this.state.clazz.description}
                </Descriptions.Item>
            </Descriptions>
        );
        const extraContent = (
            <div
                style={{
                    display: 'flex',
                    width: 'max-content',
                    justifyContent: 'flex-end',
                }}
            >
            </div>
        );

        const ClazzDetailContent = ({children, extra}) => {
            return (
                <div>
                    <div className="main">{children}</div>
                    <div className="extra">{extra}</div>
                </div>
            );
        };
        return (<div>
            <ScoreLeaderboard visiable={this.state.score_leaderboard_modal_visible} clazz_id={this.clazz_id} ref={"scoreLeaderboardModal"} parent={this}/>
            <PageHeader
                className="site-page-header-responsive"
                onBack={() => window.history.back()}
                title={this.state.clazz.clazz_name}
                extra={[
                    <Button key="1" type="primary" onClick={this.handleScoreLeaderBoardDisplay} style={{'border-radius': '4px'}}>
                      排名
                    </Button>,
                    <Popconfirm title='确定退出班级吗? 退出后对应的实验提交记录将一并删除，请谨慎选择' onConfirm={() => this.handleDeleteClazz()}>
                            <Button key="1" type='danger' style={{'border-radius': '4px'}}>退出</Button>
                        </Popconfirm>
                ]}
                footer={null}>
                <ClazzDetailContent extra={extraContent}>{renderContent()}</ClazzDetailContent>
            </PageHeader>
            <Table columns={this.columns} dataSource={this.state.students} ref={"table"}/>
        </div>)

    }
}

class ScoreLeaderboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: props.visible,
            clazz_id: props.clazz_id,
            leaderboard: []
        }

        this.columns = [
            {
                title: '排名',
                dataIndex: 'rank',
                key: 'rank',
                sorter: (a, b) => a.rank < b.rank,
                sortDirections: ['ascend', 'descend'],
            },
            {
                title: '用户',
                dataIndex: 'user_name',
                key: 'user_name'
            },
            {
                title: '总分',
                dataIndex: 'score',
                key: 'score',
            },
            {
                title: '完成度',
                dataIndex: 'degree',
                key: 'degree',
            }
        ];

    }

    getData = () => {
        const api = `/api/clazz/${this.state.clazz_id}/leaderboard`
        $.ajax({
            url: api,
            type: 'GET',
            dataType: 'json',
            async: false,
            success: jsonData => {
                let data = jsonData.data.detail
                let leaderboard = leaderBoardTableFilter(data)
                if (this.state.leaderboard.length > 0) {
                    this.setState({leaderboard: []})
                }
                this.setState({leaderboard: leaderboard})
            }
        })
    }

    setInfo = val => {
        this.setState({visible: val.visible, clazz_id: val.clazz_id})
        this.getData()
    }

    hideModal = () => {
        this.setState({visible: false});
    }

    render() {
        let pagination = {
            showQuickJumper: true,
            defaultPageSize: 20
        }
        return (
            <Modal
                width="800px"
                height="600px"
                visible={this.state.visible}
                title="排名"
                onCancel={this.hideModal}
                footer={null}>
                <Table  size={"small"} pagination={pagination} ref={"table"} dataSource={this.state.leaderboard}
                       columns={this.columns}/>
            </Modal>
        );
    }
}

function clazzTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['clazz_name'] = data[idx].clazz_name
        result['count'] = data[idx].number
        result['time'] = data[idx].join_time
        result['teacher_name'] = data[idx].teacher_name
        result['clazz_id'] = data[idx].clazz_id
        result['description'] = data[idx].description === '' || data[idx].description === null ? "暂无描述" : data[idx].description
        results.push(result)
    }
    return results
}

function studentTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['name'] = data[idx].user_name
        result['email'] = data[idx].email
        result['join_time'] = data[idx].join_time
        result['student_id'] = data[idx].user_id
        results.push(result)
    }
    return results
}

function leaderBoardTableFilter(data) {
    let results = []
    for (let idx = 0; idx < data.length; idx++) {
        let result = {}
        result['key'] = idx
        result['user_name'] = data[idx].user_name
        result['user_id'] = data[idx].user_id
        result['score'] = data[idx].score
        result['rank'] = data[idx].rank
        result['degree'] = data[idx].degree
        results.push(result)
    }
    return results
}
