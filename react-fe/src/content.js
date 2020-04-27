import React from 'react'
import {Route, Switch, Redirect} from 'react-router-dom'
import Home from './page/home'
import Monitor from './component/monitor'
import ProjectParent from './component/project'
import Clazz, {ClazzDetail} from './component/clazz'
import Grade from './component/grade'
import Evaluation from './component/evaluation'
import page404 from './404'
import ExperimentalItem, {ExperimentalItemDetail, ExperimentalTaskDetail} from "./component/experimental";
import Dataset from "./component/dataset";

function AppContent(props) {
    return (
        <div style={{'margin-top': '5px'}}>
            <Switch> {/* display the first match route*/}
                <Redirect from='/' to='/home' exact/>
                <Redirect from='/login' to='/home' exact/>
                <Redirect from='/signup' to='/home' exact/>
                <Route path='/home' exact component={Home}/>

                <Route path='/experimental-item' exact component={ExperimentalItem}/>
                <Route path='/experimental-item/:experimental_item_id' exact component={ExperimentalItemDetail}/>

                <Route path='/experimental-task/:experimental_task_id' exact component={ExperimentalTaskDetail}/>

                <Route path='/dataset/:dataset_id' exact component={Dataset}/>

                <Route path='/monitor' exact component={Monitor}/>

                <Route path='/project' exact component={ProjectParent}/>

                <Route path='/clazz' exact component={Clazz}/>
                <Route path='/clazz/:clazz_id' exact component={ClazzDetail}/>

                <Route path='/grade' exact component={Grade}/>

                <Route path='/evaluation' exact component={Evaluation}/>

                <Route path='*' component={page404}/>
            </Switch>
        </div>
    )
}

export default AppContent

