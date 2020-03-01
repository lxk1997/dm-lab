import React from 'react'
import $ from 'jquery'
import {Link} from 'react-router-dom'

export default class Clazz extends React.Component {
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
       return <div>clazz</div>
    }
}
