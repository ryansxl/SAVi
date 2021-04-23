/*
 * CLASSES - Frequency
 */

class Frequency {
  constructor(div,dim,range,lense_number) {
    this.lense_number = lense_number;
    let _get_num_ticks = function(){
      if(Math.floor((range.stop - range.start)/2) > 2) return 2;
      else return Math.floor((range.stop - range.start)/2);
    };

    this.num_ticks = _get_num_ticks();
    this.rendering_time = 50;
    this.range = range;

    this._set_margin();

    this.width  = parseFloat(dim.w);
    this.height = parseFloat(dim.h);
    this._set_ranges();
    this._set_svg(div);
    this._define_area();
    this._define_line();

    this._set_focus();
  }

  /*
   * API FUNCTIONS
   */

  /*
  * GETTER FUNCTIONS
  */
  getMargin(){
    return this.margin;
  }
  getXRange(){
    return this.x;
  }
  getYRange(){
    return this.y;
  }
  getWidth(){
    return this.width;
  }
  getHeight(){
    return this.height;
  }
  getArea(){
    return this.area;
  }
  getLine(){
    return this.line;
  }
  getSvg(){
    return this.svg;
  }
  getMaxNumEntities(){
    return this.max_num_entities;
  }
  getGlobalMaxNumEntities(){
    return this.global_max_num_entities;
  }

  /*
  * SETTER FUNCTIONS
  */
   setRange(range){ // range.start, range.stop
     this.range = range;
     return this;
   }
  setHeight(h){
    this.height = parseFloat(h);
    return this;
  }
  setWidth(w){
    const _margin = this.margin;
    this.width    = parseFloat(w) - _margin.left;
    const _n = this.lense_number;
    d3.select("#analysis_view_div_"+_n).select(".chart").attr("width", w+10);
    return this;
  }

