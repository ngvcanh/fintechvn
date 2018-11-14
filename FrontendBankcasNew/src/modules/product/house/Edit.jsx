import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate } from 'react-i18next';

import { Loading } from 'components';
import Form from './Form';

import { actions as yearsActions } from 'modules/categories/years';
import * as productActions from './../actions';
import { actions as productDetailActions } from 'modules/productDetail';
import { withNotification } from 'components';
import { isFnStatic, isEmpty } from 'utils/functions';
import { Error404 } from 'modules';
import * as fileConfig from 'config/fileConfig';
import Right from './Right';

class Edit extends Component {

  constructor(props){
    super(props);
    this.state = {
      btnEnd    : false,
      endClick  : false,
      stepBegin : true,
      isWorking : false,
      listInfo  : {
        _houseValue: {},
        _getRangeYear: {},
        _getRuleExtends: {
          name: "Lựa chọn bổ sung", options: {}
        },
        _assetHouseValue: {
          name: "Phí bảo hiểm tài sản nhà", options: {}
        },
      },
      price     : 0,
      sumPrice  : 0,
      nextchange: 0
    }
  }

  componentWillMount(){
    let { product, profile, years, productActions, yearsActions, productDetail, productDetailActions, match } = this.props;
    
    let { id }        = match.params;
    let dataRequest   = productDetail.data[id];

    if(!dataRequest){
      productDetailActions.fetchAll(
        {
          include: [
            {relation: "users", scope: { fields: { firstname: true, lastname: true }}},
            {relation: "product", scope: { fields: { name: true, type: true }}},
          ],
          order: "id DESC"
        }, 0, 0, {agency_id: profile.info.agency.id}
      )
      .then(res => {
        let { match } = this.props;
        let { id }        = match.params;
        if(!!res){
          let dataRequest   = res.filter(e => e.id === id);
          dataRequest = !!dataRequest ? dataRequest[0] : null;
          
          if(!!dataRequest) this.setInfoProduct(dataRequest)
        }
      });
    } else this.setInfoProduct(dataRequest)
    
    if(years.ordered.length === 0) yearsActions.fetchAll({}, 0, 0, {insur_id: profile.info.agency.insur_id});

    if(!product.data.house) productActions.fetchProduct('house');
  }

  componentDidUpdate(nextProps, nextState){
    let { price, listInfo, sumPrice } = this.state;

    let { _getRuleExtends, _assetHouseValue } = listInfo;

    if( true ){
      sumPrice = price;
      let priceMore = 0;

      if(!isEmpty(_getRuleExtends.options)){
        for(let key in _getRuleExtends.options){
          let { price: pri } = _getRuleExtends.options[key];
          priceMore += parseFloat(pri);
        }
      }
      if(!isEmpty(_assetHouseValue.options)){
        for(let key in _assetHouseValue.options){
          let { price: pri } = _assetHouseValue.options[key];
          priceMore += parseFloat(pri);
        }
      }

      sumPrice += priceMore;

      if(this.state.price !== price || this.state.sumPrice !== sumPrice)
        this.setState({price, sumPrice});
    }
  }

  setInfoProduct = (dataRequest) => {
    let state = {
      price : dataRequest.detail && dataRequest.detail.price ? dataRequest.detail.price : 0,
      sumPrice: dataRequest.price ? dataRequest.price : 0,
      listInfo : !!dataRequest.detail.listInfo ? { ...dataRequest.detail.listInfo} : this.state.listInfo
    };
    
    this.setState({...state});
  }

  setStatePrice = (e) =>{ 
    let { key, value } = e;
    !!key && !!value && this.setState({
      listInfo: {
        ...this.state.listInfo,
        [key] : value
      }
    })
  }

  setStateLocal = (e) => { 
    let { key, value } = e;
    !!key && !!value && this.setState({
      ...this.state,
      [key] : value
    })
  }

  endClickProduct = () => this.setState({endClick: true});

  formSubmit = (data) => {
    let { productDetailActions, match } = this.props;
    let { listInfo, sumPrice, price } = this.state;
    let { id: idPro }        = match.params;
    let { options } = listInfo._getRuleExtends

    let detail = {
      ...data,
      price: price,
      listInfo,
      ruleExtends: { ...options}
    };

    let dt = {
      detail,
      price       : sumPrice
    }

    if(!this.state.isWorking){
      this.setState({isWorking: true});
      productDetailActions.updateById(idPro, dt)
        .then(res => {
          if(!!res.error) return Promise.reject(res.error);
          this.hanndelSenUpdateSuccess()
        }, e => Promise.reject(e))
        .catch(e => this.handelError(e))
        .finally(() => this.setState({isWorking: false}))
    }

  }

