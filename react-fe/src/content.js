import React from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import Home from './page/home'
import Monitor from './component/monitor'
import Experimental from './component/experimental'
import Project from './component/project'
import Clazz from './component/clazz'
import Grade from './component/grade'
import Evaluation from './component/evaluation'
import page404 from './404'

function AppContent(props) {
    return (
        <div>
            <Switch> {/* display the first match route*/}
                <Redirect from='/' to='/home' exact/>
                <Route path='/home' exact component={Home}/>

                <Route path='/experimental' exact component={Experimental}/>

                <Route path='/monitor' exact component={Monitor}/>

                <Route path='/project' exact component={Project}/>

                <Route path='/clazz' exact component={Clazz}/>

                <Route path='/grade' exact component={Grade}/>

                <Route path='/evaluation' exact component={Evaluation}/>

                <Route path='*' component={page404}/>
            </Switch>
        </div>
    )
}

export default AppContent