  render(freq,max){
    this.global_max_num_entities = max || this.global_max_num_entities;
    this.data = freq || this.data;

    const d = this.data.d,
          init_d = this.data.init_d,
          _this = this;

    this.freq_d = get_data(d);

    let max_num_entities = 0;
    init_d.forEach(function(d){
      if(max_num_entities < d.order) max_num_entities = d.order;
    });
    this.max_num_entities = max_num_entities;

    const padding_bottom  = 10;
    const x = this.getXRange(),
          y = this.getYRange();
    const area = this.getArea(),
          line = this.getLine();
    const height = this.getHeight() - padding_bottom,
          svg = this.svg,
          _range = this.range;
    const _rendering_time = this.rendering_time;

    // generate data

    // scale the range of the data
    x.domain([_range.start,_range.stop]).range([0,this.width]);
//     if(max || $('input[name=Global-Normalization]').prop('checked')) y.domain([0,this.global_max_num_entities]).range([height,padding_bottom]);
//     else  
    y.domain([0,max_num_entities]).range([height,padding_bottom]);
    // add the area
    let a = svg.selectAll('.area')
      .data([this.freq_d]); // must cast as array

    let l = svg.selectAll('.line')
      .data([get_data(init_d)]);

    // enter
    a.enter()
     .append("path")
     .attr("class", "area")
     .transition()
     .duration(_rendering_time)
     .attr("d", area)
     .attr("transform", "translate("+this.margin.left+","+ -padding_bottom+")")
     .style("fill","#d3d3d3");

    // update
    a.transition()
     .duration(_rendering_time)
      .attr("d", area)
      .attr("transform", "translate("+this.margin.left+","+ -padding_bottom+")");

    // exit
    a.exit().remove();

    // enter
    l.enter()
     .append("path")
     .attr("class", "line")
     .transition()
     .duration(_rendering_time)
     .attr("d", line)
     .attr("transform", "translate("+this.margin.left+","+ -padding_bottom+")");

    // update
    l.transition()
     .duration(_rendering_time)
      .attr("d", line)
      .attr("transform", "translate("+this.margin.left+","+ -padding_bottom+")");

    // exit
    l.exit().remove();

    // add the X Axis
    svg.select(".axis-x").remove();
    svg.append("g")
      .attr("class","axis-x")
      .attr("transform", "translate("+this.margin.left+"," + (height-padding_bottom) + ")")
      .call(d3.axisBottom(x).ticks(this.numTicks).tickValues(x.ticks(this.num_ticks).concat(x.domain())).tickFormat(d3.format(".0f")));

    // add the Y Axis
    svg.select(".axis--y").remove();
    svg.append("g")
      .attr("class","axis--y")
      .attr("transform", "translate("+this.margin.left+"," + -padding_bottom + ")")
      .call(d3.axisLeft(y).ticks(5));

    svg.select(".axis-text").remove();

    svg.append("text")
      .attr("class","axis-text")
      .attr("transform", "rotate(-90)")
      .attr("y", 10)
      .attr("x",- (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size","10px")
      .style("fill","#d3d3d3")
      .text("Groups Area");

      function get_data(d){
        let freq_data = [];

        if(d.length > 0){
        //parse this data
          for (let i = _this.range.start; i <= _this.range.stop; i++) {
            let tmp = [];
            let ct = 0;
            d.forEach(function(character){
              if(i >= character.timestep_start && i <= character.timestep_stop){
                ct++;
              }
            })
            tmp["count"]  = ct;
            tmp["x0"]     = i;
            tmp["x1"]     = i+1;
            freq_data.push(tmp);
          }
        }
        if(d.length == 0){
          return [];
        }
        return freq_data;
      }
  }

  onResize(w,d){
    this.setWidth(w);
    this._set_ranges();
    this._define_area();
    this._define_line();
    this.render(d);
    this._set_focus();
  }

  setToGlobal(max){
    this.render(null,max);
  }
  setToLocal(){
    this.render(null,null);
  }

  /*
   * PRIVATE FUNCTIONS
   */

  _set_margin(){
      this.margin = {top: 10, right: 5, bottom: 10, left: 70};
  }
  _set_ranges(){
    this.x = d3.scaleLinear().range([0, this.width]);
    this.y = d3.scaleLinear().range([this.height, 0]);
  }
  _set_svg(_view){
    const _margin = this.margin, _w = this.getWidth(), _h = this.getHeight();
    this.svg = _view.append("svg")
       .attr("width", _w+20)
       .attr("height", _h - _margin.top + _margin.bottom)
       .attr('class','chart')
       .attr("transform","translate(0," + (_margin.top*7) + ")");
  }

  _set_focus(){
    const svg = this.getSvg(),
          w = this.getWidth(),
          h = this.getHeight(),
          x = this.getXRange();

    svg.select(".focus").remove();

    let focus = svg.append("g")
         .attr("class", "focus single-line")
         .style("display", "none");

      focus.append("line")          // attach a line
        .style("stroke", "#d3d3d3")  // colour the line
        .attr("x1", 0)     // x position of the first end of the line
        .attr("y1", 0)      // y position of the first end of the line
        .attr("x2", 0)     // x position of the second end of the line
        .attr("y2", h-14)
        .on("mouseover", function() { focus.style("display", null); });

     const timestep_text = focus.append("text")
          .attr("class","timestep")
          .attr("x",0)
          .attr("y",h - 4)
          .attr("dx", "-.5em")
          .style("font-size","10")
          .style("fill","#d3d3d3");

     const overlay = svg.append("rect")
         .attr("class", "overlay")
         .attr("y",0)
         .attr("width", w)
         .attr("height", h)
         .attr("transform", "translate(70," + (0) + ")")
         .attr("opacity",0)
         .on("mouseover", function() {focus.style("display", null); })
         .on("mouseout", function(d) {
           let x0 = x.invert(d3.mouse(this)[0]),
                j = Math.round(x0);
           hide_timesteps(j);
           d3.select(".timestep-single").remove();
           focus.style("display", "none");
         })
         .on("mousemove", mousemove);

    overlay.raise();

    /*
    Closures
     */
   function mousemove() {
     let x0 = x.invert(d3.mouse(this)[0]), j = Math.round(x0);
     focus.attr("transform", "translate(" + ( x(j) + 70 ) + ",0)");
     timestep_text.text(j);
     timestep_main_chart(j);
   }
  }

  _define_area(){
    const _height = this.getHeight()-10;
    const x       = this.getXRange(), y = this.getYRange();
    const _margin = this.getMargin();

    let area = d3.area()
        .x(function(d,i) { return x(d.x0); })
        .y0(_height)
        .y1(function(d) { return y(d.count); });

    this.area = area;
  }
  _define_line(){
    const x       = this.getXRange(), y = this.getYRange();
    let valueline = d3.line()
        .x(function(d) { return x(d.x0); })
        .y(function(d) { return y(d.count); });

    this.line = valueline;
  }
}

// EGOLINE SVG LAYOUT:
// It's laid out in 12 different sections up to down.

let egoline_graph_height,
    egoline_graph_domain_max,
    egoline_y;

let clicked_line_name_1;

function create_egoline_graph(n,character,svg,bubble,bar_x,clicked_line_name_1,h,w,d0,d1){ // Call this when line is clicked
  svg.selectAll('circle').remove();
  svg.selectAll('text').remove();
  svg.selectAll('.text_label_background').remove();
  svg.selectAll('.egoline_text_label_g').remove();
  svg.selectAll('.clicked_line_name_1_bar').remove();
  svg.selectAll('.egoline_line').remove();
  svg.selectAll("#egoline_svg_ID").remove();
  svg.selectAll("#egoline_ID").remove();
  svg.selectAll("#line_graph").remove();
  svg.selectAll("#egoline_svg_ID").remove();

  // const node = document.getElementById("scarf_plot_"+n)
  // while (node && node.hasChildNodes()) {
  //   node.removeChild(node.lastChild);
  // }
  $("#scarf_plot_"+n).empty();

  let x = d3.scaleLinear().range([0,w-70]).domain([d0,d1]);
  const lense_num = svg.attr("id").replace("analysis_view_","");

  egoline_graph_height = h - 6 - 5;
  egoline_svg = svg
                    .append("svg")
                      .attr("id", "egoline_svg_ID")
                      .append("g")
                      .attr("transform", "translate(" + 0 + "," +3+ ")");

  egoline_graph_domain_max = (characters.length*2) - default_chart_styles.line_thickness - 1; // FIXME: this needs to be dynamic
  egoline_y = d3.scaleLinear()
    .range([egoline_graph_height, 0])
    .domain([0,egoline_graph_domain_max - 1]);

  // d3.select("#analysis_view_div_"+n).add_range_annotations_mouseover(n);

  let egoline = new Egoline({
    egoline_svg:egoline_svg,
    view: svg,
    ego:character,
    scale:{
      y:egoline_y,
      x:x
    },
    range:{
      start:d0,
      stop:d1
    },
    width:w,
    height:egoline_graph_height,
    group_d: bubble,
    lense_num:n
  });

  return egoline.getFrequencyD();
};

class Egoline{
  constructor(settings){
    this.margin = {top:0,bottom:0,right:0,left:70};

    this.lines_svg = settings.egoline_svg;
    this.svg = settings.view;
    this.ego = settings.ego;
    this.scale = settings.scale;
    this.range = settings.range;
    this.width = settings.width - this.margin.left - this.margin.right;
    this.height = settings.height;
    this.group_d = settings.group_d;
    this.lense_number = settings.lense_num;
    this.div = d3.select("#analysis_view_div_"+this.lense_number);
    this._draw_egolines_chart();
  }

  /*
   * GETTERS
   */
   getFrequencyD(){
     return this.frequency_data;
   }
   _get_line_clr(line){
     return $('#' + line + '_color_toggle').val() || "#444444";
   }

  /*
   * DRAW FUNCTIONS
   */
  _draw_egolines_chart(){
    this._draw_ego();
    this._draw_lines_interacting_with_ego();
    this._draw_scarf_plot();
    var line_data = this.get_line_date();
    this.render_line_graph(line_data);
  }
  _draw_scarf_plot(){
    this._render_scarf_plot();
  }
  _draw_lines_interacting_with_ego(){
    this._render_lines_interacting_with_ego(this._get_lines_interacting_with_ego_d());
  }
  _draw_ego(){
    this._render_ego();
  }

  /*
   * DATA PARSING
   */


  get_line_date(){
     const _this = this;
     var d0 = _this.range.start, d1 = _this.range.stop;
     var data = _this.group_d;
     var char = _this.ego;


     data.map(function(d){
         if(+d.timestep_start < d0 && +d.timestep_stop > d1){
           d.timestep_start = d0;
           d.timestep_stop = d1;
         }
         else if(+d.timestep_start >= d0 && +d.timestep_start <= d1 && +d.timestep_stop > d1){
           d.timestep_stop = d1;
         }
         else if(+d.timestep_start < d0 && +d.timestep_stop >= d0 && +d.timestep_stop <= d1){
           d.timestep_start = d0;
         }
     });

     var char_data = data.filter(function(d){ 
        return d.character == char && d.timestep_start >= d0 && d.timestep_stop <= d1;
     })

     var char_group = [];

     char_data.forEach(function(d){
       if(!char_group.includes(d.group)){
         char_group.push(d.group);
       }
     })

     data = data.filter(function(d){
       if(d.character == char) return false;
       return true;
     })

     data = data.filter(function(d){
       if(d.timestep_start > d1 || d.timestep_stop < d0) return false;
       return true;
     })

     var res = [];

     for(let i = d0; i <=d1; i++){
      var num = 0;
      data.forEach(function(d){
        char_data.forEach(function(ch){
            if(ch.group === d.group && ch.timestep_start<=i && ch.timestep_stop >=i && d.timestep_start<=i && d.timestep_stop>=i){
              num+=1;
            }
        })
      })
      res.push({x:i,y:num});
     }

     return res;
  }

   _get_lines_interacting_with_ego_d(){
     const _this = this;
     let order = this._sort_characters(this.range,this.group_d,this.ego);
     this.d = order = order.filter(function(d){return d.character != _this.ego;});
     return order;
   }

   // FIXME:
   // Test case 1: EPiSimS 14th index select range.
   // Test case 2: PNNL Dataset : Dedos_Lidelse and select range.
  _sort_characters(range,data,clicked_line){
    let ret = [];
    const d0 = +range.start, d1 = +range.stop;
    let _this = this;

    //filter out entities
    let filtered_entities = [];
    if(lense_lst[this.lense_number-1]){
      filtered_entities = lense_lst[this.lense_number-1].getFilterEntities();
    }
    else{
      filtered_entities = [];
    }

    //trim
    data.map(function(d){
         if(+d.timestep_start < d0 && +d.timestep_stop > d1){
           d.timestep_start = d0;
           d.timestep_stop = d1;
         }
         else if(+d.timestep_start >= d0 && +d.timestep_start <= d1 && +d.timestep_stop > d1){
           d.timestep_stop = d1;
         }
         else if(+d.timestep_start < d0 && +d.timestep_stop >= d0 && +d.timestep_stop <= d1){
           d.timestep_start = d0;
         }
     });

     //what groups egoline is in during this time interval
     let groups_visited_by_egoline = [];

     const egoline_d = data.filter(function(d){
       return d.character == clicked_line && d.timestep_start >= d0 && d.timestep_stop <= d1;
     });

     egoline_d.forEach(function(d){
       if(!(groups_visited_by_egoline.includes(d.group))){
         groups_visited_by_egoline.push(d.group);
       }
     });

     data = data.filter(function(d){
       if(d.character == clicked_line) return false;
       return true;
     })

     // Chris filtering method
     data = data.filter(function(d){
       if(!filtered_entities.includes(d.character)){
         let together = 0;
         for (let i = d0; i <= d1; i++) {
           egoline_d.forEach(function(g){
             if(_this._in_group(i,d,g)) together++;
           });
         }
         if(together>0){
           return true;
         }
         return false;
       }
       else{
         return false;
       }
     });

     let data_lines = [];

     groups_visited_by_egoline.forEach(function(group){
       const lines = data.filter(function(d){return d.group == group;}),
             groups = egoline_d.filter(function(d){return d.group == group;});

       lines.forEach(function(l){
         groups.forEach(function(g){
           if(!((l.timestep_start < g.timestep_start && l.timestep_stop < g.timestep_start) || (l.timestep_start > g.timestep_stop && l.timestep_stop > g.timestep_stop))){
             if((l.timestep_start <= g.timestep_start && l.timestep_stop >= g.timestep_start) || (l.timestep_stop >= g.timestep_stop && l.timestep_start <= g.timestep_stop)){
               if(!data_lines.includes(l)) data_lines.push(l);
             }
           }
         });
       });
     });

     data = data_lines;

     data.map(function(d){
       egoline_d.forEach(function(ego){
         if(d.group == ego.group){
             if(+d.timestep_start < +ego.timestep_start && +d.timestep_stop > +ego.timestep_stop){
               d.timestep_start = +ego.timestep_start;
               d.timestep_stop = +ego.timestep_stop;
             }
             else if(+d.timestep_start >= +ego.timestep_start && +d.timestep_start <= +ego.timestep_stop && +d.timestep_stop > +ego.timestep_stop){
               d.timestep_stop = +ego.timestep_stop;
             }
             else if(+d.timestep_start < +ego.timestep_start && +d.timestep_stop >= +ego.timestep_start && +d.timestep_stop <= +ego.timestep_stop){
               d.timestep_start = +ego.timestep_start;
             }
         }
       })
     });

     this.groups_lst = egoline_d;

     let character_lst = [],
         char_ar = [];

     data.forEach(function(d){
       if(!(char_ar.includes(d.character))) char_ar.push(d.character);
     });

     this.num_characters_interacting_with_ego = char_ar.length;

     char_ar.forEach(function(d){
       character_lst.push({character: d});
     });

     /*
      SORTING
      */

     // Calculate the timespent in each group with ego
     character_lst.forEach(function(el){
       let time_spent = 0;
       data.forEach(function(d){
         if(el.character == d.character) time_spent = time_spent + (parseInt(d.timestep_stop) - parseInt(d.timestep_start));
       })
       el.time_spent = time_spent;
     });

     character_lst = character_lst.sort(function(a, b){
       if (a.time_spent < b.time_spent) {return -1;}
       if (a.time_spent > b.time_spent) {return 1;}
       if (a.time_spent == b.time_spent) {return 0;}
       if (a.character < b.character) {return -1;}
       if (a.character > b.character) {return 1;}
     });

     for (let i = 0; i < character_lst.length; i++) {
       for (let j = 0; j < data.length; j++) {
         if(character_lst[i].character == data[j].character) data[j].order = i+1;
       }
     }
    return data;
   }

   _in_group(timestep,line_d,group_d){
     return timestep >= line_d.timestep_start && timestep <= line_d.timestep_stop && timestep >= group_d.timestep_start && timestep <= group_d.timestep_stop;
   }

  _get_SP_d(data,clicked_line){
     var SP_data = [];
     data.forEach(function(curr,i,ar){
       if(curr.character === clicked_line){
         SP_data.push(curr);
       }
     })
     SP_data.sort(function(l,r){
       return l.timestep_start - r.timestep_start;
     })
     return SP_data;
   };

  /*
   * RENDERING FUNCTIONS
   */

   _render_scarf_plot(){
     const  _this = this,
            _x = this.scale.x,
            svg = d3.select("#scarf_plot_"+this.lense_number);

    //Groups Label
    svg
     .append("text")
     .attr("x",0)
     .attr("y",0)
     .attr("dy", "0em")
     .attr("transform","translate(70,20)")
     .style("fill","#d3d3d3")
     .style("font-size","11px")
     .text("- - Groups "+'"'+_this.ego+'"'+" visits in "+_this.range.start+" to "+_this.range.stop+" - -");


    svg
     .append("text")
     .attr("x",0)
     .attr("y",0)
     .attr("dy", "0em")
     .attr("transform","translate(0,20)")
     .style("fill","#d3d3d3")
     .style("font-size","14px")
     .text("Groups");

    //  svg
    //   .append("text")
    //   .attr("x",0)
    //   .attr("y",0)
    //   .attr("dy", "1em")
    //   .attr("transform","translate(40,0)")
    //   .style("fill","#d3d3d3")
    //   .style("font-size","11px")
    //   .text(_this.ego);
    //
    // svg
    //  .append("text")
    //  .attr("x",0)
    //  .attr("y",0)
    //  .attr("dy", "2em")
    //  .attr("transform","translate(40,0)")
    //  .style("fill","#d3d3d3")
    //  .style("font-size","11px")
    //  .text("visits.");

     let _lense_label =  d3.select("#lense_label_"+_this.lense_number),
         d = this.groups_lst;
     svg.selectAll(".scarf-plot")
       .data(d)
     .enter().append("rect")
       .attr("class", function(d){return "scarf-plot "+d.group;})
       .attr("x", function(d) { return _x(+d.timestep_start) + _this.margin.left; })
       .attr("width", function(d) {
         if(_x(+d.timestep_stop) - _x(+d.timestep_start) < 0) return 0;
         if(d.timestep_start === _this.range.stop){
           return 0;
         }
         if(d.timestep_stop === _this.range.stop){
           return _x(+d.timestep_stop) - _x(+d.timestep_start) - 3;
         }
         return _x(+d.timestep_stop+1) - _x(+d.timestep_start) - 3;
       })
       .attr("y", 50)
       .attr("height", 15)
       .attr("fill", function(d){
         return groupcolors[d.group];
       })
       .attr("rx",3)
       .attr("ry",3)
       .on("mouseover", function(d) {
         on_mouseover_group(d.group);
         _lense_label.text(d.group);
       })
       .on("mouseout", function(d) {
         on_mouseout_group();
         _lense_label.text(lense.placeholder_text);
       })
       .style('opacity','0.7')
       .style('stroke',function(d){
          return groupcolors[d.group];
       })
       .style('stroke-width', "2.0px");

       svg.selectAll(".scarf-plot-label")
          .data(d)
        .enter().append("text")
        .attr("class","scarf-plot-label")
        .attr("x", function(d) { return _x(+d.timestep_start) + _this.margin.left; })
        .attr("y", 40)
        .style("fill",function(d){
           return groupcolors[d.group];
        })
        .on("mouseover",function(d){
            svg.selectAll(".scarf-plot-label").style("opacity","0");
            d3.select(this).style("opacity","1").style("font-size","12px").text(d.group);
            _lense_label.text(d.group);
            on_mouseover_group(d.group);
        })
        .on("mouseout", function(d){
             svg.selectAll(".scarf-plot-label").style("opacity","1");
             d3.select(this).style("font-size","8px").text(format_text(d));
             _lense_label.text(lense.placeholder_text);
             on_mouseout_group();
        })
        .style("font-size","8px")
        .text(format_text);

        /*
        Closures
         */
         function format_text(d){
           d3.select(this).style("font-size","8px");
           const px_len = +d.timestep_stop - +d.timestep_start;

           if(px_len == 0) return  d.group.slice(0,1) + "..";
           if(d.group.length > px_len) return d.group.slice(0,px_len) + "..";

           return d.group;
         }
   }


  render_line_graph(data){

    const _this = this;
    var d0 = _this.range.start, d1 = _this.range.stop;
    let num_characters = parseFloat(this.num_characters_interacting_with_ego);
    let _lense_label =  d3.select("#lense_label_"+this.lense_number);
    var max_num = 0;
    data.forEach(function(d){
      if(d.y > max_num){
        max_num = d.y;
      }
    })

  egoline_svg
     .append("text")
     .attr("x",0)
     .attr("y",52)
     .style("fill","#d3d3d3")
     .style("font-size","14px")
     .text("Entities");

  egoline_svg
     .append("text")
     .attr("x",10)
     .attr("y",72)
     .style("fill","#d3d3d3")
     .style("font-size","14px")
     .text("Size");


  egoline_svg
     .append("text")
     .attr("x",70)
     .attr("y",52)
     .attr("dy", "0em")
     .style("fill","#d3d3d3")
     .style("font-size","11px")
     .text("- - Size of Entities related to "+ _this.ego +" - -");


    let x = this.scale.x,
        y = d3.scaleLinear().domain([0,max_num]).range([130,60]);

    let area = d3.area()
      .curve(d3.curveCatmullRom)
      .x(function(d,i) {return x(d.x)+_this.margin.left;})
      .y0(function(d) {return 130;})
      .y1(function(d) {return y(d.y);});


    var line_area = egoline_svg
      .append("path")
      .attr("class", "line_graph")
      //.attr("transform", "translate(0,10)")
      //.attr("id", function(d) { return group_name; })
      .style("fill", function(d) { return "#d3d3d3"; })
      .style("opacity",function() { return 0.7; })
      .attr("d", area(data));


    var area_axis = egoline_svg.append("g")
        .attr("id", "line_graph_y_axis_ID")
        .attr("class", "y_axis")
        .attr("transform", "translate(70,0)")
        .call(d3.axisLeft(y).ticks(Math.min(4,max_num)));


    var area_axis2 = egoline_svg.append("g")
        .attr("id", "line_graph_x_axis_ID")
        .attr("class", "x_axis")
        .attr("transform", "translate(70,130)")
        .call(d3.axisBottom(x).ticks(4).tickFormat(""));

     var now_pos =   egoline_svg.append("line")          // attach a line
          .style("stroke", "#696969")  // colour the line
          .attr("x1", 70)     // x position of the first end of the line
          .attr("y1", 55)      // y position of the first end of the line
          .attr("x2", 70)     // x position of the second end of the line
          .attr("y2", 135)
          .attr("transform", "translate(0," + 0 + ")")
          .style("opacity",0.7)
          .style("display", "none");

    var cur_pos =  egoline_svg.append("text")
            .attr("class","timestep")
            .attr("x",70)
            .attr("y",143)
            .attr("dx", "-.5em")
            .attr("transform", "translate(0," + 0 + ")")
            .style("font-size","10px")
            .style("fill","#696969")
            .style("opacity",0.7)
            .style("display", "none");

    const overlay = egoline_svg.append("rect")
                       .attr("class","overlay")
                       .attr("x",70)
                       .attr("y",55)
                       .attr("width",x(d1)-x(d0))
                       .attr("height",75)
                       .attr("opacity",0)
                       .on("mouseover",function(){
                       })
                       .on("mouseout",function(){
                          _lense_label.text("");
                          now_pos.style("display", "none");
                          cur_pos.style("display", "none");
                       })
                       .on("mousemove",function(){
                         let x0 = x.invert(d3.mouse(this)[0] - 70),
                          j = Math.round(x0);
                         let i = data[j - d0].y;
                          _lense_label.text("Time : "+" - > "+j+" - > " +i+ " Entities");
                          
                          now_pos.attr("transform", "translate(" + x(j) +","+ 0 + ")")
                          now_pos.style("display", "");
                          cur_pos.attr("transform", "translate(" + x(j) +","+ 0 + ")")
                          cur_pos.text(j);
                          cur_pos.style("display", "");


                       })

  }

   _render_lines_interacting_with_ego(data){
     let num_characters = parseFloat(this.num_characters_interacting_with_ego);
     const offset = 160,
          spacing = 10,
          _h = this.height,
          _x = this.scale.x,
          _this = this,
          init_data = data;

     let _lense_label =  d3.select("#lense_label_"+this.lense_number), height_of_lines = num_characters*spacing, num_lines_removed = 0, frequency_data = [];

     while(height_of_lines > _h - offset - 25 ){
       num_lines_removed++;
       frequency_data = frequency_data.concat(data.filter(function(d){ return d.order == num_lines_removed;}));
       data = data.filter(function(d){ return d.order != num_lines_removed;});
       height_of_lines -= spacing;
     }

     const num_characters_left = function(){
       const n = num_characters - num_lines_removed - 1;
       if(n >= 0) return n;
       return 0;
     }

     const line = d3.line()
                 .x(function(d){return _x(d.x) + _this.margin.left;})
                 .y(function(d){return (d.y*spacing) + offset;});

    let show_str = function(){
      if(num_characters>0) return "- - Showing "+(num_characters_left())+" out of "+(num_characters-1)+" lines from timestep "+_this.range.start+" to "+_this.range.stop + " - -";
      else return "No Entities to Show";
    };

    // Entities Label
    egoline_svg
     .append("text")
     .attr("x",0)
     .attr("y",155)
     .style("fill","#d3d3d3")
     .style("font-size","14px")
     .text("Entities");

     egoline_svg
      .append("text")
      .attr("x",70)
      .attr("y",155)
      .style("fill","#d3d3d3")
      .style("font-size","11px")
      .text(show_str);

     egoline_svg.append("g")
         .attr("class", "interacting_entity_lines")
         .selectAll(".interacting_entity_line")
         .data(data)
         .enter()
         .append("path")
         .attr("class", function(d){ return "egoline_line "+d.character})
         .attr("d", function(d) {
           let t;
           if(d.timestep_start == d.timestep_stop) t = [{x: parseFloat(d.timestep_start), y: parseFloat(d.order) - num_lines_removed}, {x: parseFloat(+d.timestep_stop+1), y: parseFloat(d.order) - num_lines_removed}];
           else t = [{x: parseFloat(d.timestep_start), y: parseFloat(d.order) - num_lines_removed}, {x: parseFloat(d.timestep_stop+1), y: parseFloat(d.order) - num_lines_removed}];
           if(d.timestep_start === _this.range.stop){
             t=[{x:0,y:0},{x:0,y:0}];
             return line(t);
           }
           if(d.timestep_stop  === _this.range.stop){
             t = [{x: parseFloat(d.timestep_start), y: parseFloat(d.order) - num_lines_removed}, {x: parseFloat(d.timestep_stop), y: parseFloat(d.order) - num_lines_removed}];
           }
           return line(t);
         })
         .on("mouseover", function(d) {
           fade_line(d.character,0.15);
           _lense_label.text(d.character);
         })
         .on("mouseout", function(d) {
          fade_line(null,0.65);
          d3.select("#storylines_g_child").selectAll(".group").style("opacity",0.3);
           _lense_label.text(lense.placeholder_text);
         })
         .style("stroke", "#d3d3d3")
         .style("stroke-width", "4px");

       egoline_svg.append("g")
           .attr("class", "interacting-entity-lines-text")
           .selectAll(".interacting-entity-lines-text")
           .data(remove_duplicate_text(data))
           .enter()
           .append("text")
           .attr("x",function(d){
             return 0;
           })
           .attr("y",function(d){
             return ((parseFloat(d.order) - num_lines_removed)*spacing) + offset;
           })
           .attr("dy","0.55em")
           .on("mouseover", function(d) {
             // d3.select("#analysis_view_div_"+_this.lense_number).selectAll("."+d.character).transition().attr("transform","translate(30,0)");
             d3.select(this).transition().text(d.character);
             fade_line(d.character,0.15);
             _lense_label.text(d.character);
           })
           .on("mouseout", function(d) {
             // d3.select("#analysis_view_div_"+_this.lense_number).selectAll("."+d.character).transition().attr("transform","translate(0,0)");
             if(d.character.length > 8)
                d3.select(this).transition().text(d.character.slice(0,8) + "...");
             else{
                d3.select(this).transition().text(d.character);
             }
            fade_line(null,0.65);
            d3.select("#storylines_g_child").selectAll(".group").style("opacity",0.3);
             _lense_label.text(lense.placeholder_text);
           })
           .style("fill", function(d){ return _this._get_line_clr(d.character);})
           .style("font-size", "11px")
           .text(function(d){
             if(d.character.length > 8)
              return d.character.slice(0,8) + "...";
            return d.character;
           });

        this.frequency_data = {
          d:frequency_data,
          init_d: init_data
        };

        function remove_duplicate_text(data){
          return data.filter((thing, index, self) =>
             index === self.findIndex((t) => (
               t.character === thing.character && t.order === thing.order
             ))
           )
        };

   }

   _render_ego(){
     const _w = this.width, _h = this.height;
     const _svg = this.lines_svg;
     const clr = this._get_line_clr(this.ego);
     const _lense_num = this.lense_number;
     const _this = this;

      let _lense_label =  d3.select("#lense_label_"+_lense_num);

      let line = d3.line()
                  .x(function(d){ return d + _this.margin.left; })
                  .y(_h);

      // _svg.append("path")
      //      .datum([0,_w])
      //      .attr('id','egoline_ID')
      //      .attr("d", line)
      //      .on("mouseover",function(){
      //        fade_line(_this.ego,0.15);
      //        _lense_label.text(_this.ego);
      //      })
      //      .on("mouseout",function(){
      //        fade_line(null,0.7);
      //        _lense_label.text(lense.placeholder_text);
      //      })
      //      .style('stroke',clr)
      //      .style('stroke-width','10px')
      //      .raise();

        _svg.append("text")
          .attr("x",45)
          .attr("y",function(d){
            return _h + 4;
          })
          .style("font-size", "12px")
          .text("Analyzing entities that interact with: ")
          .style("fill","#d3d3d3")

       _svg.append("text")
           .attr("class", "ego-text")
           .attr("x",240)
           .attr("y",function(d){
             return _h + 2;
           })
           .attr("dy","0.2em")
           .on("mouseover",reveal_text)
           .on("mouseout", function() {
              // _svg.select("#egoline_ID").transition().attr("transform","translate(0)");
            fade_line(null,0.65);
            d3.select("#storylines_g_child").selectAll(".group").style("opacity",0.3);
              // if(_this.ego.length > 5)
              //     d3.select(this).transition().text(_this.ego.slice(0,5) + "...");
              // else{
              //     d3.select(this).transition().text(_this.ego);
              // }
             on_mouseout_entity();
             _lense_label.text(lense.placeholder_text);
           })
           .style("font-size", "12px")
           .text(function(){
             // if(_this.ego.length > 5)
             //  return _this.ego.slice(0,5) + "...";
            return "  " + _this.ego + "";
           });

           /*
           Closures
            */

          function reveal_text(d){
            // d3.select(this).transition().text(_this.ego);
            // _svg.select("#egoline_ID").transition().attr("transform","translate(60)");
            _lense_label.text(_this.ego);
            fade_line(_this.ego,0.15);
          }
   }

  _add_text_label(svg,character,id,xpos){
         let text_label_g = svg.append("g").attr('class','egoline_text_label_g');


         let text = text_label_g.append("text")
             .attr("x", xpos)
             .attr("dy", (10/2) - 1);

         text
             .attr("class", "egoline_text_label"+storyboard_list.length)
             .attr("font-size","10");

         text.append("textPath")
               .style('stroke',rgb2hex(d3.select("."+character).style('stroke')))
               .attr('opacity',0.8)
               .attr("xlink:href",id)
               .text(character);
         let texts = document.getElementsByClassName("egoline_text_label"+storyboard_list.length);
         let svgNS ="http://www.w3.org/2000/svg";
         for (let i=0, max= texts.length; i<max; i++) {

             var t = texts[i];

             var g = document.createElementNS(svgNS, "g");


             for (let j=0, nchar=t.getNumberOfChars(); j<nchar; j++) {
                 var r = t.getExtentOfChar(j);
                 var re = document.createElementNS(svgNS, "rect");
                 re.setAttribute("class", "text_label_background");

                 if(r.width < r.height){
                   re.setAttribute("width", r.width + default_chart_styles.line_thickness + "px");
                   re.setAttribute("height", r.height - 1 +"px");
                   re.setAttribute("x", r.x - default_chart_styles.line_thickness/2 + "px");
                   re.setAttribute("y", r.y + "px");
                 }
                 else{
                   re.setAttribute("width", r.width + "px");
                   re.setAttribute("height", r.height + default_chart_styles.line_thickness + "px");
                   re.setAttribute("x", r.x + "px");
                   re.setAttribute("y", r.y - default_chart_styles.line_thickness/2+ "px");
                 }

                 g.insertBefore(re, null);
             }

             t.parentNode.insertBefore(g, t);
         }
   }


} // END CLASS EGOLINE
  