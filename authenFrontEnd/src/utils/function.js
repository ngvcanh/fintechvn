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

export function getJsonFromSearch(search) {
  search = search.substr(1);
  var result = {};

  search.split("&").forEach(function(part) {
    var item = part.split("=");
    result[item[0]] = decodeURIComponent(item[1]);
  });
  return result;
}