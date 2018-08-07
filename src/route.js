import React,{Component} from 'react';
import {
    HashRouter as Router,
    Route,
    Switch,
    Redirect
} from 'react-router-dom';
import App from './App';
import {Provider} from 'react-redux';
import UnauthorizedLayout from './layouts/UnauthorizedLayout';
import AuthorizedRoute from './AuthorizedRoute';
import store from './store';
import { LocaleProvider } from 'antd';
import zh_CN from 'antd/lib/locale-provider/zh_CN';
import 'moment/locale/zh-cn';

export default class AppRoute extends Component {

    constructor(){
        super();

        this.state = {

        }
    }

    componentDidMount(){

    }

    render(){


        return(
            <Provider store={store}>
                <LocaleProvider locale={zh_CN}>
                    <Router>
                        <div style={{height: '100%'}}>
                            <Switch>
                                <Route path="/auth" component={UnauthorizedLayout} />
                                <AuthorizedRoute path="/app" component={App} />
                                <Redirect to="/app" />
                            </Switch>
                        </div>
                    </Router>
                </LocaleProvider>
            </Provider>
        )
    }
}
