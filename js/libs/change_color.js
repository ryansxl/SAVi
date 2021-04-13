/* Suma el porcentaje indicado a un color (RR, GG o BB) hexadecimal para aclararlo */
const addLight = function(color, amount){
  let cc = parseInt(color,16) + amount;
  let c = (cc > 255) ? 255 : (cc);
  c = (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;
  return c;
}

/* const hexToRGB = (color) => {
  color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
  let colorRGB = [color.substring(0,2)]
} */

/* Aclara un color hexadecimal de 6 caracteres #RRGGBB segun el porcentaje indicado */
const lighten = (color, amount)=> {
  color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
  amount = parseInt((255*amount)/100);
  return color = `#${addLight(color.substring(0,2), amount)}${addLight(color.substring(2,4), amount)}${addLight(color.substring(4,6), amount)}`;
}

/* Resta el porcentaje indicado a un color (RR, GG o BB) hexadecimal para oscurecerlo */
const subtractLight = function(color, amount){
  let cc = parseInt(color,16) - amount;
  let c = (cc < 0) ? 0 : (cc);
  c = (c.toString(16).length > 1 ) ? c.toString(16) : `0${c.toString(16)}`;
  return c;
}

/* Oscurece un color hexadecimal de 6 caracteres #RRGGBB segun el porcentaje indicado */
const darken = (color, amount) =>{
  color = (color.indexOf("#")>=0) ? color.substring(1,color.length) : color;
  amount = parseInt((255*amount)/100);
  return color = `#${subtractLight(color.substring(0,2), amount)}${subtractLight(color.substring(2,4), amount)}${subtractLight(color.substring(4,6), amount)}`;
}


/* Clase para crear comodamente elementos DIV */
class div{
  constructor(type, className, text, color)
  {
    this.type = type;
    this.className = className;
    this.text = text;
    this.color = color;
  }
  render(){
    let tag = document.createElement(this.type);
    tag.setAttribute("class", this.className);
    tag.setAttribute("style", `background-color:${this.color}`);
    tag.textContent = this.text;
    return tag;
  }
}

function rgb2hex(rgb){
 rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
 return (rgb && rgb.length === 4) ? "#" +
  ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
  ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
};

function increase_red_color_shade(hex,percent) // assuming the
{
  // console.log(percent);
  var color = hex2Rgb(hex);

  var r = parseFloat(color.r),
      g = parseFloat(color.g),
      b = parseFloat(color.b),
      val = parseFloat(256*parseFloat(percent/100));
  // console.log(r,g,b);

  // r -= val,
  g -= val,
  b -= val;

  // console.log(r,g,b);
  // console.log(rgb2Hex(Math.ceil(r), Math.ceil(g), Math.ceil(b)));
  return rgb2Hex(Math.ceil(r), Math.ceil(g), Math.ceil(b));
};

function rgb2Hex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);

    function componentToHex(c) {
        var hex = c.toString(16);
        return hex.length == 1 ? "0" + hex : hex;
    }
};

function hex2Rgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
};

// let cajas = document.getElementById("cajas");
// cajas.appendChild(new div('div','caja','Lighten 20%',lighten('#23B19D',20)).render());
// cajas.appendChild(new div('div','caja','Color 100%','#23B19D').render());
// cajas.appendChild(new div('div','caja','Darken 20%', darken('#23B19D',20)).render());
