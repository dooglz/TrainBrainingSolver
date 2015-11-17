function Exists(i) {
  return (i !== undefined && i !== null);
}
function Empty(str) {
  if(str.length == 0){return true;}
  if(str.length == 1 && str.charCodeAt(0) < 46){return true;}
}


// base = [[a][b][c]], addition = [[q],[r],[t]]
// result = [[a,q][b,r][c,t]]
// base = [[a][b], addition = [[q],[r],[t]]
// result = [[a,q][b,r][t]]
function Horizontal2DMerge(base,addition) {
  for (var i = 0; i < addition.length; i++) {
    if(!Exists(base[i])){
      base.push([]);
    }else if( !$.isArray(base[i])){
      base[i] = [base[i]];
    }
    base[i].push(addition[i]);
  }
}

function cumulative(arr) {
  for (var i = 1; i < arr.length; i++) {
    arr[i] += arr[i-1];
  }
}
function cumulative2D(arr) {
  for (var i = 1; i < arr.length; i++) {
    for (var j = 0; j < arr[i].length; j++) {
      console.log(arr[i][j],arr[i-1][j]);
      arr[i][j] += arr[i-1][j];
      console.log(arr[i][j],arr[i-1][j]);
    }
  }
}


function Flatten2D(arr) {
  var a = [];
  for (var i = 0; i < arr.length; i++) {
    a = a.concat(arr[i]);
  }
  return a;
}


function Sanitise(str) {
  if ($.type(str) === "string") {
    return str.replace(/^ +| +$|( ) +/, "");
  } else {
    return str;
  }
}

function IsDate(datestring) {
  //checks to see if string begins with "yyyy-mm-dd", "yyyy-m-dd" and "01 < mm < 12"
  var dateRegEx = /^\d{4}-([1-9]|0\d|1[0-2])-([0-3][1-9]|[1-9])/;
  return ((dateRegEx.test(datestring)) && (new Date(datestring) !== "Invalid Date") && (!isNaN(new Date(datestring))));
}
function IsNumber(numberString) {
  //will return true on "1234","0.123","1234.1234" and "1234.1234f",
  var numberRegEx = /^(([0-9]+)||([0-9]+\.[0-9]+f?))$/;
  return ((numberRegEx.test(numberString)) && (!isNaN(parseFloat(numberString))));
}