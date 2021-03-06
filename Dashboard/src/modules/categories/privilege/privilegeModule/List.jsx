import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';


import { withNotification, AlertConfirm, Modal } from 'components';
import * as privilegeModuleActions from './actions';
import { rmv } from 'utils/functions';

import Form from './Form';
import Item from './Item';

class List extends Component {
  constructor(props){
    super(props);
    this.state = {
      open      : false,
      keyWord   : null,
      loading   : false,
      idDelete  : null,
      item      : null,
      idGroup   : null,
      groupName : ""
    }
  }

  componentDidUpdate(prevProps, prevState){
    let { privilegeModuleActions } = this.props;
    
    if(!!this.state.idGroup && prevState.idGroup !== this.state.idGroup){
      privilegeModuleActions.fetchAll({}, 0, 0, { group_id: this.state.idGroup});
    }
  }

  componentWillReceiveProps(nProps){
    let idGroup             = null;
    let groupName           = "";
    let { idG: idGN }       = nProps.match.params;
    let { ordered }         = nProps.privilegeGroup;
    
    if(!!idGN && ordered.includes(idGN)) {
      idGroup   = idGN;
      groupName = nProps.privilegeGroup.data[idGN].name;
    }
    
    if(idGroup !== this.state.idGroup) this.setState({idGroup, groupName})
  }

  clickCreateItem = async (data) => {
    let { privilegeModuleActions, notification } = this.props;
    let { item, idGroup }  = this.state;
    let res       = {};

    this.setState({loading: true, open: false, item: null});

    if(!item)
      res= await privilegeModuleActions.create({...data, group_id: idGroup});
    else res= await privilegeModuleActions.updateById(item.id, data);

    if(!res.error) notification.s('Message', `${!item ? 'Create' : 'Update'} new item success`);
    else notification.e('Message', res.error.messagse || res.error.message);

    this.setState({loading: false});
  }

  onDeleteItem = async () => {
    let { idDelete } = this.state;
    let { privilegeModuleActions, notification } = this.props;

    this.setState({loading: true, idDelete: null});

    let res = await privilegeModuleActions.deleteItem(idDelete);

    if(!res.error) notification.s('Message', 'Delete new item success');
    else notification.e('Message', res.error.messagse || res.error.message);

    this.setState({loading: false});
  }

  onChangeKeyword = () => {
    let keyWord = (!!this._keywordInput) ? this._keywordInput.value : "";
  
    if(keyWord.trim().length >= 0 && keyWord.trim().length < 200){
      keyWord = rmv(keyWord);
      this.setState({keyWord});
    }
  }

  clickEditItem = (item) => this.setState({item, open: true});

  render() {
    let { idGroup, open, item, loading, keyWord, groupName, idDelete } = this.state;
    let { privilegeModule }               = this.props;
    let { data, ordered, isWorking }      = privilegeModule;

    let orderedN = ordered.filter(e => {
      let name = rmv(!!data[e].name ? data[e].name : "");
      return (!keyWord || name.indexOf(keyWord) !== -1);
    });
    
    if(null === idGroup || undefined === idGroup) orderedN = [];

    let load = (!!loading || !!isWorking) ? ' loading': '';

    return (
      <Fragment>

        {
          idDelete ?
          ( 
            <AlertConfirm
              onCancel= { () => this.setState({idDelete: null})}
              onSuccess= { this.onDeleteItem }
              title="Are you sure!"/>
          ) : null
        }
        <Modal
          open    = { open }
          header  = "Info item new" >
          <Form 
            clickCreateItem = { this.clickCreateItem }
            item            = { item }
            close           = { () => this.setState({open: false}) } />
        </Modal>

        <div className={`col-md-8 col-lg-8 col-sm-8${load}`}>
          <div className="panel">
            <h3 className="box-title p-15 p-b-0">Privilege module list</h3>
            {
              (!!idGroup) ? 
              (
                <div className="row" style={{padding: '15px 15px 0 15px'}}>
                  <div className="col-md-7">
                    <input 
                      onChange      = { this.onChangeKeyword }
                      ref           = { e => this._keywordInput = e}
                      type="text" className="form-control" placeholder="Enter key work" />
                  </div>
                  <div className="col-md-5">
                    <Link  onClick={ () => this.setState({open: true})} to="#" className="btn btn-success pull-right">
                      <i className="fa fa-plus" /> Create new
                    </Link>
                  </div>
                </div>
              ): null
            }
            

            <hr style={{marginTop: '10px'}}/>

            <div className="table-responsive">
              <table className="table table-hover manage-u-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th width="300px" >Section key</th>
                    <th width="200px" >Privilege Group</th>
                    <th width="100px" className="text-center">Action</th>
                  </tr>
                </thead>
                  <Item
                    data              = { data }
                    onDeleteItem      = { id => this.setState({idDelete: id}) }
                    clickEditItem     = { this.clickEditItem }
                    groupName         = { groupName }
                    ordered           = { orderedN }/>
              </table>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

let mapStateToProps = (state) => {
  let { privilegeGroup, privilegeModule } = state.categories;

  return { privilegeGroup, privilegeModule };
};

let mapDispatchToProps = (dispatch) => {
  return {
    privilegeModuleActions       : bindActionCreators(privilegeModuleActions, dispatch)
  };
};

export default withNotification(connect(mapStateToProps, mapDispatchToProps)(List));
