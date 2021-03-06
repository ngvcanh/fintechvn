import React, { Component } from 'react';
import {  Container, Grid, Tab, Form, Header, Segment } from 'semantic-ui-react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { Loading, Error404 } from 'components';
import { withNotification } from 'components';
import { actions as productActions } from 'modules/product';
import { actions as productDetailActions } from 'modules/productDetail';
import FormData from './Form';
import { checkData } from 'libs/checkData';
import $ from 'jquery';
import { formatPrice } from 'utils/format';

class Product extends Component {
  constructor(props){
    super(props);
    this.state = {
      price: null
    }
  }

  componentDidMount(){
    let { product, productActions, productDetail, productDetailActions }  = this.props;

    if(product.ordered.length === 0) productActions.fetchAll();
    if(productDetail.ordered.length === 0) productDetailActions.fetchAll(
      {
        include: [
          {relation: "users", scope: { fields: { firstname: true, lastname: true }}},
          {relation: "product", scope: { fields: { name: true }}},
        ],
        order: "id DESC"
      }, 0, 0, {or : [{status: 2}, {status: 1}, {status: 3}] }
    );

    document.title = "Product";
  }
  
  handleError = (error) => {
    let { notification } = this.props;
    notification.e('Error', error.messagse);
  }

  handleSuccess = (data) => {
    this.props.history.push(`/requests/edit/${data.id}`);
  }

  handelSubmitProduct = () => {
    let result = checkData('formProduct');

    if(result.error.length === 0){
      let { profile, productDetailActions, match } = this.props;
      let { id } = match.params;
      
      let data = {
        detail      : {...result.data},
        created_by  : profile.info.id,
        product_id  : id,
        agency_id   : profile.info.agency,
        create_at   : Date.now()
      }
      
      productDetailActions.create(data)
        .then(res => {
          if(res.error) return Promise.reject(res.error);
          this.handleSuccess(res.data);
        }, e => Promise.reject(e))
        .catch(e => this.handleError(e))
    };
    
  }

  handelgetPrice = () => {
    let price = $('input[name=sum_insured]').val();
    price = parseInt(price, 10);
    if(price > 0){
      price = (price * 1.5 / 12);
      price = parseInt(price, 10);
      this.setState({price});
    }
  }

  getPrice = () => {
    let { price } = this.state;
    let { t } = this.props;

    if( price && price > 0){
      return (
      <h2 style={{fontSize: '30px'}} className="text-right priceFinal">
        {formatPrice(price, '')}
        <sup className="h5"> VND / năm</sup>
      </h2>)
    }
    return (
      <p className="text-right">
        <i>{t('product:pleasePrice')}</i>
      </p>
    )
  }

  render() { 
    let { t, product, productDetail, match } = this.props;
    if(product.isWorking || productDetail.isWorking) return (<Loading />);

    let { id } = match.params;
    let data = product.data[id];
    if(!data) return (<Error404 />);

    let panes = [
      { menuItem: t('product:tabProduct'), render: () => <Tab.Pane> <FormData data={data} t={ t } /> </Tab.Pane>   },
    ]
    return (
      <Form method="post" id="formProduct" onSubmit={this.handelSubmitProduct}>
        <Container style={{padding: '15px'}} fluid>
          <Grid columns={2} divided>
            <Grid.Row>
              <Grid.Column  width={12} >
                <Tab panes={panes} />
              </Grid.Column>
              <Grid.Column width={4}>
                <Segment style={{marginBottom: '2px'}} className="product-price">
                  <Header as='h4'>{t('product:premium')}</Header>
                  {this.getPrice()}
                </Segment>
                <button type="button" onClick={this.handelgetPrice} className="btn btn-primary btn-block btn-flat"> <i style={{marginRight: '5px'}} className="fa fa-usd" ></i>{t('product:getPriect')}</button>
                <button type="submit" className="btn btn-primary pull-right m-t-5 btn-flat"> <i style={{marginRight: '5px'}} className="fa fa-floppy-o" ></i> {t('product:btnSave')}</button>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Container>
      </Form>
    );
  }
}

let mapStateToProps = (state) => {
  let { product, productDetail, profile } = state;
  return { product, productDetail, profile };
};

let mapDispatchToProps = (dispatch) => {
  return {
    productActions        : bindActionCreators(productActions, dispatch),
    productDetailActions  : bindActionCreators(productDetailActions, dispatch),
  };
};

export default withNotification(translate('product')(connect(mapStateToProps, mapDispatchToProps)(Product)));