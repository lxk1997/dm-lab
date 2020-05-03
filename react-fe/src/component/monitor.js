import React from 'react'
import $ from 'jquery'
import {Link} from 'react-router-dom'

export default class Monitor extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            data: {}
        }
    }

    getData() {}

    componentDidMount() {
        this.getData()
    }

    render() {
        $("#header_title").text('任务队列')
       return <div>monitor</div>
    }
}
