import React from 'react'
import $ from 'jquery'
import {Link} from 'react-router-dom'

export default class Grade extends React.Component {
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
        $("#header_title").text('成绩记录')
       return <div>grade</div>
    }
}
