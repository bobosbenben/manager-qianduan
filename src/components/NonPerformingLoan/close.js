import React,{Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
require('isomorphic-fetch');
// import {withRouter} from 'react-router-dom';

class CloseNonPerformingLoan extends Component {

    constructor(props){
        super(props);

        this.fetchData = this.fetchData.bind(this);
        this.fetchMenuData = this.fetchMenuData.bind(this);
        this.state = {
            logedin: false
        }

    }

    componentDidMount(){

    }

    fetchData(){

        const history = this.props.history;
        console.log('history:'); console.log(history);

        history.push('/root');
    }

    fetchMenuData(){

        let url = '/sys/menu/menugroups';

        fetch(url, {
            method: 'GET',
            credentials: 'include',
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        })
            .then(res=>res.json())
            .then(json=>{
                console.log('请求到的菜单数据是：'); console.log(json);
            })
    }

    render(){

        const { value, onIncreaseClick } = this.props;

        return(
            <div>
                <h1>这里是销户</h1>
                <p>{value}</p>
                <p>
                    <button onClick={onIncreaseClick}>Increase</button>
                </p>
                <p>
                    <button onClick={this.fetchData}>获取数据</button>
                </p>
                <p>
                    <button onClick={this.fetchMenuData}>获取菜单数据</button>
                </p>
                {/*<Link to={{pathname:'/root'}}>root</Link>*/}
            </div>
        )
    }
}


function mapStateToProps(state) {
    return {
        value: state.counter
    }
}


const increaseAction = { type: 'increase' }

// Map Redux actions to component props
function mapDispatchToProps(dispatch) {
    return {
        onIncreaseClick: () => dispatch(increaseAction)
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(CloseNonPerformingLoan);
