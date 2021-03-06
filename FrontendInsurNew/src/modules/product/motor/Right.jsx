import React, { Component, Fragment } from 'react';

import { isEmpty } from 'utils/functions';
import { formatPrice, convertDMY } from 'utils/format';
import _ftNumber from 'utils/number';

class Right extends Component {
  _discountCheckBox = null;
  _tnnsCheckBox     = null;
  _connguoiCheckBox = null;
  _hanghoaCheckBox  = null;
  _connguoiSelector   = null;

  constructor(p){
    super(p);
    this.state = {
      connguoiInput: false,
      feeTnds           : null,
      tndsChecked       : false
    }
  }

  componentDidUpdate(){
    let { feeTnds, tndsChecked } = this.state;
    !!tndsChecked && !!this.props.setStateLocal && this.props.setStateLocal({key: 'tnds', value: feeTnds});
  }

  render() {
    let { connguoiInput } = this.state;
    
    let { dataRequest, t, listInfo, price, sumPrice, view,
       discount, disPrice, priceVAT, sumPriceVAT, connguoi, hanghoa, tnds, priceMore } = this.props;
    let newListInfo = [];
    
    sumPrice  = !!sumPrice ? sumPrice : 0;
    price     = !!price ? price : 0;
    discount  = !!discount ? discount : 0;

    for(let key in listInfo){
      let newlist = {};
      if(!isEmpty(listInfo[key]) && !listInfo[key].options) newlist = listInfo[key];

      newListInfo.push(newlist);
    }

    return (
      <div className="col-sm-3 p-l-0 productLeft">
        {
          !!dataRequest && dataRequest.status === 2
          ? (
            <div className="white-box bg-danger">
              <div className="col-md-12 m-t-5" style={{background: "hsla(0,0%,78%,.2)", padding: '10px'}}>
                <h3 >
                  <small className="text-white" style={{fontSize: '18px', fontWeight: '700'}}>{t('product:motor_mess')}:</small>
                  <p className="text-white" >{dataRequest.messagse ? dataRequest.messagse : ""}</p>
                </h3>
              </div>
              <div className="clear"></div>
            </div>
          )
          : null
        }

        {
          !!dataRequest && dataRequest.status === 3
          ? (
            <div className="white-box">
              <div className="col-md-6 text-center bd-r">
                <label className="strong">{t('product:motor_beginDay')}</label>
                <p className="form-control-static">
                  { (dataRequest.startDay) ? convertDMY(dataRequest.startDay, '.') : ''}
                </p>
              </div>
              <div className="col-md-6 text-center">
                <label className="strong">{t('product:motor_endDay')}</label>
                <p className="form-control-static">
                  { (dataRequest.endDay) ? convertDMY(dataRequest.endDay, '.') : ''}
                </p>
              </div>
              <div className="col-md-12 text-center m-t-5" style={{background: "hsla(0,0%,78%,.2)", padding: '10px'}}>
                <h3 >
                  <small style={{fontSize: '18px', fontWeight: '700'}}>{t('product:motor_payDay')}</small>
                </h3>
                <p className="form-control-static">
                  { (dataRequest.payDay) ? convertDMY(dataRequest.payDay, '.') : ''}
                </p>
              </div>
              <div className="clear"></div>
            </div>
          )
          : null
        }

        <div className="white-box">
          <h3 className="box-title m-b-0">{t('product:motor_productDetail')}</h3>
          <ul className="wallet-list listInfoProduct">
            {
              newListInfo.map((e, i) => {
                if(isEmpty(e) || e.options) return null;
                return (
                  <li key={i}>
                    <span className="pull-left"> <strong>{e.name ? (e.lang ? t(`product:${e.lang}`) : e.name) : ""}</strong> </span>
                    <span className="pull-right">{ undefined !== e.text ? e.text : ""}</span>
                    <div className="clear"></div>
                  </li>
                )
              })
            }

            <li>
              <span className="pull-left text-info"> <strong>{t('product:motor_right_fee')}</strong> </span>
              <span className="pull-right text-danger"><strong>{formatPrice(price, 'VNĐ', 1)}</strong></span>
              <div className="clear"></div>
            </li>
          </ul>
          <h4 style={{fontSize: '13px'}} className="box-title m-b-0">{t('product:motor_addMore')}</h4>
          <ul className="wallet-list listInfoProduct more">
              {
                (!!listInfo._getRuleExtends.options && !isEmpty(listInfo._getRuleExtends.options))
                ? (
                  <ul className="wallet-list listInfoProduct more">
                    {
                      Object.keys(listInfo._getRuleExtends.options).map((el, y) => {
                        let item = listInfo._getRuleExtends.options[el];
                        
                        if(!item || isEmpty(item)) return null;

                        return (
                          <li className="p-l-30" key={y}>
                            <span className="pull-left"> 
                              <strong>
                              {item.name ? item.name : ""}
                              </strong> 
                            </span>
                            <span className="pull-right">
                              { undefined !== item.fee ? formatPrice(item.fee) : "0"} VND
                            </span>
                            <div className="clear"></div>
                          </li>
                      )})
                    }
                  </ul>
                )
                : null
              }

          </ul>

          <div className="clearfix"></div>
          <ul className="wallet-list listInfoProduct more">
            <li className="no-bd">
              <span className="pull-left text-info"> <strong>{t('product:motor_right_sumMoney')}</strong> </span>
              <span className="pull-right text-danger"><strong>{formatPrice(sumPrice + disPrice, 'VNĐ', 1)}</strong></span>
              <div className="clear"></div>
            </li>
          </ul>

          <div className="col-md-12 p-r-0">
            <div className="checkbox checkbox-info pull-left col-md-12">
              <input
                disabled = { !!view ? true : false }
                defaultChecked  = { !dataRequest || (!!dataRequest && !!dataRequest.detail.discount) }
                id      = { 'checkbox' }
                onClick = { () => this.props.discountCheckBox({select: this._discountCheckBox, discount}) }
                ref     = { el => this._discountCheckBox = el } type="checkbox" />
              <label htmlFor={'checkbox'} > {t('product:discount')} ({t('product:maximum')} { discount }%) </label>
            </div>
            {
              (!!dataRequest && !!dataRequest.detail.discount) && (
                <div className="pull-left col-md-12 p-r-0">
                  <div className={`col-md-2 p-0`}>
                    <input
                      disabled      = { !!view ?  true : false }
                      defaultValue  = { (!!dataRequest && !!dataRequest.detail.discount) ? dataRequest.detail.discount : discount }
                      onChange      = { this.discountChange }
                      ref           = { e => this._discountSelector = e } 
                      className     = "form-control text-center" />
                  </div>
                  <div className={`col-md-10 p-r-15 m-t-5 `}>
                    <span className="pull-right text-danger">
                      <strong className="fs-11" > {!!disPrice ? `-${formatPrice(disPrice, 'VNĐ', 1)}` : "0 VND"} </strong>
                    </span>
                  </div>
                </div>
              )
            }
          </div>

          {
            !!sumPrice && (
              <ul className="wallet-list listInfoProduct more">
                <li>
                  <span className="pull-left text-info"> <strong>{t(`product:motor_right_sumMoney_after`)}</strong> </span>
                  <span className="pull-right text-danger"><strong>{formatPrice(priceMore + price - disPrice, 'VNĐ', 1)}</strong></span>
                  <div className="clear"></div>
                </li>
              </ul>
            )
          }

          {
            !!sumPriceVAT && (
              <Fragment>
                <div className="col-md-12 p-r-0">
                  <div className="checkbox checkbox-info pull-left col-md-6">
                    <input
                      disabled = { !!view ?  true : false }
                      defaultChecked  = {(!!dataRequest && !!dataRequest.detail.tnds && !!dataRequest.detail.tnds.feeTnds) }
                      id      = { 'tnds' }
                      
                      ref     = { el => this._tnnsCheckBox = el } type="checkbox" />
                    <label htmlFor={'tnds'} > <i className="fa fa-car"></i> TNDS  </label>
                  </div>

                  <div className="pull-left col-md-6 p-t-10 p-r-5">
                    <span className="pull-right text-danger">
                      <strong className="fs-11" > { !!tnds && !!tnds.feeTnds ? formatPrice(tnds.feeTnds, 'VNĐ', 1) : ""}  </strong>
                    </span>
                  </div>
                </div>

                <div className="col-md-12 p-r-0">
                  <div className="checkbox checkbox-info pull-left col-md-6">
                    <input
                      disabled = { !!view ?  true : false }
                      defaultChecked  = {(!!dataRequest && !!dataRequest.detail.connguoi && !!dataRequest.detail.connguoi.sumFee) }
                      id      = { 'connguoi' }
                      
                      ref     = { el => this._connguoiCheckBox = el } type="checkbox" />
                    <label htmlFor={'connguoi'} > <i className="fa fa-user"></i> Con người  </label>
                  </div>

                  <div className="clearfix"></div>
                  
                  {
                    (!!connguoiInput || !!connguoi.fee) && (
                      <div className="row">
                        <div className="col-md-5 p-l-30 people">
                          <input
                            disabled = { !!view ?  true : false }
                            defaultValue = {!!connguoi.price ? _ftNumber.format(connguoi.price, 'number') : ""}
                            // onChange = { this.connguoiChange }
                            ref={e => this._connguoiSelector = e } 
                            className="form-control" />
                        </div>
                        <div className="col-md-2 p-l-0 p-r-0">
                          <input
                            disabled = { !!view ?  true : false }
                            defaultValue = {!!connguoi.numPeo ? connguoi.numPeo : "1"}
                            // onChange = { this.connguoiChange }
                            ref={e => this._peopleSelector = e } 
                            className="form-control text-center" />
                        </div>
                        <div className="col-md-5">
                          <span className="pull-right text-danger m-t-5 p-r-5">
                            <strong className="fs-11" > {!!connguoi.sumFee ? formatPrice(connguoi.sumFee, 'VNĐ', 1) : ""} </strong>
                          </span>
                        </div>
                      </div>
                    )
                  }
                  
                </div>

                <div className="col-md-12 p-r-0">
                  <div className="checkbox checkbox-info pull-left col-md-6">
                    <input
                      disabled = { !!view ?  true : false }
                      defaultChecked  = { (!!dataRequest && !!dataRequest.detail.hanghoa && !!dataRequest.detail.hanghoa.fee) }
                      id      = { 'hanghoa' }
                      // onClick = { this.hanghoaCheckBox(100000) }
                      ref     = { el => this._hanghoaCheckBox = el } type="checkbox" />
                    <label htmlFor={'hanghoa'} > <i className="fa fa-product-hunt"></i> Hàng hoá </label>
                  </div>

                  <div className="pull-left col-md-6 p-t-10 p-r-5">
                    <span className="pull-right text-danger">
                      <strong className="fs-11" > {!!hanghoa.fee ? formatPrice(hanghoa.fee, 'VNĐ', 1) : ""} </strong>
                    </span>
                  </div>
                  
                  <div className="clearfix"></div>
                  {
                    (!!hanghoa.fee) && (
                      <div className="row">
                        <div className={ `col-md-4 p-l-30` }>
                          <input
                            disabled      = { !!view ?  true : false }
                            defaultValue  = { !!hanghoa.payload ? _ftNumber.format(hanghoa.payload, 'number') : "" }
                            onChange      = { this.hangHoaChange }
                            placeholder   = "Trọng tải xe"
                            ref           = { e => this._payloadSelector = e } 
                            className     = {`form-control text-center`} />
                        </div>
                        <div className    = {` col-md-3 p-l-0 ` }>
                          <input
                            disabled      = { !!view ?  true : false }
                            defaultValue  = { !!hanghoa.numPayLoad ? hanghoa.numPayLoad : "1" }
                            onChange      = { this.hangHoaChange }
                            placeholder   = "Trọng tải xe cần bảo hiểm"
                            ref           = { e => this._numPayLoadSelector = e } 
                            className     = {`form-control text-center`} />
                        </div>
                        <div className = { `col-md-5 p-l-0 ` }>
                          <input
                            disabled      = { !!view ?  true : false }
                            defaultValue  = { !!hanghoa.price ? _ftNumber.format(hanghoa.price, 'number') : "" }
                            onChange  = { this.hangHoaChange }
                            ref       = { e => this._priceSelector = e } 
                            className = {`form-control text-center`} />
                        </div>
                      </div>
                    )
                  }

                </div>
              </Fragment>
            )
          }

          {
            !!sumPrice && (
              <ul className="wallet-list listInfoProduct more">
                <li>
                  <span className="pull-left text-info"> <strong>{t('product:motor_fee_befor_vat')}</strong> </span>
                  <span className="pull-right text-danger"><strong>{formatPrice(sumPrice, 'VNĐ', 1)}</strong></span>
                  <div className="clear"></div>
                </li>
              </ul>
            )
          }

          {
            !!priceVAT && (
              <ul className="wallet-list listInfoProduct more">
                <li>
                  <span className="pull-left text-info"> <strong>{t('product:motor_right_vat')}</strong> </span>
                  <span className="pull-right text-danger"><strong>{formatPrice(priceVAT, 'VNĐ', 1)}</strong></span>
                  <div className="clear"></div>
                </li>
              </ul>
            )
          }

          {
            !!sumPriceVAT && (
              <ul className="wallet-list listInfoProduct more">
                <li>
                  <span className="pull-left text-info"> <strong>{t('product:motor_right_money')}</strong> </span>
                  <span className="pull-right text-danger"><strong>{formatPrice(sumPriceVAT, 'VNĐ', 1)}</strong></span>
                  <div className="clear"></div>
                </li>
              </ul>
            )
          }

          {/* <div className="col-md-12 p-l-0">
            <div className="checkbox checkbox-info pull-left col-md-12">
              <input
                disabled = { !!view ? true : false }
                defaultChecked  = { !dataRequest || (!!dataRequest && !!dataRequest.detail.discount) }
                id      = { 'checkbox' }
                onClick = { () => this.props.discountCheckBox({select: this._discountCheckBox, discount}) }
                ref     = { el => this._discountCheckBox = el } type="checkbox" />
              <label htmlFor={'checkbox'} > {t('product:discount')} { discount } % </label>
            </div>
          </div> */}

          <div className="col-sm-12 p-0">
          {

            (!!dataRequest && dataRequest.status === 1)
            ? (
              <Fragment>
                <button onClick={() => this.props.setStateLocal({key: 'idCancel', value: dataRequest.id})} style={{width: '45%', marginRight: '14px'}} className="col-md-6 btn btn-flat btn-danger fcbtn btn-outline btn-1e">
                  Không chấp nhận
                </button>
                <button onClick={() => this.props.setStateLocal({key: 'idSuccess', value: dataRequest.id})} className="col-md-6 btn btn-flat btn-success fcbtn btn-outline btn-1e">
                  Chấp nhận
                </button>
              </Fragment>
              )
            : null
            }

          </div>
          <div className="clear"></div>
        </div>
      </div>
    );
  }
}

export default Right;