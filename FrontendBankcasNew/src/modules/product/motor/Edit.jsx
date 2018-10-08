import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Loading } from 'components';
import Form from './Form';

import { actions as yearsActions } from 'modules/categories/years';
import * as productActions from './../actions';
import { actions as productDetailActions } from 'modules/productDetail';
import { withNotification } from 'components';
import { isFnStatic, isEmpty } from 'utils/functions';
import { formatPrice } from 'utils/format';
import { Error404 } from 'modules';
import * as fileConfig from 'config/fileConfig';

class Edit extends Component {
  
  constructor(props){
    super(props);
    this.state = {
      btnEnd    : false,
      endClick  : false,
      stepBegin : true,
      didMount  : false,
      listInfo  : {
        _getPriceCar: { },
        _getYearCar: {},
        _getCareType: {},
        _getSeatsPayload: {},
        _getRuleExtends: {
          name: "Lựa chọn bổ sung", options: {}
        },
      },
      price     : 0,
      sumPrice  : 0,
      nextchange: 0
    }
  }

  endClickProduct = () => {
    this.setState({endClick: true, nextchange: Date.now()});
  }

  formSubmit = (data) => {
    let { match, productDetailActions } = this.props;
    let { id: idPro }        = match.params;
    let { listInfo, sumPrice, price } = this.state;
    let { options } = listInfo._getRuleExtends

    let detail = {
      ...data,
      price: price,
      ruleExtends: { ...options}
    };

    let dt = {
      detail,
      price       : sumPrice
    }

    productDetailActions.updateById(idPro, {...dt})
      .then(res => {
        if(!!res.error) return Promise.reject(res.error);
        this.hanndelSenUpdateSuccess()
      }, e => Promise.reject(e))
      .catch(e => this.handelError(e))
  }

  hanndelSenUpdateSuccess = () => {
    this.props.notification.s('Message','Update seccess.');
    this.setState({endClick: false, nextchange: 0})
  }

  handelError = (e) => this.props.notification.e('Error', e.messagse);

  shouldComponentUpdate(nextProps, nextState){
    let { sumPrice, nextchange, stepBegin } = this.state;

    if(stepBegin){
        return (
          ( sumPrice === 0 || sumPrice !== nextState.sumPrice)
        );
    } return (nextchange === 0 || nextState.nextchange !== nextchange);
    
  }

  onClickSendCIS = () => {
    let { productDetailActions, notification, match, productDetail } = this.props;
    let { id }        = match.params;

    let data = productDetail.data[id];

    if(!!data && !isEmpty(data) && data.status === 0){
      productDetailActions.updateById(id, {status: 1})
        .then(res => {
          if(res.error) return Promise.reject(res.error);
          notification.s('Message', 'Send CIS Success')
        })
        .catch(e => this.handelError(e))
        .finally( () => this.setState({...this.state, nextchange: Date.now()}));
    }else notification.e('Message', 'You not permission')
  }

  componentDidUpdate(nextProps, nextState){
    let { price, listInfo, sumPrice, stepBegin } = nextState;

    let { _getPriceCar, _getRuleExtends, _getSeatsPayload } = listInfo;

    if( !!stepBegin && !isEmpty(_getPriceCar) && !isEmpty(_getSeatsPayload)){
      let priceSum  = +_getPriceCar.value;
      let ratioSP   = _getSeatsPayload.ratio;
      let priceMore = 0;

      price = priceSum * ratioSP / 100;
      sumPrice = price;
      
      if(!isEmpty(_getRuleExtends.options)){
        for(let key in _getRuleExtends.options){
          let { type, ratio } = _getRuleExtends.options[key];
          priceMore += (!!type ? (price * ratio / 100) : (priceSum * ratio / 100) );
        }
      }

      sumPrice += priceMore;
      this.setState({price, sumPrice});
    }
  }

