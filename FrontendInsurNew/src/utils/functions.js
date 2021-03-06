export function getJsonFromSearch(search) {
  search = search.substr(1);
  var result = {};
   search.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}

export const isEmpty = function (input) {
  if(!input) return true;
  
  if ('push' in input) {
    return input.length === 0;
  }
  return !input || Object.keys(input).length === 0;
}

export const rmv = (str) => {
  if(undefined === str || str == null || str === "") return "";
  str = str.toLowerCase();
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g,"a"); 
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g,"e"); 
  str = str.replace(/ì|í|ị|ỉ|ĩ/g,"i"); 
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g,"o"); 
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g,"u"); 
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g,"y"); 
  str = str.replace(/đ/g,"d");
  str = str.replace(/([^\w]+)|\s+/g,"-");
  str = str.replace(/[-+]/g,"-");
  str = str.replace(/^-+/g,"");
  str = str.replace(/-+$/g,""); 
  return str;
}

export const isFnStatic = function(fun, ...params){
  return fun in window && window[fun] instanceof Function && window[fun](...params);
}

export const getTimeNext = (date, num) => {
  let fullDate = new Date(date);

  let dd      = fullDate.getDate();
  let mm      = fullDate.getMonth();
  let yyyy    = fullDate.getFullYear();

  let nxM = num;
  let nxY = 0;

  if (num > 12) {
    nxY = parseInt( num / 12, 10);
    nxY = (num % 12)
  }

  mm += nxM; 
  yyyy += nxY;

  if (mm > 12) {
    yyyy += parseInt( mm / 12, 10);
    mm = (mm % 12)
  }

  return new Date(yyyy, mm, dd).getTime();

}

export const getTimeNextDay = (date, num = 1) => {
  let timeOneDay = 24*60*60*1000;
  num = !isNaN(num) ? num : 1;
  return date + timeOneDay * num;
}

export const notiSound = function(){
  const sound = require('assets/files/noti.mp3');
  let au = new Audio(sound);
  au.pause();
  au.play();
}