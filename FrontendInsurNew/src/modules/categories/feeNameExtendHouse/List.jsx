import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Link } from 'react-router-dom';

import { withNotification, AlertConfirm } from 'components';
import * as feeNameExtendHouseActions from './actions';
import { RightSidebar, Loading } from 'components';
import FormAdd from './Form';
import Item from './Item';

class ListUser extends Component {
  constructor(props){
    super(props);
    this.state = {
      open      : false,
      idUpdate  : null,
      idDelete  : null,
      maxYear   : 0
    }
  }

  componentDidMount(){
    let { feeNameExtendHouse, feeNameExtendHouseActions, profile } = this.props;

    let where  = { removed: 0, insur_id: profile.info.agency.id};

    if(feeNameExtendHouse.ordered.length === 0) feeNameExtendHouseActions.fetchAll(null, 0, 0, where);
    
  }

  openRightSidebar = () => {
    this.setState({open: true});
  }

  closeRightSidebar = () => {
    this.setState({open: false, idUpdate: null});
  }

  formSubmitData = (data) => {
    let { feeNameExtendHouseActions, notification, profile} = this.props;
    let { idUpdate } = this.state;

    if(!idUpdate){
      data.insur_id = profile.info.agency.id;
      feeNameExtendHouseActions.create(data)
        .then(res => {
          if(res.error) return Promise.reject(res.error);
          if(!res.data) return Promise.reject({messagse: "unknown error"});
          if(res.data) notification.s('Messagse', 'Create item success');
        })
        .catch(e => notification.e('Error', e.messagse))
        .finally( this.setState({open: false, idUpdate: null}))
    } else this.updateItemById(idUpdate, data, "Update item success")
    
  }

  updateItemById = (id, data, titleS) => {
    let { feeNameExtendHouseActions, notification} = this.props;

    feeNameExtendHouseActions.updateById(id, data)
      .then(res => {
        if(res.error) return Promise.reject(res.error);
        if(!res.data) return Promise.reject({messagse: "unknown error"});
        if(res.data) notification.s('Messagse', titleS);
      })
      .catch(e => notification.e('Error', e.messagse))
      .finally( this.setState({open: false, idUpdate: null, idDelete: null}))
  }

  onDeleteItem = () => {
    let { idDelete } = this.state;
    this.updateItemById(idDelete, {removed: 1}, 'Delete item success')
  }

  onClickDeleteItem = (e) => this.setState({idDelete: e});

  onClickUpdateItem = (e) => this.setState({open: true, idUpdate: e})

  render() {
    let { open, idUpdate, idDelete }  = this.state;
    let { feeNameExtendHouse } = this.props;
    let { data, ordered, isWorking }   = feeNameExtendHouse;
    let dataGroup           = idUpdate ? data[idUpdate] : null;
    
    if (isWorking ) return <Loading />;

    return (
      <Fragment>
        <RightSidebar
          open = {open} onClose = {this.closeRightSidebar}
          title = {`${ idUpdate ? "Edit" : "Create"} item`}
          color = "success" >
          <FormAdd
            dataGroup       = { dataGroup }
            maxYear         = { this.state.maxYear }
            formSubmitData  = { this.formSubmitData }
            onClose         = { this.closeRightSidebar } />
        </RightSidebar>

        {
          idDelete
          ?
          ( 
            <AlertConfirm
              onCancel= { () => this.setState({idDelete: null})}
              onSuccess= { this.onDeleteItem }
              title="Are you sure!"/>
          )
          : null
        }

        <div className="row">
          <div className="col-md-12 col-lg-12 col-sm-12">
            <div className="panel">
              <div className="p-10 p-b-0">
                <form method="post" action="#" id="filter">
                  <Link onClick={ this.openRightSidebar } to="#" className="btn btn-success pull-right">
                    <i className="fa fa-plus" /> Create new item
                  </Link>
                  <div className="clear"></div>
                </form>
              </div>
              <hr style={{marginTop: '10px'}}/>
              <div className="table-responsive">
                <table className="table table-hover manage-u-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th width="100px" className="text-center">Action</th>
                    </tr>
                  </thead>
                    <Item
                      onClickUpdateItem = { this.onClickUpdateItem }
                      onClickDeleteItem = { this.onClickDeleteItem }
                      data              = { data }
                      maxYear           = {max => this.setState({maxYear: max})}
                      ordered           = { ordered }/>
                </table>
              </div>
            </div>
          </div>
        </div>
      </Fragment>
    );
  }
}

let mapStateToProps = (state) => {
  let { feeNameExtendHouse } = state.categories;
  let { profile } = state;

  return { feeNameExtendHouse, profile };
};

let mapDispatchToProps = (dispatch) => {
  return {
    feeNameExtendHouseActions          : bindActionCreators(feeNameExtendHouseActions, dispatch)
  };
};

export default withNotification(connect(mapStateToProps, mapDispatchToProps)(ListUser));