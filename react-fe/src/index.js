import React from 'react'
import {render} from 'react-dom'
import {BrowserRouter} from 'react-router-dom'
import Nav from './nav'
import AppContent from "./content";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'antd/dist/antd.css';
import './static/css/ant.css';
import {Layout, Menu} from 'antd';

const {Content} = Layout;
const {} = Menu;

const $ = require('jquery');
window.$ = $;
window.jQuery = $;
require('bootstrap/dist/js/bootstrap.min');

require('./static/css/custom.css')

class App extends React.Component {
    constructor(props) {
        super(props)
        this.login = false
    }

    // check user login or not
    checkLogin() {
        $.ajax({
            type: 'GET',
            url: '/api/auth/info',
            async: false,
            success: resp => {
                this.login = resp.error === 0;
            }
        })
    }

    render() {
        this.checkLogin();
        if (this.login === true) {
            return (
                <div>
                    <Nav/>
                </div>
            )
        } else {
            return (
                <div>
                    <Layout style={{minHeight: '100vh'}}>
                        <Nav/>
                    </Layout>
                    <Layout className="site-layout">
                        <Content style={{margin: '0 16px'}}>
                           <AppContent/>
                        </Content>
                    </Layout>
                </div>
            )
        }
    }
}

render((
    <BrowserRouter>
        <App/>
    </BrowserRouter>
), document.getElementById('root'))