  componentWillMount(){
    let { product, profile, years, productActions, yearsActions, productDetail, productDetailActions } = this.props;
    
    if(productDetail.ordered.length === 0) productDetailActions.fetchAll({
      include: [
        {relation: "users", scope: { fields: { firstname: true, lastname: true }}},
        {relation: "product", scope: { fields: { name: true }}},
      ]
    }, 0, 0, {agency_id: profile.info.agency.id});
    if(years.ordered.length === 0) yearsActions.fetchAll({}, 0, 0, {insur_id: profile.info.agency.insur_id});

    if(!product.data.motor) productActions.fetchProduct('motor');
  }

  _ftHandlerEvent = (DOMElement, eventName, handlerFunction) => {
    if (!!DOMElement && handlerFunction instanceof Function){
      if ('addEventListener' in DOMElement) DOMElement.addEventListener(eventName, handlerFunction);
      else if ('attachEvent' in DOMElement) DOMElement.attachEvent('on' + eventName, handlerFunction);
      else DOMElement['on' + eventName] = handlerFunction;
    }
  }

  callbackFunction = (el, name, cb) =>{ 
    this._ftHandlerEvent(el, name, () => { 
      isFnStatic(cb, {component: this, el}, (obj, action) => {
        isFnStatic(action)
      })
    })
  }

  onDropFile = (file) =>{
    let { productDetailActions, notification, match, productDetail } = this.props;
    let { id }        = match.params;
    file = file[0];
    let data = productDetail.data[id];

    if(!!data && !isEmpty(data) && data.status === 0){
      if(fileConfig.acceptTypeFile.indexOf(file.type) !== -1){
        if(fileConfig.maxFilesize >= file.size){
          let formData = new FormData();
          formData.append('file', file);

          productDetailActions.uploadFile(formData, id)
            .then(res => { 
              this.handelUploadSuccess(res)
            }, e => Promise.reject(e))
            .catch(e => this.handelError(e));
          
        } else notification.e('Error', 'File size invalid');
      } else notification.e('Error', 'Type file invalid');
    }
  }

  handelUploadSuccess = (data) => {
    if(!data) this.props.notification.e('Error', 'File not update.');
    else this.props.notification.s('Message', 'Upload file success.');

    this.setState({...this.state, nextchange: Date.now()})
  }

  handelError = (err) => this.props.notification.e('Error', err.messagse);

  handelRemoveClick = (name) => {
    let { productDetailActions, match } = this.props;
    let { id }        = match.params;

    productDetailActions.removeFile(name, id)
      .then(res => {
        if(!!res.error) return Promise.reject(res.error)
        this.handelRemoveFileSuccess();
      }, e => Promise.reject(e))
      .catch(e => this.handelError(e))
      .finally(e => this.setState({...this.state, nextchange: Date.now()}));
  }

  handelRemoveFileSuccess = (data) => this.props.notification.s('Error', 'File delete success.');