  hanndelSenUpdateSuccess = () => {
    this.props.notification.s('Message','Update seccess.');
    this.setState({endClick: false, nextchange: 0})
  }

  onDropFile = (file) =>{
    let { productDetailActions, notification, match, productDetail } = this.props;
    let { id }        = match.params;
    file = file[0];
    let data = productDetail.data[id];
    
    if(!!data && !isEmpty(data) && (data.status === 0 || data.status === 2)){
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

  onClickSendCIS = () => {
    let { productDetailActions, notification, match, productDetail } = this.props;
    let { id }        = match.params;

    let data = productDetail.data[id];

    if(!!data && !isEmpty(data) && !!data.file && !isEmpty(data.file)){
      if(  (data.status === 0 || data.status === 2)){
        productDetailActions.updateById(id, {status: 1})
          .then(res => {
            if(res.error) return Promise.reject(res.error);
            notification.s('Message', 'Send CIS Success');
            this.props.history.push(`/product/house/view/${id}`)
          })
          .catch(e => this.handelError(e));
      }else notification.e('Message', 'You not permission')
    }else notification.e('Message', 'File not exist')
  }

  handelUploadSuccess = (data) => {
    if(!data) this.props.notification.e('Error', 'File not update.');
    else this.props.notification.s('Message', 'Upload file success.');
  }


  handelError = (err) => this.props.notification.e('Error', err.messagse);

  handelRemoveFileSuccess = (data) => this.props.notification.s('Error', 'File delete success.');

  render() { 
    
    let { product, match, productDetail, years, t } = this.props;
    let { id }        = match.params;
    
    if( product.isWorking  || productDetail.isWorking || years.isWorking) return <Loading />

    let dataRequest = productDetail.data[id];
    if(!product.data.house || !dataRequest || dataRequest.status === 1 || !dataRequest.product || dataRequest.product.type !== "house") return (<Error404 />);
    
    let { btnEnd, endClick, listInfo, price, sumPrice, isWorking } = this.state;

    let newListInfo = [];
    for(let key in listInfo){
      let newlist = {};
      if(!isEmpty(listInfo[key])) newlist = listInfo[key];
      newListInfo.push(newlist);
    }

    let tabs      = [];
    let contents  = [];

    if(!!product.data.house){
      let tabFile = {
        "name": "File đính kèm",
        "lang" : "motor_tab_file",
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

      product.data.house.steps['tabFile'] = tabFile;

      for(let step in product.data.house.steps){
        let { name, icon, lang, controls } = product.data.house.steps[step];
        tabs.push({name, icon, lang});
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
      <div className={`row ${!!isWorking ? 'loading' : '' }`}>
        <div className="col-sm-9">
          <div className="white-box">
            <h3 className="box-title m-b-0">{t('product:motor_createRequest')}</h3>
            <p className="text-muted m-b-10 font-13">{t('product:motor_descCreateRes')}</p>

            <Form
              contents    = { contents }
              endClick    = { endClick }
              formSubmit  = { this.formSubmit }
              _ftHandlerEvent   = { this._ftHandlerEvent }
              callbackFunction  = { this.callbackFunction }
              dataRequest = { dataRequest }
              onClickEnd  = { btnEnd => this.setState({btnEnd, nextchange: Date.now()})}
              
              didMount    = { () => isFnStatic('onLoadEidt', {component: this})}
              events      = { events }
              handelRemoveClick = { this.handelRemoveClick }
              t                 = { t }
              setStatePrice     = { this.setStatePrice }
              setStateLocal     = { this.setStateLocal }
              tabs              = { tabs } />

          </div>
        </div>
        <Right
          listInfo    = { listInfo }
          price       = { price }
          sumPrice    = { sumPrice }
          btnEnd      = { btnEnd }
          endClickProduct  = { this.endClickProduct }
          dataRequest      = { dataRequest }
          onClickSendCIS   = { this.onClickSendCIS }
          t           = { t } />
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

export default withNotification(translate(['product'])(connect(mapStateToProps, mapDispatchToProps)(Edit)));