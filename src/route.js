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
                <Router>
                    <div style={{height: '100%'}}>
                        <Switch>
                            <Route path="/auth" component={UnauthorizedLayout} />
                            <AuthorizedRoute path="/app" component={App} />
                            <Redirect to="/app" />
                        </Switch>
                    </div>
                </Router>
            </Provider>
        )
    }
}