  render() { 
    
    let { product, match, productDetail, years } = this.props;
    let { id }        = match.params;
    
    if( product.isWorking || productDetail.isWorking || years.isWorking) return <Loading />

    let dataRequest = productDetail.data[id];
    if(!product.data.motor || !dataRequest) return (<Error404 />);
    
    let { btnEnd, endClick, listInfo, price, sumPrice } = this.state;

    let newListInfo = [];
    for(let key in listInfo){
      let newlist = {};
      if(!isEmpty(listInfo[key])) newlist = listInfo[key];
      newListInfo.push(newlist);
    }

    let tabs      = [];
    let contents  = [];

    if(!!product.data.motor){
      let tabFile = {
        "name": "File đính kèm",
        'controls': [
            [{
              "label" : "File đính kèm",
              "question" : "File đính kèm là gì",
              "tag" : "inputFile>id:file",
              "required" : false,
              "col": 12,
              "id" : "file",
              "message" : "Không được trống"
            }]
          ]
        }

      product.data.motor.steps['tabFile'] = tabFile;

      for(let step in product.data.motor.steps){
        let { name, icon, controls } = product.data.motor.steps[step];
        tabs.push({name, icon});
        if(!!controls && !isEmpty(controls)){
          contents.push({controls, step});
        }
        
      }
    }

    let events = {
      file : {
        onDrop : this.onDropFile,
      }
    }

    return (
      <div className="row">
        <div className="col-sm-9">
          <div className="white-box">
            <h3 className="box-title m-b-0">Tạo yêu cầu</h3>
            <p className="text-muted m-b-10 font-13">Vui lòng thực hiện đầy đủ các bước.</p>

            <Form
              contents    = { contents }
              endClick    = { endClick }
              formSubmit  = { this.formSubmit }
              _ftHandlerEvent   = { this._ftHandlerEvent }
              callbackFunction  = { this.callbackFunction }
              dataRequest = { dataRequest }
              onClickEnd  = { btnEnd => this.setState({btnEnd, nextchange: Date.now()})}
              stepBegin   = { stepBegin => this.setState({stepBegin}) }
              didMount    = { () => isFnStatic('onLoadEidt', {component: this})}
              events      = { events }
              handelRemoveClick = { this.handelRemoveClick }
              tabs              = { tabs } />

          </div>
        </div>
        <div className="col-sm-3 p-l-0 productLeft">
          <div className="white-box">
            <h3 className="box-title m-b-0">Thông tin sản phẩm</h3>
            <ul className="wallet-list listInfoProduct">
              {
                newListInfo.map((e, i) => {
                  if(isEmpty(e) || e.options) return null;
                  return (
                    <li key={i}>
                      <span className="pull-left"> <strong>{e.name ? e.name : ""}</strong> </span>
                      <span className="pull-right">{ undefined !== e.text ? e.text : ""}</span>
                      <div className="clear"></div>
                    </li>
                  )
                })
              }

              <li>
                <span className="pull-left text-info"> <strong>Thành tiền</strong> </span>
                <span className="pull-right text-danger"><strong>{formatPrice(price, 'VNĐ', 1)}</strong></span>
                <div className="clear"></div>
              </li>
            </ul>
            <h4 style={{fontSize: '13px'}} className="box-title m-b-0">Lựa chọn bổ sung</h4>
            <ul className="wallet-list listInfoProduct more">
                {
                  (!!listInfo._getRuleExtends.options && !isEmpty(listInfo._getRuleExtends.options))
                  ? (
                    <ul className="wallet-list listInfoProduct more">
                      {
                        Object.keys(listInfo._getRuleExtends.options).map((el, y) => {
                          return (
                            <li className="p-l-30" key={y}>
                              <span className="pull-left"> 
                               <strong>
                                {listInfo._getRuleExtends.options[el].name ? listInfo._getRuleExtends.options[el].name : ""}
                               </strong> 
                              </span>
                              <span className="pull-right">
                                { undefined !== listInfo._getRuleExtends.options[el].ratio ? listInfo._getRuleExtends.options[el].ratio : "0"}%
                              </span>
                              <div className="clear"></div>
                            </li>
                        )})
                      }
                    </ul>
                  )
                  : null
                }

              <li>
                <span className="pull-left text-info"> <strong>Tổng tiền</strong> </span>
                <span className="pull-right text-danger"><strong>{formatPrice(sumPrice, 'VNĐ', 1)}</strong></span>
                <div className="clear"></div>
              </li>
            </ul>
            <div className="col-sm-12 p-0">
              {
                !!dataRequest && dataRequest.status === 0
                ? (<button onClick={ this.onClickSendCIS } className="btn m-b-15 btn-flat btn-info btn-block fcbtn btn-outline btn-1e">Gửi đến CIS</button>)
                : null
              }
              {
                !!btnEnd && !!dataRequest && dataRequest.status === 0
                ? (<button onClick={this.endClickProduct} className="btn btn-flat btn-success btn-block fcbtn btn-outline btn-1e">Lưu yêu cầu</button>)
                : null
              }
            </div>
            <div className="clear"></div>
          </div>
        </div>
      </div>
    );
  }
}

let mapStateToProps = (state) => {
  let { product, profile, productDetail } = state;
  let { years } = state.categories;
  return { product, years, profile, productDetail };
};

let mapDispatchToProps = (dispatch) => {
  return {
    productActions       : bindActionCreators(productActions, dispatch),
    yearsActions         : bindActionCreators(yearsActions, dispatch),
    productDetailActions  : bindActionCreators(productDetailActions, dispatch),
  };
};

export default withNotification(connect(mapStateToProps, mapDispatchToProps)(Edit));