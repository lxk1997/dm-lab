import React from 'react'
import $ from 'jquery'
import {Link} from 'react-router-dom'

export default class Evaluation extends React.Component {
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
        $("#header_title").text('评测管理')
       return <div>evaluation</div>
    }
}
