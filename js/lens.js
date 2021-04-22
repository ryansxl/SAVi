let lense_lst = [],
    timestep_marker_lst = [],
    num_lenses = 0;

const lense = {
  "height" : {
    "group":430,
    "single line":450,
    "outlier":500,
    "trend":340,
    "context":300,
    "flow":300
  },
  "width" : {
    "group":440,
    "single line":350,
    "outlier":510,
    "trend":750,
    "context":300,
    "flow":300
  },
};

class LenseAxis{
  constructor(container,settings){

    let _get_width = function(){
      if(settings.type == "group") return +settings.width - 60;
      if(settings.type == "single line") return +settings.width - 70;
      else return +settings.width;
    }

    let _get_left = function(){
      if(settings.type == "group") return +settings.left + 63 || 0;
      if(settings.type == "single line") return 70;
      else return +settings.left || 0;
    }
    // Assume that container is a div
    // settings: width, height, top, left, numTicks, id, range
    this.type       = settings.type;
    this.width      = _get_width();
    this.height     = settings.height;
    this.bottom     = settings.bottom || 0;
    this.left       = _get_left();
    this.id         = settings.id;
    this.range      = settings.range;
    this.numTicks   = this._get_num_ticks();
    this.container  = container;

    this.div        = this._set_div();
    this.svg        = this._set_svg();
    this.scale      = this._set_scale(this.width);

    this._set_axis();
  }

  /*
   * API FUNCTIONS
   */

  resizeAxis(d){ // Assume d: width, height
    if(this.type == "outlier" || this.type == "trend"){
      var _w = parseFloat(d.width);
      this.height = d.height || this.height;
    }
    else if(this.type == "single line"){
      var _w = parseFloat(d.width) - 70;
      this.height = d.height || this.height;
    }
    else{
      var _w = parseFloat(d.width) - 60;
      this.height = d.height || this.height;
    }
    const _x = this.scale.range([0,_w]);
    this.div.style("width",(_w+20)+"px");

    this.numTicks = this._get_num_ticks();
    this.scale = this._set_scale(this.width);

    if(this.type == "outlier"){
      this.axis.call(d3.axisBottom(_x).ticks(this.numTicks).tickValues(_x.ticks(0).concat(_x.domain())).tickFormat(d3.format(".0f")));
      this.svg.select(".lense-axis").select(".domain").style("opacity",0);
      this.svg.select(".lense-axis").selectAll("line").style("opacity",0);
    }
    else{
      this.axis.call(d3.axisBottom(_x).ticks(this.numTicks).tickValues(_x.ticks(this.numTicks).concat(_x.domain())).tickFormat(d3.format(".0f")));
    }
    this.width = _w;
    return this;
  }

  /*
   * PRIVATE FUNCTIONS
   */

   _get_num_ticks(){
     if(Math.floor((this.range.stop - this.range.start)/2) > 2) return 2;
     else return Math.floor((this.range.stop - this.range.start)/2);
   }

   /*
    * GETTER FUNCTIONS
    */
  _set_div(){
    let _container = this.container;
    let div = _container.append("div")
      .attr("class","lense-axis-div")
      .style("position","absolute")
      .style("width",this.width+3+"px")
      .style("height",this.height+"px")
      .style("left",this.left+"px");

    if(this.type === "single line"){
      div.style("top","120px");
    }else{
      div.style("bottom",this.bottom+"px");
    }

    this.div = div;
    return div;
  }
  _set_svg(){
    let svg = this.div.append("svg")
      .attr("class","lense-axis-svg")
      .style("width","100%")
      .style("height",this.height+"px");

    this.svg = svg;
    return svg;
  }
  _set_scale(w){
    const _range = this.range, _w = w;
    let x = d3.scaleLinear()
      .domain([_range.start,_range.stop])
      .range([0,_w-15]);
    this.scale = x;
    return x;
  }

  /*
   * SETTER FUNCTIONS
   */
  _set_axis(){
    const _x = this.scale, _numTicks = this.numTicks;

    this.axis = this.svg.append("g")
      .attr("class","lense-axis")
      .attr("transform", "translate(10," + (this.height/3) + ")");

    if(this.type == "outlier"){
      this.axis.call(d3.axisBottom(_x).ticks(_numTicks).tickValues(_x.ticks(0).concat(_x.domain())).tickFormat(d3.format(".0f")));
      this.svg.select(".lense-axis").select(".domain").style("opacity",0);
      this.svg.select(".lense-axis").selectAll("line").style("opacity",0);
    }
    else{
      this.axis.call(d3.axisBottom(_x).ticks(_numTicks).tickValues(_x.ticks(_numTicks).concat(_x.domain())).tickFormat(d3.format(".0f")));
    }
    return this;
  }

  set_range(d){
    this.range = d;
    return this;
  }
}


class TimestepSignature{
  constructor(svg,timestep_start,timestep_stop){
    const container = d3.select(".timestep-signature-container"),
          height = +container.attr("height")/2;

    console.log('diyi');

    this.initial = {
      height:height,
      position:{
        x:parseFloat(d3.select('.selection').attr('x')),
        // y:parseFloat($(window).height()-155)+15+timestep_marker_dy
        y:+container.attr("y") + (container.attr("height") - height)/2
      },
      width:parseFloat(d3.select('.selection').attr('width')),
      chart_width: $("#scale_x_row").slider("value")
    };

    this.id = 'timestep_marker_'+String(storyboard_list.length+1);
    this.Create(svg);
    this.range = {start:timestep_start, stop:timestep_stop};
    this.lense_num = String(storyboard_list.length+1);
    this.scale = d3.scaleLinear()
      .domain([0, this.initial.chart_width])
      .range([0, this.initial.chart_width]);
  }

  getMarker(){
    return this.marker;
  }

  Create(svg){
    const _h = this.initial.height,
          _w = this.initial.width,
          _x = this.initial.position.x,
          _y = this.initial.position.y,
          _id = this.id;

    const _storylines_g_child = d3.select("#storylines_g_child");

    this.marker = _storylines_g_child.append("svg").append('rect');

    this.marker
        .attr('class','timestep_marker')
        .attr('id',_id)
        .attr('x',_x)
        .attr('y',d3.select('.selection').attr('y'))
        .attr('height',d3.select('.selection').attr('height'))
        .attr('width',_w)
        .attr('fill',d3.select('.selection').attr('fill'))
        .attr('fill-opacity', 0.3)
        .attr('stroke',d3.select('.selection').attr('stroke'))
      .transition().duration(500)
        .attr('y', _y)
      // .transition().duration(200)
        .attr('height',_h);

        // .attr("transform", "translate(" + (0) + "," + (storylines_g_margin.bottom + ($("#scale_y_row").slider("value")) - storyline_height - graph_margin.top) + ")");

    // timestep_marker_dy += 15;
  };

  transform(width){
    const x_scale = rescaled_graph_x||graph_x;

    let scale = d3.scaleLinear()
      .domain(x_scale.domain())
      // .range()
      .range([20,d3.max(x_scale.range())+20]);

    scale.clamp(true);

    this.initial.position.x = scale(this.range.start);
    this.initial.width      = scale(this.range.stop) - scale(this.range.start);
    //console.log(this.initial.position.x,this.initial.width);
    this.marker
      .transition()
      .attr("x",this.initial.position.x)
      .attr('width',this.initial.width);
  };

  update_range(range){
    const x_scale = rescaled_graph_x||graph_x;

    this.range              = range;
    this.initial.position.x = x_scale(range.start);
    this.initial.width      = x_scale(range.stop) - x_scale(range.start);

    this.marker
        .transition()
        .attr("x",this.initial.position.x)
        .attr('width',this.initial.width);
  };
}

class TimestepSignature2D{
  constructor(svg,d){
    const x_scale = rescaled_graph_x||graph_x,
          y_scale = rescaled_graph_y||graph_y;

    this.position = {
      unscaled:d,
      scaled:{
        x: {
          min:x_scale.invert(d.x.min),
          max:x_scale.invert(d.x.max)
        },
        y: {
          min:y_scale.invert(d.y.min),
          max:y_scale.invert(d.y.max)
        }
      }
    };

    this.id = 'timestep_marker_'+String(storyboard_list.length+1);
    this.Create(svg);
    this.lense_num = String(storyboard_list.length+1);
  }

  getMarker(){
    return this.marker;
  }

  Create(svg){
    const _h = this.position.unscaled.y.max - this.position.unscaled.y.min,
          _w = this.position.unscaled.x.max - this.position.unscaled.x.min,
          _x = this.position.unscaled.x.min,
          _y = this.position.unscaled.y.min,
          _id = this.id;

    const _storylines_g_child = d3.select("#storylines_g_child");

    this.marker = _storylines_g_child.append('rect');

    this.marker
        .attr('class','timestep_marker')
        .attr('id',_id)
        .attr('x',_x)
        .attr('y', _y)
        .attr('width',_w)
        .attr('height',_h)
        .attr('fill',d3.select('.selection').attr('fill'))
        .attr('fill-opacity', 0.3)
        .attr('stroke',d3.select('.selection').attr('stroke'))
        .attr("transform", "translate(" + (0) + "," + 0 + ")")
  };

  transform(){
    const x_scale = rescaled_graph_x||graph_x,
          y_scale = rescaled_graph_y||graph_y;

    const _h = y_scale(this.position.scaled.y.max) - y_scale(this.position.scaled.y.min),
          _w = x_scale(this.position.scaled.x.max) - x_scale(this.position.scaled.x.min),
          _x = x_scale(this.position.scaled.x.min),
          _y = y_scale(this.position.scaled.y.min);

    this.marker
        .attr('x',_x)
        .attr('y', _y)
        .attr('width',_w)
        .attr('height',_h)
        .attr("transform", "translate(" + (0) + "," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")");
  };
}

class Lense {
  constructor(analysis_type,x,y,group_name,character,d0,d1){
    console.log('disan');
    this.deleted        = false;
    this.type           = analysis_type;
    this.position       = {"x":x,"y":y};
    this.selected_range = {"start":d0,"stop":d1};
    this.character      = character;
    this.lense_number   = storyboard_list.length+1;
    this.div_id         = "analysis_view_div_"+this.lense_number;
    this.group          = group_name;
    this.view           = this._get_view(this.character,this.group,this.type,this.position.x,this.position.y,this.selected_range.start,this.selected_range.stop,this.lense_number);
    this.isActive       = true;

    this.filter_entities = [];

    this._set_attr();
    this.setActive(true);

    var _this = this;

    if(this.type == "trend"){
      this.trend = new Trend(this.view,this.selected_range);

      var statOptions = {
      "All Changes": "A",
      "Group Changes": "G",
      "Lines Entering": "ET",
      "Lines Exiting": "EX",
      "Deviations And Crossovers": "DC"
      };

      d3.select("#analysis_view_div_"+this.lense_number).append("form").attr("id","trend_form"+this.lense_number).style("width","20px").style("position","absolute").style("left","188px").style("top","39px");
      var selectUI = d3.select("#trend_form"+this.lense_number).append("select");
      selectUI.attr("id","trend_form_option"+this.lense_number);

      selectUI.selectAll("option").data(d3.keys(statOptions)).enter().append("option").text(function(d) {return d;});
      selectUI.selectAll("option").data(d3.values(statOptions)).attr("value", function(d) {return d;});

      d3.select("#trend_form_option"+this.lense_number)
      .on("change",function(){
        _this.trend.setstate(this.value);
        //update_trend(this.value);
        console.log(_this.trend.state+"changing1111111111" + this.value);
        _this.trend.show_trend_detection(_this.trend.svg,_this.selected_range.start,_this.selected_range.stop,lense.height[_this.type],lense.width[_this.type]);
      })

//       function update_trend(value){
//         this.trend.setstate(value);
//         return;
//       }

    }
    if(this.type == "single line"){
      d3.select("#analysis_view_div_"+this.lense_number).add_range_annotations_mouseover(this.lense_number);
      //this.freq = this._set_as_egoline();
    }
    if(this.type == "group"){
      this.group_lens = new Group();
    }
    if(this.type == "outlier"){

    }

    this._update_storyboard();

    // settings: width, height, top, left, numTicks, id, range
    this.axis = new LenseAxis(d3.select("#"+this.div_id),{width: parseFloat($("#"+this.div_id).width()-5),height:40,bottom:8,left:0,numTicks:10,id:this.lense_number, range:this.selected_range, type: analysis_type});
    this._set_view(this.view);

    this._set_resize(this.freq,this.character,this.group,this.type,this.position.x,this.position.y,this.lense_number);
    this._set_draggable(this.character,this.group,this.type,this.position.x,this.position.y,this.selected_range.start,this.selected_range.stop,this.lense_number);
    //translate_ticks();
    
  };

  /**
   * API CALLS
   */
  highlightEntity(id){
    switch (this.type) {
      case "group":
        d3.select("#"+this.div_id).selectAll("."+id).selectAll("rect").style("stroke","gold").style("stroke-width","2px");
        break;
      case "single line":
        d3.select("#"+this.div_id).selectAll("."+id).style("stroke","gold");
        break;
      // case "outlier":
      //   d3.select("#"+this.div_id).selectAll("#"+id).style("opacity",1);
      //   d3.select("#"+this.div_id).selectAll("line").each(function(d){
      //     console.log(d);
      //     // if(d.source.id == id || d.target.id == id){
      //     //   d3.select(this).style("opacity",1);
      //     // }
      //   })
      //   break;
      default:
        break;
    }
  };
  unhighlightEntity(id){
    switch (this.type) {
      case "group":
        d3.select("#"+this.div_id).selectAll("."+id).selectAll("rect").style("stroke-width","0px");
        break;
      case "single line":
        const DT_id = "#"+(id)+"_DT_row";
        const clr = rgb2hex(d3.select(DT_id).select(".minicolors-swatch-color").style("background-color"));
        d3.select("#"+this.div_id).selectAll("."+id).style("stroke",clr);
        break;
      default:
        break;
    }
  };
  highlightGroup(id){
    switch (this.type) {
      case "group":
        d3.select("#"+this.div_id).selectAll("#"+id).style("stroke","black").style("stroke-width","3px");
        break;
      case "single line":
        d3.select("#"+this.div_id).selectAll("."+id).style("stroke","black").style("stroke-width","3px");
        break;
      default:
        break;
    }
  };
  unhighlightGroup(id){
    switch (this.type) {
      case "group":
        d3.select("#"+this.div_id).selectAll("#"+id).style("stroke-width","0px");
        break;
      case "single line":
        d3.select("#"+this.div_id).selectAll("."+id).style("stroke-width","0px");
        break;
      default:
        break;
    }
  };
  toggleEntityClr(id,clr){
    switch (this.type) {
      case "group":
        id = id.replace("#","");
        d3.select("#"+this.div_id).selectAll("."+id).selectAll("rect").attr("fill",clr);
        break;
      case "outlier":
        d3.select("#"+this.div_id).selectAll("circle").each(function(circle){
          if(circle.id == id) d3.select(this).attr("fill",clr);
        })
        break;
      default:
        break;
    }
  };
  toggleGroupClr(id,clr){
    switch (this.type) {
      case "group":
        d3.select("#"+this.div_id).selectAll("#"+id).style("fill",clr);
        break;
      case "single line":
        d3.select("#"+this.div_id).selectAll("."+id).style("fill",clr);
      default:
        break;
    }
  };
  getType(){
    return this.type;
  };
  getTrend(){
    return this.trend;
  };
  getGroup(){
    return this.group_lens;
  };
  getFreq(){
    return this.freq;
  };
  isActive(){
    this.div_header
    return this.isActive;
  };
  setActive(bool){
    this.isActive = bool;
    const _this = this;
    if(bool == false){
      _this.div_header.style("opacity",0.5);
    }
    else{
      _this.div_header.style("opacity",1);
//       $("#filter_options_div").empty();
//       document.getElementById("filter_options_div").innerHTML =
//       // '<select class="form-control" id="attributes_dropdown"></select> \
//       // <table id="filter_options_table"> \
//       // <thead><tr><th>Attribute</th><th>Show</th></tr></thead> \
//       // </table>';
//       ' <span id="attributes_dropdown" style="padding-left:100px;"></span> \
//         <table id="filter_options_table" class="display compact dt-body-center"> \
//         <thead><tr><th>Attribute</th><th>Show</th></tr></thead> \
//         </table> \
//       ';

      //Set the drop down html here
//       let html_str = "";

      // _this.attribute_headers.forEach(function(attr){
      //   if(attr == _this.selected_attr) html_str += "<option selected>"+attr+"</option>\n";
      //   else html_str += "<option>"+attr+"</option>\n";
      // })
//       html_str = "<strong>"+'"'+_this.selected_attr.toUpperCase()+'"'+"</strong>";
//       document.getElementById("attributes_dropdown").innerHTML = html_str;

//       let filter_table = $("#filter_options_table").DataTable({
//           "scrollY": "200px",                       // table height
//           "scrollCollapse": true, "paging": false,  // no pagination, use scrolling instead
//           "searching": false,
//           "oLanguage": {
//             // "sSearch": "Filter:",                   // search bar text
//             "sInfo": "_TOTAL_ total groups"         // footer msg
//           },
//           "columnDefs": [
//             {"targets":[0,1], "className":"dt-center "},
//           ],
//           "compact":true
//         });

//       for(key in _this.attributes[_this.selected_attr]){
//           let input_str = "";
//           if(_this.attributes[_this.selected_attr][key] == true) input_str = '<input class="checkbox" id="'+key+'" type="checkbox" value="'+key+'" checked style="margin-left:45px;">';
//           else input_str = '<input class="checkbox" id="'+key+'" type="checkbox" value="'+key+'" style="margin-left:45px;">'
//           let row = filter_table.row.add([
//             key,
//             '<span class="'+key+'-DT-row" "style:margin-left:15px;">'
//               +
//               input_str
//               +
//             '</span>'
//           ]).node();

//           $(row).attr("id", key+'_DT_row');
//       }
//       filter_table.draw(false);              // refresh the table (ie, draw the elements)

//       $(".checkbox").change(function(elm) {
//           if(this.checked) {
//             _this.attributes[_this.selected_attr][this.id] = true;
//           }
//           else{
//             _this.attributes[_this.selected_attr][this.id] = false;
//           }
//           //reload lens
//           const entities = apply_new_filter();
//           _this.setFilterEntitiesLst(entities);
//           _this.reload_lens();
//       });

    }
    return this;

    /*
    CLOSURES
     */
    function apply_new_filter(){
      //get list of characters who fit the attributes listed
      let entities_to_filter = []; // list of entities to filter out.

      for(let attr in _this.attributes){
        for(let key in _this.attributes[attr]){
          if(_this.attributes[attr][key] == false){
            //find characters with this attr
            for(let entity in loadedAttributes){
              if( (attr in loadedAttributes[entity]) && (loadedAttributes[entity][attr] == key) && !entities_to_filter.includes(entity)){
                entities_to_filter.push(entity);
              }
            }
          }
        }
      }
      return entities_to_filter;
    };
  };

  reload_lens(){
    const n = this.lense_number,
          padding_w = 20,
          padding_h = 90,
          d0 = this.selected_range.start,
          d1 = this.selected_range.stop;

    if(this.type == "trend"){
      let d = this.trend.get_heatmap_data(d0,d1);
      this.trend.create_heatmap(d3.select('#analysis_view_div_'+n).select('svg'),d,d0,d1,$('#analysis_view_div_'+n).height()-padding_h,$('#analysis_view_div_'+n).width()-padding_w);
    }
    else if (this.type == "outlier") {
      show_outlier_analysis(d3.select("#analysis_view_"+n),$('#analysis_view_div_'+n).height()-padding_h,$('#analysis_view_div_'+n).width()-padding_w,d0,d1,n);
    }
    else if (this.type == "group"){
      this.group_lens.show_group_analysis(d3.select("#analysis_view_div_"+n).select('svg'),this.group,$('#analysis_view_div_'+n).height()-padding_h - 35,$('#analysis_view_div_'+n).width()-padding_w,d0,d1,n);
    }
    else if(this.type == "single line"){
      const div = d3.select("#analysis_view_div_"+n);
      const d = create_egoline_graph(n,this.character,d3.select("#analysis_view_"+n).select('svg'), $.extend(true, [], _bubbleset_data),bar_x,clicked_line_1,parseFloat(div.select('.chart-div').style("height")),$('#analysis_view_div_'+n).width()-20,d0,d1);
      //this.freq.onResize(parseFloat(document.getElementById('analysis_view_div_'+n).style.width)-20,d);
    }
  };

  setFilterEntitiesLst(d){
    this.filter_entities = d;
    return this;
  }
  getFilterEntities(){
    return this.filter_entities;
  }

  show_timesteps(timestep,d){
    let div   = d3.select("#"+this.div_id),
        focus = div.selectAll(".focus"),
        x     = d3.scaleLinear().domain([this.selected_range.start,this.selected_range.stop]).range([0,this.axis.width]);

    focus.selectAll(".timestep").text(timestep);

    if(this.selected_range.start > timestep) focus.style("display", "none");
    else focus.style("display", null);

    switch (this.getType()) {
      case "trend":
        div.selectAll(".cell").classed("active", false);
        div.select("._"+timestep).attr("class",'cell _'+timestep+" active");
        break;

      case "group":
        div.select(".area").attr("transform", "translate(" + ( x(timestep) + 56 ) + ",0)");
        div.select(".bar").attr("transform", "translate(" + ( x(timestep) + 16 ) + ",0)");
        if(d){
          focus.select(".entities-entering-text").style("display",null);
          focus.select(".entities-leaving-text").style("display",null);
          focus.select(".entities-entering-text").text(d.entering);
          focus.select(".entities-leaving-text").text(d.leaving);
        }
        else{
          focus.select(".entities-entering-text").style("display","none");
          focus.select(".entities-leaving-text").style("display","none");
        }
        break;

      case "single line":
        x = d3.scaleLinear().domain([this.selected_range.start,this.selected_range.stop]).range([0,this.axis.width - 15]);
        div.select(".focus").attr("transform", "translate(" + ( x(timestep) + 70 ) + ",0)");
        break;

      default:
        return;
    }
  };

  hide_timestep(timestep){
    let div   = d3.select("#"+this.div_id),
        focus = div.selectAll(".focus");

    div.selectAll(".focus").style("display", "none");
    $(".cell").removeClass("active");
  };

   update(){
     this.view = this._set_view();
     return this;
   };

   updateTrendColorPalette(max){
     d3.select("#"+this.background).select(".legend").remove();

     if(max == -1) this.trend.setColorPalette(this.background);
     else global_trend.setMax(max).setColorPalette(this.background);

     return this;
   };

   getBackground(){
     return this.background;
   };

   getType(){
     return this.type;
   };

   setTrendColorPalette(){
     let max = 0;
     const data = get_heatmap_data(this.selected_range.start,this.selected_range.stop);
     data.forEach(function(el){
       if(el.intensity > max) max = el.intensity;
     });
     this.trend.setMax(max);
     this.trend.setColorPalette(this.background);
   };

  /**
   * PRIVATE METHODS: '_' denotes a type of pseudo-privacy, as there is only a very compicated and quite frankly useless way to do real privacy in ES6.
   */
  _set_attr(){ // TODO: This needs to be dynamic
    // let filtered_attr = "";
    // let filtered_attr_options = [];
    let ordinal_attributes = {},
        numerical_attributes = {};

    for (let id in loadedAttributes){
      for(let attr in loadedAttributes[id]){
        const val = loadedAttributes[id][attr];
        if($.isNumeric(val)){
          if(numerical_attributes[attr]){
            if(!(numerical_attributes[attr].includes(val))) numerical_attributes[attr].push(val);
          }
          else{
            numerical_attributes[attr] = [];
          }
        }
        else{
          if(ordinal_attributes[attr]){
            if(!(ordinal_attributes[attr].includes(val))) ordinal_attributes[attr].push(val);
          }
          else{
            ordinal_attributes[attr] = [];
          }
        }
      }
    }

    let ordinal_attributes_lst = {}, selected_attr, attribute_headers = [];

    for(let attr in ordinal_attributes){
      let obj = {};
      ordinal_attributes[attr].forEach(function(val){
        obj[val] = true;
      })
      ordinal_attributes_lst[attr] = obj;
      selected_attr = attr;
      attribute_headers.push(attr);
    }
    // for(let attr in numerical_attributes){
    //   let obj = {};
    //   numerical_attributes[attr].forEach(function(val){
    //     obj[val] = true;
    //   })
    //   numerical_attributes[attr] = obj;
    // }
    // console.log(ordinal_attributes_lst,selected_attr);

    this.attribute_headers = attribute_headers;
    if($("#dataset_dropdown").val() == "nba"){
      selected_attr = "pos";
    }
    else if($("#dataset_dropdown").val() == "Matrix"){
      selected_attr = "role";
    }
    this.selected_attr = selected_attr;
    this.attributes = ordinal_attributes_lst;
  };
  _get_view(character,group_name,analysis_type,x,y,d0,d1,lense_number){
     const padding_w =  20, padding_h = 90;

     var cur_width =  lense.width[analysis_type];
     var cur_height = lense.height[analysis_type];
     var graph_num;
     var outlier_chart_width = lense.width["outlier"];
     var outlier_chart_height = lense.height["outlier"];

     if(this.type == "outlier"){

     graph_num = get_characters(d0,d1);

     cur_width =  85 + 10 * graph_num.links.length;
     cur_height = 85 + 10 * graph_num.links.length;

     cur_width = Math.min( Math.max(cur_width, 480), 640) + 10;
     cur_height = Math.min(Math.max(cur_height,480), 640) + 20;

     }


     const background = d3.select('body').append('div')
       .attr('class','analysis_view_div')
       .attr('id','analysis_view_div_'+lense_number)
       .style('width',cur_width + padding_w + 'px')
       .style('height', cur_height + padding_h + 'px')
       .style('top',y+"px")
       .style('left',x+"px");

     const header = background.append("div")
       .attr("class","lense-header")
       .attr("id",lense_number);

     this.div_header = header;

     header.append("span")
       .attr("class","lense-label name")
       .text(capitalizeFirstLetter(header_name(analysis_type)));

     background.append("span")
       .attr("class","lense-label timesteps");

     background.append("span")
       .attr("class","lense-label selection")
       .attr("id","lense_label_"+lense_number)
       .text(lense.placeholder_text);

     if(this.type == "single line"){
       let scarf_plot_container = background.append("div")
            .attr("class","scarf_plot_container")
            .style('width', function(){ return lense.width[analysis_type] + 'px'; })
            .style('top',"60px")
            .style("height","80px")
            .append("svg")
            .attr("id","scarf_plot_"+lense_number)
            .style('width', function(){ return lense.width[analysis_type] + 'px'; });

       var div = background.append('div')
           .attr("class","chart-div")
           .style("top","120px")
           .style('width', function(){ return lense.width[analysis_type] + 'px'; })
           .style('height', String($('#analysis_view_div_'+this.lense_number).height() - 230) + 'px');
     }
     else if(this.type == "trend"){
       var div = background.append('div')
           .attr("class","chart-div")
           .style('width', function(){ return lense.width[analysis_type] + 'px'; })
           .style('height', function(){ return lense.height[analysis_type] - 20 + 'px'; });
     }
     else if(this.type == "outlier"){

       var div = background.append('div')
           .attr("class","chart-div")
           .style('width', function(){ return cur_width + 'px'; })
           .style('height', function(){ return cur_height - 20 + 'px'; });

     }
     else{
       var div = background.append('div')
           .attr("class","chart-div")
           .style('width', function(){ return lense.width[analysis_type] - 10 + 'px'; })
           .style('height', function(){ return lense.height[analysis_type]- 20 + 'px'; });
     }

    let analysis_view = div
     .append('g')
       .attr('id','analysis_view_g'+lense_number)
       .selectAll('.analysis_view')
       .remove()
       .data([{x:x,y:y}])
     .enter().append('svg')
       .attr('class','analysis_view')
       .attr('id','analysis_view_'+lense_number)
       .attr('x',function(d){return d.x;})
       .attr('y',function(d){return d.y;})
       .style('width','100%')
       .style('height','100%');

     div.raise();
     add_close_icon(header,lense_number);
     this._set_timestep_label();

     return analysis_view;

     /*
     Closures
      */
      function header_name(analysis_type){
        if(analysis_type == "outlier") return "association";
        return analysis_type;
      };
   }

   _set_view(view){
      switch (this.type) {
        case "group":
          this.group_lens.show_group_analysis(view,this.group,lense.height[this.type]-35,lense.width[this.type]-10,this.selected_range.start,this.selected_range.stop, this.lense_number);
          break;

        case "single line":
          const d = create_single_line_analysis_view(this.lense_number,view,this.character,this.selected_range.start,this.selected_range.stop,parseFloat(d3.select("#analysis_view_div_"+this.lense_number).select(".chart-div").style("height")));
          //this.freq.setWidth($('#analysis_view_div_'+this.lense_number).width()-20);
          //this.freq.render(d);
          break;

        case "outlier":
          show_outlier_analysis(view,parseInt(view._parents[0].parentNode.style.height),parseInt(view._parents[0].parentNode.style.width),this.selected_range.start,this.selected_range.stop,this.lense_number);
          break;

        case "trend":
          this.trend.show_trend_detection(view,this.selected_range.start,this.selected_range.stop,lense.height[this.type],lense.width[this.type]);
          break;

        default:
          console.log("-- Lense Class Private Method _set_view() Error: Unknown Analysis Type --");
          break;
      }
  }

  _set_resize(freq,character,group_name,analysis_type,x,y,lense_number){
    const padding_w =  20,
          padding_h = 90,
          range = this.selected_range,
          _this = this,
          d0 = this.selected_range.start,
          d1 = this.selected_range.stop;

    if(analysis_type == "trend"){
      $('#analysis_view_div_'+lense_number).resizable({
        /*maxHeight: 150,*/ minHeight: 150, /*maxWidth: 600,*/ minWidth: 550,

        start:  function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                },
        resize:   function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                },
        stop:   function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                }
      });
    }
    else if(analysis_type == "group"){
      $('#analysis_view_div_'+lense_number).resizable({
        /*maxHeight: 600,*/ minHeight: 380, /*maxWidth: 700,*/ minWidth: 350,

        start:  function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                },
        resize:   function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                },
        stop:   function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                }
      });
    }
    else if(analysis_type == "outlier"){
      $('#analysis_view_div_'+lense_number).resizable({
        /*maxHeight: 450,*/ minHeight: 300, /*maxWidth: 450,*/ minWidth: 300,
        aspectRatio:true,
        start:  function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));

                  // d3.select("#analysis_view_"+lense_number).selectAll('.nodes').remove();
                  // d3.select("#analysis_view_"+lense_number).selectAll('.links').remove();
                  // d3.select("#analysis_view_"+lense_number).selectAll('circle').remove();
                  // d3.select("#analysis_view_"+lense_number).selectAll('.nodes').remove();
                  d3.select("#analysis_view_"+lense_number).selectAll("text").remove();
                  d3.select("#analysis_view_"+lense_number).selectAll("rect").remove();
                  d3.select("#analysis_view_div_"+lense_number).select(".chart-div")
                    .append("div")
                    .attr("class","temp-view")
                    .style("top","0")
                    .style("left","0")
                    .style("width","100%")
                    .style("height","95%")
                    .style("background-color","black")
                    .style("position","absolute")
                    .style("opacity","0.3");
                },
        resize:   function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                  // d3.select("#analysis_view_"+lense_number).selectAll("text").remove();
                  // d3.select("#analysis_view_"+lense_number).selectAll("rect").remove();
                  // show_outlier_analysis(d3.select("#analysis_view_"+lense_number),$('#analysis_view_div_'+lense_number).height()-padding_h,$('#analysis_view_div_'+lense_number).width()-padding_w,d0,d1,lense_number);
                },
        stop:   function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                  d3.selectAll(".temp-view").remove();
                  d3.select("#analysis_view_"+lense_number).selectAll("text").remove();
                  d3.select("#analysis_view_"+lense_number).selectAll("rect").remove();
                  show_outlier_analysis(d3.select("#analysis_view_"+lense_number),$('#analysis_view_div_'+lense_number).height()-padding_h,$('#analysis_view_div_'+lense_number).width()-padding_w,d0,d1,lense_number);
                }
      });
    }
    else if(analysis_type == "single line"){
      const div = d3.select("#analysis_view_div_"+lense_number);

      create_egoline_graph(lense_number,character,d3.select("#analysis_view_"+lense_number).select('svg'), $.extend(true, [], _bubbleset_data),bar_x,clicked_line_1,parseFloat(div.select('.chart-div').style("height")),$('#analysis_view_div_'+lense_number).width()-20,d0,d1);

      $('#analysis_view_div_'+lense_number).resizable({
        /*maxHeight: 780,*/ minHeight: 280, /*maxWidth: 700,*/ minWidth: 350,

        start:  function(){
                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                  const node = document.getElementById("scarf_plot_"+lense_number)
                  while (node && node.hasChildNodes()) {
                    node.removeChild(node.lastChild);
                  }
                },
        resize: function(){
                    let d0 = _this.selected_range.start,
                        d1 = _this.selected_range.stop;

                    update_anchor_lines(lense_number);
                    transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                    const d = create_egoline_graph(lense_number,character,d3.select("#analysis_view_"+lense_number).select('svg'), $.extend(true, [], _bubbleset_data),bar_x,clicked_line_1,parseFloat(div.select('.chart-div').style("height")),$('#analysis_view_div_'+lense_number).width()-20,d0,d1);
                    //freq.setRange(_this.selected_range).onResize(parseFloat(document.getElementById('analysis_view_div_'+lense_number).style.width)-20,d);
                  },
        stop:   function(){
                let d0 = _this.selected_range.start,
                    d1 = _this.selected_range.stop;

                  const d = create_egoline_graph(lense_number,character,d3.select("#analysis_view_"+lense_number).select('svg'), $.extend(true, [], _bubbleset_data),bar_x,clicked_line_1,parseFloat(div.select('.chart-div').style("height")),$('#analysis_view_div_'+lense_number).width()-20,d0,d1);
                  //freq.setRange(_this.selected_range).onResize(parseFloat(document.getElementById('analysis_view_div_'+lense_number).style.width)-20,d);
                  d3.selectAll(".temp-view").remove();

                  update_anchor_lines(lense_number);
                  transform_lense_labels('#analysis_view_div_'+lense_number,$(this));
                }
      });
    }

    $('#analysis_view_div_'+lense_number).resize(function(){
      const _id = '#analysis_view_div_'+lense_number,
            _h = String($('#analysis_view_div_'+lense_number).height()-padding_h) + 'px',
            _w = String($('#analysis_view_div_'+lense_number).width()-padding_w) + 'px',
            d0 = _this.selected_range.start,
            d1 = _this.selected_range.stop;

      _this.axis.resizeAxis({width:parseFloat(_w)});

      if(analysis_type == "trend"){
        d3.select(_id).select(".chart-div")
          .style("height",_h-30)
          .style("width",_w);
        let d = _this.trend.get_heatmap_data(d0,d1);
        _this.trend.create_heatmap(d3.select('#analysis_view_div_'+lense_number).select('svg'),d,d0,d1,$('#analysis_view_div_'+lense_number).height()-padding_h,$('#analysis_view_div_'+lense_number).width()-padding_w);
      }
      else if (analysis_type == "outlier") {
        d3.select(_id).select(".chart-div")
          .style("height",_h)
          .style("width",_w);
        // show_outlier_analysis(d3.select("#analysis_view_"+lense_number),$('#analysis_view_div_'+lense_number).height()-padding_h,$('#analysis_view_div_'+lense_number).width()-padding_w,d0,d1,lense_number);
      }
      else if (analysis_type == "group"){
        d3.select(_id).select(".chart-div")
          .style("height",_h)
          .style("width",_w);

          reset_range();
          // const _h = $('#analysis_view_div_'+n).height()-padding_h, _w = $('#analysis_view_div_'+n).width()-padding_w;
          // const new_range = {start:+d3_timestep_label.select("#start").node().value,stop:+d3_timestep_label.select("#stop").node().value};
          // _this.set_selected_range(new_range);
          // timestep_marker_lst[n-1].update_range(new_range);
          // const n = lense_number;
          // console.log(d3_lens_view.select('svg'),String(d3.select("#analysis_view_div_"+n).select(".stack_graph").attr("id")),_h,_w,n);
          // _this.group_lens.show_group_analysis(d3_lens_view.select('svg'),String(d3.select("#analysis_view_div_"+n).select(".stack_graph").attr("id")),parseFloat(_h) - 35,parseFloat(_w),d0,d1,n);
        // _this.group_lens.show_group_analysis(d3.select("#analysis_view_div_"+lense_number).select('svg'),_this.group,parseFloat($('#analysis_view_div_'+lense_number).height()),$('#analysis_view_div_'+lense_number).width()-padding_w,d0,d1,lense_number);
      }
      else if(analysis_type == "single line"){
        d3.select(_id).select(".chart-div")
          .style('height', String($('#analysis_view_div_'+_this.lense_number).height() - 230) + 'px')
          .style("width",_w);
        d3.select(_id).select(".scarf_plot_container").style("width",_w);
        d3.select(_id).select("#scarf_plot_"+lense_number).style("width",_w);
      }
      translate_ticks();
    });

    function reset_range(){
      const n = lense_number;

      const d3_lens_view = d3.select('#analysis_view_div_'+n), d3_timestep_label = d3_lens_view.select(".timesteps");

      if(+d3_timestep_label.select("#start").node().value < 0 || +d3_timestep_label.select("#stop").node().value >= lengthOfStoryline) return;
      const _id = '#analysis_view_div_'+n, _h = $('#analysis_view_div_'+n).height()-padding_h, _w = $('#analysis_view_div_'+n).width()-padding_w;
      const new_range = {start:+d3_timestep_label.select("#start").node().value,stop:+d3_timestep_label.select("#stop").node().value};
      _this.set_selected_range(new_range);
      timestep_marker_lst[n-1].update_range(new_range);

      _this.axis.set_range(new_range).resizeAxis({width:parseFloat(_w)});

      const d0 = +_this.selected_range.start,
            d1 = +_this.selected_range.stop;

      lense_lst[n-1].group_lens.show_group_analysis(d3_lens_view.select('svg'),String(d3.select("#analysis_view_div_"+n).select(".stack_graph").attr("id")),+_h - 35,_w,d0,d1,n);

//       if($('input[name=Global-Normalization]').prop('checked')){
//         set_lenses_global();
//       }
//       else{
//         set_lenses_local();
//       }
    };
  }

  _set_draggable(character,group_name,analysis_type,x,y,d0,d1,lense_number){
    const _this = this;
    $('#analysis_view_div_'+lense_number).draggable({
      start:  function(){
                d3.select(this).raise();
                lense_lst.forEach(function(lens){
                  lens.setActive(false);
                });
                _this.setActive(true);
                update_anchor_lines(lense_number);
              },
      drag:   function(){
                update_anchor_lines(lense_number);
              },
      stop:   function(){
                update_anchor_lines(lense_number);
              },
      containment: "parent"
    });

    $('#analysis_view_div_'+lense_number).on("click",function(){
      lense_lst.forEach(function(lens){
        lens.setActive(false);
      });
      _this.setActive(true);
      d3.select('#analysis_view_div_'+lense_number).raise();
    })

  }
  _set_as_egoline(){
    const _lense_number = this.lense_number;
    const _w   = parseFloat(document.getElementById("analysis_view_div_"+_lense_number).style.width);
    let view  = d3.select("#analysis_view_div_"+_lense_number).append("div")
      .style("height","100px")
      .style("width",_w+"px");

    return new Frequency(view,{"w":_w, "h":90},this.selected_range,_lense_number);
  }

  _update_storyboard(){
    list_existing_lenses.push(this.lense_number);
    update_storyboard(this.view,this.type,this.character,this.position.start,this.position.stop);
  }

  _set_timestep_label(){
    const n                     = this.lense_number,
          range                 = this.selected_range,
          _type                 = this.type,
          padding_w             = 20,
          padding_h             = 90,
          _this                 = this,
          native_timestep_label = document.getElementById('analysis_view_div_'+n).getElementsByClassName("timesteps")[0],
          d3_lens_view          = d3.select('#analysis_view_div_'+n), d3_timestep_label = d3_lens_view.select(".timesteps");

    native_timestep_label.innerHTML = "Timesteps: <input type='number' id='start' value="+range.start+" style='min-width:40px;'> &ndash; <input type='number' id='stop' value="+range.stop+" style='min-width:40px;'>";

    d3_timestep_label.select("#start").on("input",reset_range);
    d3_timestep_label.select("#stop").on("input",reset_range);

    /*
    Closures
     */

    function reset_range(){
      if(+d3_timestep_label.select("#start").node().value < 0 || +d3_timestep_label.select("#stop").node().value >= lengthOfStoryline) return;
      const _id = '#analysis_view_div_'+n, _h = $('#analysis_view_div_'+n).height()-padding_h, _w = $('#analysis_view_div_'+n).width()-padding_w;
      const new_range = {start:+d3_timestep_label.select("#start").node().value,stop:+d3_timestep_label.select("#stop").node().value};
      _this.set_selected_range(new_range);
      timestep_marker_lst[n-1].update_range(new_range);

      _this.axis.set_range(new_range).resizeAxis({width:parseFloat(_w)});

      const d0 = +_this.selected_range.start,
            d1 = +_this.selected_range.stop;

      if(_type == "trend"){
        const d = _this.trend.get_heatmap_data(d0,d1);
        _this.trend.create_heatmap(d3_lens_view.select('svg'),d,d0,d1,_h,_w);
      }
      else if (_type == "outlier") {
        show_outlier_analysis(d3.select("#analysis_view_"+n),$('#analysis_view_div_'+n).height()-padding_h,$('#analysis_view_div_'+n).width()-padding_w,d0,d1,n);
      }
      else if (_type == "group"){
        lense_lst[n-1].group_lens.show_group_analysis(d3_lens_view.select('svg'),String(d3.select("#analysis_view_div_"+n).select(".stack_graph").attr("id")),+_h - 35,_w,d0,d1,n);
      }
      else if(_type == "single line"){
        const d = create_egoline_graph(n,_this.character,d3.select("#analysis_view_"+n).select('svg'), $.extend(true, [], _bubbleset_data),bar_x,clicked_line_1,parseFloat(d3.select("#analysis_view_div_"+n).select(".chart-div").style("height")),_w,d0,d1);
        //_this.freq.setRange({start:d0,stop:d1}).onResize(_w,d);
        d3.selectAll(".temp-view").remove();
      }
      update_all_anchor_lines();

//       if($('input[name=Global-Normalization]').prop('checked')){
//         set_lenses_global();
//       }
//       else{
//         set_lenses_local();
//       }
    };

  } // END _set_timestep_label()

  set_selected_range(d){
    this.selected_range = d;
  };

  show_data_with_tooltip(d){//TODO:finish this mouseover entity
    d3.selectAll(".mouseover-widget").remove();

    const current_entity = d3.select(this.node().parentNode).attr("class");

    let entering_entities = [],

    tooltip = d3.select("body").append("g")
        .attr("class","mouseover-widget")
      .append("div")
        .attr("class","entities-list-tooltip")
        .attr("id","current")
        .style("left",+event.clientX + 15 +"px")
        .style("top",+event.clientY +"px")
        .raise();

    for (var key in d.data) {
        if (d.data.hasOwnProperty(key) && d.data[key] != 0) {
          entering_entities.push(key);
        }
    }

    let html = "<table>";
    entering_entities.forEach(function(e){
      const DT_id = "#"+e+"_DT_row";
      const color = rgb2hex(d3.select(DT_id).select(".minicolors-swatch-color").style("background-color"));
      if(e == current_entity) html = html + "<tr style='color:"+color+";'>" + e + "</tr>";
      else html = html + "<tr style='color:"+color+"'>" + e + "</tr>";
    });
    html = html + "</table>";

    document.getElementById("current").innerHTML = html;
  }

  /**
   * CONDITIONALS
   */
}

class OnChartLense {
  constructor(type,pts,position){
    this.deleted        = false;
    this.type           = type;
    this.position       = position;
    this.pts            = pts;
    this.padding        = {top:30};
    this.lense_number   = storyboard_list.length+1;
    this.div_id         = "analysis_view_div_"+this.lense_number;
    this.svg            = this._get_view();

    console.log('disi');

    this.isActive       = true;

    this.filter_entities = [];

    this._set_attr();
    this.setActive(true);
    this._update_storyboard();

    // settings: width, height, top, left, numTicks, id, range
    // this.axis = new LenseAxis(d3.select("#"+this.div_id),{width: parseFloat($("#"+this.div_id).width()-5),height:40,bottom:8,left:0,numTicks:10,id:this.lense_number, range:this.selected_range, type: type});
    this._set_view(this.svg);

    this._set_resize();
    this._set_draggable();
  };

  /**
   * API CALLS
   */
   _set_attr(){ // TODO: This needs to be dynamic
     // let filtered_attr = "";
     // let filtered_attr_options = [];
     let ordinal_attributes = {},
         numerical_attributes = {};

     for (let id in loadedAttributes){
       for(let attr in loadedAttributes[id]){
         const val = loadedAttributes[id][attr];
         if($.isNumeric(val)){
           if(numerical_attributes[attr]){
             if(!(numerical_attributes[attr].includes(val))) numerical_attributes[attr].push(val);
           }
           else{
             numerical_attributes[attr] = [];
           }
         }
         else{
           if(ordinal_attributes[attr]){
             if(!(ordinal_attributes[attr].includes(val))) ordinal_attributes[attr].push(val);
           }
           else{
             ordinal_attributes[attr] = [];
           }
         }
       }
     }

     let ordinal_attributes_lst = {}, selected_attr, attribute_headers = [];

     for(let attr in ordinal_attributes){
       let obj = {};
       ordinal_attributes[attr].forEach(function(val){
         obj[val] = true;
       })
       ordinal_attributes_lst[attr] = obj;
       selected_attr = attr;
       attribute_headers.push(attr);
     }
     // for(let attr in numerical_attributes){
     //   let obj = {};
     //   numerical_attributes[attr].forEach(function(val){
     //     obj[val] = true;
     //   })
     //   numerical_attributes[attr] = obj;
     // }
     // console.log(ordinal_attributes_lst,selected_attr);

     this.attribute_headers = attribute_headers;
     if($("#dataset_dropdown").val() == "nba"){
       selected_attr = "pos";
     }
     else if($("#dataset_dropdown").val() == "Matrix"){
       selected_attr = "role";
     }
     this.selected_attr = selected_attr;
     this.attributes = ordinal_attributes_lst;
   };
   isActive(){
     this.div_header
     return this.isActive;
   };
   setActive(bool){
     this.isActive = bool;
     const _this = this;
     if(bool == false){
       _this.div_header.style("opacity",0.5);
     }
     else{
       _this.div_header.style("opacity",1);
//        $("#filter_options_div").empty();
//        document.getElementById("filter_options_div").innerHTML =
//        // '<select class="form-control" id="attributes_dropdown"></select> \
//        // <table id="filter_options_table"> \
//        // <thead><tr><th>Attribute</th><th>Show</th></tr></thead> \
//        // </table>';
//        ' <span id="attributes_dropdown" style="padding-left:100px;"></span> \
//          <table id="filter_options_table" class="display compact"> \
//          <thead><tr><th>Attribute</th><th>Show</th></tr></thead> \
//          </table> \
//        ';

       //Set the drop down html here
//        let html_str = "";

       // _this.attribute_headers.forEach(function(attr){
       //   if(attr == _this.selected_attr) html_str += "<option selected>"+attr+"</option>\n";
       //   else html_str += "<option>"+attr+"</option>\n";
       // })
//        html_str = "<strong>"+'"'+_this.selected_attr.toUpperCase()+'"'+"</strong>";
//        document.getElementById("attributes_dropdown").innerHTML = html_str;

//        let filter_table = $("#filter_options_table").DataTable({
//            "scrollY": "200px",                       // table height
//            "scrollCollapse": true, "paging": false,  // no pagination, use scrolling instead
//            "searching": false,
//            "oLanguage": {
//              // "sSearch": "Filter:",                   // search bar text
//              "sInfo": "_TOTAL_ total groups"         // footer msg
//            },
//            "columnDefs": [
//              {"targets":[0,1], "className":"dt-center "},
//            ]
//         });

//        for(key in _this.attributes[_this.selected_attr]){
//            let input_str = "";
//            if(_this.attributes[_this.selected_attr][key] == true) input_str = '<input class="checkbox" id="'+key+'" type="checkbox" value="'+key+'" checked style="margin-left:45px;">';
//            else input_str = '<input class="checkbox" id="'+key+'" type="checkbox" value="'+key+'" style="margin-left:45px;">'
//            let row = filter_table.row.add([
//              key,
//              '<span class="'+key+'-DT-row" "style:margin-left:15px;">'
//                +
//                input_str
//                +
//              '</span>'
//             ]).node();

//            $(row).attr("id", key+'_DT_row');
//        }
//        filter_table.draw(false);              // refresh the table (ie, draw the elements)

//        $(".checkbox").change(function(elm) {
//            if(this.checked) {
//              _this.attributes[_this.selected_attr][this.id] = true;
//            }
//            else{
//              _this.attributes[_this.selected_attr][this.id] = false;
//            }
//            //reload lens
//            const entities = apply_new_filter();
//            _this.setFilterEntitiesLst(entities);
//            _this.reload_lens();
//        });
     }
     return this;

     /*
     CLOSURES
      */
     function apply_new_filter(){
       //get list of characters who fit the attributes listed
       let entities_to_filter = []; // list of entities to filter out.

       for(let attr in _this.attributes){
         for(let key in _this.attributes[attr]){
           if(_this.attributes[attr][key] == false){
             //find characters with this attr
             for(let entity in loadedAttributes){
               if( (attr in loadedAttributes[entity]) && (loadedAttributes[entity][attr] == key) && !entities_to_filter.includes(entity)){
                 entities_to_filter.push(entity);
               }
             }
           }
         }
       }
       return entities_to_filter;
     };
   };

   reload_lens(){
      this.context.data = this.get_data();
      this.update_context_view();
   };

   setFilterEntitiesLst(d){
     this.filter_entities = d;
     return this;
   }
   getFilterEntities(){
     return this.filter_entities;
   }
  show_timesteps(timestep,d){
    this.lens_mouseover(timestep,0);
  };

  hide_timestep(timestep){
    this.lens_focus.style("display","none");
  };
  //   let div   = d3.select("#"+this.div_id),
  //       focus = div.selectAll(".focus");
  //
  //   div.selectAll(".focus").style("display", "none");
  //   $(".cell").removeClass("active");
  // }

   update(){
     this.view = this._set_view();
     return this;
   }

   getType(){
     return this.type;
   }

  /**
   * PRIVATE METHODS: '_' denotes a type of pseudo-privacy, as there is only a very compicated and quite frankly useless way to do real privacy in ES6.
   */

  _get_view(pos){
    const n     = this.lense_number,
          type  = this.type,
          position   = this.position,
          lens_header_height = 30;

    const scale_factor = zoom_scale_x || 1;

     const div = d3.select('body').append('div')
       .attr('class','analysis_view_div')
       .attr('id','analysis_view_div_'+n)
       .style('width', +$("#timestep_marker_"+n).width()*scale_factor + 'px')
       .style('height', (+$("#timestep_marker_"+n).height()*scale_factor+lens_header_height) + 'px')
       .style('top',(position.y-lens_header_height)+"px")
       .style('left',position.x+"px");

     const header = div.append("div")
       .attr("class","lense-header")
       .attr("id",n);

    this.div_header = header;

     header.append("span")
       .attr("class","lense-label name")
       .text(capitalizeFirstLetter(header_name(type)));

    const analysis_view = div
       .append('svg')
       .attr('class','analysis_view')
       .attr('id','analysis_view_'+n)
       .attr('x',0)
       .attr('y',lens_header_height)
       .style('width','100%')
       .style('height',+$("#timestep_marker_"+n).height()*scale_factor)
       .attr("transform","translate(0,30)");

     div.raise();
     add_close_icon(header,n);
     // this._set_timestep_label();
     this.div = div;

     return analysis_view;

     /*
     Closures
      */
      function header_name(analysis_type){
        if(analysis_type == "outlier") return "association";
        return analysis_type;
      };
   }

 _set_view(svg){
    switch (this.type) {
      case "context":
        this.create_context_view(svg);
        break;
      case "flow":
        this.create_flow_view(svg);
        break;
      default:
        console.log("-- OnChartLense Class Private Method _set_view() Error: Unknown Analysis Type --");
        break;
    }
  }

  // TODO: @chris this is where you put all the stuff. What I'm doing for the resize is just deleting everything in @svg and rerunning this function, it's easier that way.
  // if you need to access the svg, just type in this.svg
  // note: OnChartLense, which is a variant of Class Lense has shares a lot of the same function names so when doing the CMD-F option be careful youre not going to the
  // other class.

  update_context_view(){

    const _this = this,
          context = _this.context;

    const _x = graph_x,
          _y = graph_y,
          _pts = _this.pts,
          padding = _this.padding;

    const x = context.scales.x.range([30,parseFloat(_this.div.style("width"))- 30]),
          y = context.scales.y.range([parseFloat(_this.div.style("height"))- 85 ,padding.top]);

    const width   = parseFloat(_this.div.style("width")),
          height  = parseFloat(_this.div.style("height"));

    let color_lst = [];

    this.svg.style("height",height);
    this.svg.select('#map_graph_y_axis_ID').remove(); 
    this.svg.select('#map_graph_x_axis_ID').remove(); 


    this.svg.append("g")
       .attr("class", "x_axis")
       .attr("id", "map_graph_x_axis_ID")
       .attr("transform", "translate(0," + (height - 49) + ")")
       .call(d3.axisBottom(x).ticks(5));

    this.svg.append("g")
        .attr("id", "map_graph_y_axis_ID")
        .attr("class", "y_axis")
        .attr("transform", "translate(22,15)")
        .call(d3.axisLeft(y).ticks(4));
        
    const newdata = _this.get_data();

    context.path
      .selectAll("path")
      .remove().exit()
      .data(d3.contourDensity()
          .x(function(d) { return x(d.x); })
          .y(function(d) { return y(d.y); })
          .size([width, height])
          .bandwidth(10)
        (newdata))
      .enter().append("path")
        .attr("fill", function(d) {
          color_lst.push(d.value);
          return context.color(d.value);
        })
        .attr("d", d3.geoPath())
        .attr("transform","translate(11,"+15+")");

        /*
        Adding legend here.
         */
        new ContextLegend(this.svg,color_lst,context.color,_this.lense_number);
  };


  get_data(){

    const _this = this;

    const _x = graph_x,
          _y = graph_y,
          _pts = _this.pts;

    // The corners of the timestep signature -- they are based on timestep, not the pixel length
    // If you want to access the pixel length, then simply access without the _x.invert e.g. pts.x.min
    //
    // The corners of the timestep signature -- they are based on timestep, not the pixel length
    // If you want to access the pixel length, then simply access without the _x.invert e.g. pts.x.min
    const selection = {
      x:{
        max:Math.round(_x.invert(_pts.x.max)),
        min:Math.round(_x.invert(_pts.x.min))
      },
      y:{
        max:Math.round(_y.invert(_pts.y.min)),
        min:Math.round(_y.invert(_pts.y.max))
      }
    };

    this.selection = selection;

    var result = [];

    _storyline_data.forEach(function(d,index){
      var lasty = NaN;

      for(let i = selection.x.min ; i < selection.x.max; i++){

          if(lasty != NaN && lasty != undefined && d[i] != NaN && d[i] != undefined && d[i] != lasty){
              
              var info = {};

              if(d[i]<=selection.y.max && d[i] >= selection.y.min && lasty <= selection.y.max && lasty >= selection.y.min){
                
                info.x = i - 0.5;
                info.y = (d[i] + lasty) / 2;
                result.push(info);

              }else if(d[i]> selection.y.max && lasty <= selection.y.max && lasty >= selection.y.min){
                
                info.x = i - 0.5;
                info.y = (selection.y.max + lasty) / 2;
                result.push(info);

              }else if(d[i] < selection.y.min && lasty <= selection.y.max && lasty >= selection.y.min){

                info.x = i - 0.5;
                info.y = (selection.y.min + lasty) / 2;
                result.push(info);

              }else if(d[i]<=selection.y.max && d[i] >= selection.y.min && lasty > selection.y.max){

                info.x = i - 0.5;
                info.y = (selection.y.max + d[i]) / 2;
                result.push(info);

              }else if(d[i]<=selection.y.max && d[i] >= selection.y.min && lasty < selection.y.min){

                info.x = i - 0.5;
                info.y = (selection.y.min + d[i]) / 2;
                result.push(info);

              }else if(d[i] < selection.y.min && lasty > selection.y.max){

                info.x = i - 0.5;
                info.y = (selection.y.min + selection.y.max) / 2;
                result.push(info);

              }else if(lasty < selection.y.min && d[i] > selection.y.max){

                info.x = i - 0.5;
                info.y = (selection.y.min + selection.y.max) / 2;
                result.push(info);    
                            
              }

          }
          lasty = d[i];

          if(d[i]<=selection.y.max && d[i] >= selection.y.min){
            var info = {};
            info.x = i;
            info.y = d[i];
            result.push(info);
          }
      }
    })

    return result;

  }

  load_data(){
    // Some globals you might find useful
    // And some class properties:
    const _this = this;

    const _x = graph_x,
          _y = graph_y,
          _pts = _this.pts;

    // The corners of the timestep signature -- they are based on timestep, not the pixel length
    // If you want to access the pixel length, then simply access without the _x.invert e.g. pts.x.min
    //
    // The corners of the timestep signature -- they are based on timestep, not the pixel length
    // If you want to access the pixel length, then simply access without the _x.invert e.g. pts.x.min
    const selection = {
      x:{
        max:Math.round(_x.invert(_pts.x.max)),
        min:Math.round(_x.invert(_pts.x.min))
      },
      y:{
        max:Math.round(_y.invert(_pts.y.min)),
        min:Math.round(_y.invert(_pts.y.max))
      }
    };

    this.selection = selection;

    //create x-y scales
    const x = d3.scaleLinear().domain([+selection.x.min,+selection.x.max]).range([0,parseFloat(_this.div.style("width"))]),
          y = d3.scaleLinear().domain([+selection.y.min,+selection.y.max]).range([parseFloat(_this.div.style("height")),0]);

    let filtered_entities = [];
    if(lense_lst[_this.lense_number-1]){
      filtered_entities = lense_lst[_this.lense_number-1].getFilterEntities();
    }
    else{
      filtered_entities = [];
    }

    // Populate a grid of n×m values where -2 ≤ x ≤ 2 and -2 ≤ y ≤ 1.
    // const n = +selection.x.max - +selection.x.min,
    //       m = +selection.y.max - +selection.y.min,
    //       values = new Array(n * m);

    let data = [];
    let bubbles =  $.extend(true, [], _bubbleset_data);
    bubbles.forEach(function(d){
      if(!filtered_entities.includes(d.character)){
        let obj_start = {},
            obj_stop  = {};

        obj_start.group     = d.group;
        obj_start.character = d.character;
        obj_start.x         = parseInt(d.timestep_start);
        obj_start.y         = get_entity_y_value(d.character,+d.timestep_start);

        obj_stop.group      = d.group;
        obj_stop.character  = d.character;
        obj_stop.x          = parseInt(d.timestep_stop);
        obj_stop.y          = get_entity_y_value(d.character,+d.timestep_stop);

        data.push(obj_start,obj_stop);
      }
    });

    data = data.filter(function(d){
      return  +d.x >= +selection.x.min &&
              +d.x <= +selection.x.max &&
              +d.y >= +selection.y.min &&
              +d.y <= +selection.y.max;
    });

    return data;

    function get_entity_y_value(character,x){
      let y = 0;
      _storyline_data.forEach(function(d){
        if(d.name == character){
          y = d[x];
        }
      })
      return y;
    };
  }

  create_context_view(svg){ //density contour
    // Some globals you might find useful
    // And some class properties:
    const _this = this;

    const _x = graph_x,
          _y = graph_y,
          _pts = _this.pts,
          padding = _this.padding;

    // The corners of the timestep signature -- they are based on timestep, not the pixel length
    // If you want to access the pixel length, then simply access without the _x.invert e.g. pts.x.min
    //
    // The corners of the timestep signature -- they are based on timestep, not the pixel length
    // If you want to access the pixel length, then simply access without the _x.invert e.g. pts.x.min
    const selection = {
      x:{
        max:Math.round(_x.invert(_pts.x.max)),
        min:Math.round(_x.invert(_pts.x.min))
      },
      y:{
        max:Math.round(_y.invert(_pts.y.min)),
        min:Math.round(_y.invert(_pts.y.max))
      }
    };

    this.selection = selection;

    //create x-y scales
    const x = d3.scaleLinear().domain([+selection.x.min,+selection.x.max]).range([30,parseFloat(_this.div.style("width"))- 30]),
          y = d3.scaleLinear().domain([+selection.y.min,+selection.y.max]).range([parseFloat(_this.div.style("height"))- 85 ,padding.top]);

    const data = _this.load_data();
    const newdata = _this.get_data();

    const width  = parseFloat(_this.div.style("width")),
          height = parseFloat(_this.div.style("height"));

    //Create Contour Plot
    const color = d3.scaleSequential(d3.interpolateOranges)
        .domain([0, 0.04]); // Points per square pixel.

    let color_lst = [];

    const path = svg.insert("g", "g")
        .attr("fill", "none")
        .attr("id","_map")
        .attr("stroke", "#000")
        .attr("stroke-width", 0.5)
        .attr("stroke-linejoin", "round")
//         .style('width',width + 'px')
//         .style('height', height + 'px');

    path
      .selectAll("path")
      .data(d3.contourDensity()
          .x(function(d) { return x(d.x); })
          .y(function(d) { return y(d.y); })
          .size([width, height])
          .bandwidth(10)
        (newdata))
      .enter().append("path")
        .attr("class","map_path")
        .attr("fill", function(d) {
          color_lst.push(d.value);
          return color(d.value);
        })
        .attr("d", d3.geoPath())
        .attr("transform","translate(11,"+ 15 +")");

    svg.append("g")
       .attr("class", "x_axis")
       .attr("id", "map_graph_x_axis_ID")
       .attr("transform", "translate(0," + (height - 49) + ")")
       .call(d3.axisBottom(x).ticks(5));

    svg.append("g")
        .attr("id", "map_graph_y_axis_ID")
        .attr("class", "y_axis")
        .attr("transform", "translate(22,15)")
        .call(d3.axisLeft(y).ticks(4));

    /*
    Adding legend here.
     */
    new ContextLegend(svg,color_lst,color,_this.lense_number);

    this.context = {
      path: path,
      color:color,
      data:data,
      scales:{
        x:x,
        y:y
      }
    };

    set_mouseover();

    /*
    Closures
     */

    function set_mouseover(){
      _this.create_onchart_crosshair();

      const h = parseFloat(_this.div.style("height")),
            w = parseFloat(_this.div.style("width"));

      const focus = svg.append('g')
                       .attr("class","focus")
                       .style("width","100%")
                       .style("height","100%");

      const line_x = focus.append("line")
        // .style("stroke-width",w/100)
        .style("stroke", "black")  // colour the line
        .style("opacity",0.5)
        .attr("x1", 0)     // x position of the first end of the line
        .attr("y1", 0)      // y position of the first end of the line
        .attr("x2", 0)     // x position of the second end of the line
        .attr("y2", h)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout",function(){ focus.style("display", "none");});

      _this.lens_line_x = line_x;

      const line_y = focus.append("line")
        // .style("stroke-width",w/100)
        .style("stroke", "black")  // colour the line
        .style("opacity",0.5)
        .attr("x1", 0)     // x position of the first end of the line
        .attr("y1", 0)      // y position of the first end of the line
        .attr("x2", w)     // x position of the second end of the line
        .attr("y2", 0)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout",function(){ focus.style("display", "none");});

      _this.lens_line_y = line_y;

      const arc = d3.arc()
          .innerRadius(12)
          .outerRadius(15)
          .startAngle(45 * (Math.PI/180)) //converting from degs to radians
          .endAngle(10) //just radians

      const crosshair = focus.append("path")
          .attr("d", arc)
          .style("opacity",0.5)
          .style("fill","black")
          .style("stroke-dasharray","1")
          .on("mouseover", function() { focus.style("display", null); })
          .on("mouseout",function(){ focus.style("display", "none");});

      _this.lens_crosshair = crosshair;
      _this.lens_focus = focus;
      focus.style("display", "none");

      svg.selectAll("*").on("mouseover",function(){
        const x_scale = d3.scaleLinear().domain([+selection.x.min,+selection.x.max]).range([30,parseFloat(_this.div.style("width"))- 30]),
              y_scale = d3.scaleLinear().domain([+selection.y.min,+selection.y.max]).range([parseFloat(_this.div.style("height"))- 85 ,padding.top]);

        const x0 = Math.round(x_scale.invert(d3.mouse(this)[0] - 10)),
              y0 = Math.round(y_scale.invert(d3.mouse(this)[1] - 15));

        //console.log(d3.mouse(this)[0]+","+d3.mouse(this)[1])

        line_x
          .attr("y2",parseFloat(_this.div.style("height")))
          .attr("transform", "translate(" + d3.mouse(this)[0] + ",0)");

        line_y
          .attr("x2",parseFloat(_this.div.style("width")))
          .attr("transform", "translate(0," + d3.mouse(this)[1] + ")");

        crosshair
          .attr("transform", "translate(" + d3.mouse(this)[0] + "," + d3.mouse(this)[1] + ")")
          .attr("r",parseFloat(_this.div.style("width"))/25);

        _this.mouseover_onchart_crosshair(x0,y0);

        focus.style("display", null);
        _this.focus.style("display", null);

        lense_lst.forEach(function(lens){
          if(lens instanceof OnChartLense){
            //lens.lens_mouseover(x0,y0);
          }else lens.show_timesteps(x0,0);
        });
      })
      .on("mouseout",function(){
        _this.lens_mouseout();
        lense_lst.forEach(function(lens){
          if(lens instanceof OnChartLense) lens.lens_mouseout();
          else if(lens instanceof Lense) lens.hide_timestep();
        });
      });
    };
  } // END create_context_view()

  lens_mouseout(){
    this.lens_focus.style("display", "none");
    this.focus.style("display", "none");
  }

  lens_mouseover(x0,y0){
    const x_scale = d3.scaleLinear().domain([+this.selection.x.min,+this.selection.x.max]).range([0,parseFloat(this.div.style("width"))]),
          y_scale = d3.scaleLinear().domain([+this.selection.y.min,+this.selection.y.max]).range([parseFloat(this.div.style("height")),0]);

    this.lens_line_x
      .attr("y2",parseFloat(this.div.style("height")))
      .attr("transform", "translate(" + x_scale(x0) + ",0)")
      .style("display", null);

    this.lens_line_y
      .attr("x2",parseFloat(this.div.style("width")))
      .attr("transform", "translate(0," + y_scale(y0) + ")")
      .style("display", null);

    this.lens_crosshair
      .attr("transform", "translate(" + x_scale(x0) + "," + y_scale(y0) + ")")
      .attr("r",parseFloat(this.div.style("width"))/25)
      .style("display", null);
    this.lens_focus.style("display",null);
  }

  create_onchart_crosshair(){
    const w = parseFloat($("#scale_x_row").slider("value")),
          h = parseFloat($("#scale_y_row").slider("value"))+20;

    const focus = d3.select("#storylines_g_child").append('g')
                     .attr("class","focus");
    this.focus = focus;

    const arc = d3.arc()
        .innerRadius(20)
        .outerRadius(30)
        .startAngle(45 * (Math.PI/180)) //converting from degs to radians
        .endAngle(10) //just radians

    this.crosshair = focus.append("path")
        .attr("d", arc)
        .style("opacity",0.5)
        .style("fill","black")
        .style("stroke-dasharray","1")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout",function(){ focus.style("display", "none");});

    focus.style("display","none");
  };

  mouseover_onchart_crosshair(x,y){
    const w = parseFloat($("#scale_x_row").slider("value")),
          h = parseFloat($("#scale_y_row").slider("value"));

    this.crosshair
      .attr("transform", "translate(" + graph_x(x) + "," + graph_y(y) + ")")
      .attr("r",h/25);

    this.focus.style("display", null);
  };


  update_flow_view(){
    const _div = this.div;
    const flow = this.flow,
          svg = this.svg;

    const x = flow.scales.x.range([0,parseFloat(_div.style("width"))]),
          y = flow.scales.y.range([parseFloat(_div.style("height")),0]);

    const updated_cohorts = flow.data;
    const flow_thickness = 1.5;
    const updated_entity = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) { return x(d.x); })
        .y(function(d) {
          for (let i = 0; i < updated_cohorts.length; i++) {
            if(d.x == updated_cohorts[i].x && d.name == updated_cohorts[i].name){
              if(d.y > updated_cohorts[i].y) {
                return y(updated_cohorts[i].y) - flow_thickness*(d.y - updated_cohorts[i].y);
              }
              else if(d.y < updated_cohorts[i].y) {
                return y(updated_cohorts[i].y) + flow_thickness*(updated_cohorts[i].y - d.y);
              }
            }
          }
          return y(d.y);
        });

    flow.lines.attr("d", function(d){return updated_entity(d);});

    // Render groups
    const stepWidth = x(1)-x(0);

    const groupBubbleArea = d3.area()
              .curve(d3.curveCatmullRom)
              .x(function(d)  { return x(d.x+.5) - stepWidth/2;})
              .y0(function(d) { return y(d.maxY+.45); })
              .y1(function(d) { return y(d.minY-.45); });

    group_shapes_data.forEach(function(d,i) {
      svg.selectAll("."+d.group)
        .attr('d',groupBubbleArea);
    })
  };

  create_flow_view(svg){
    // Some globals you might find useful
    // And some class properties:
    const _this = this;

    const _div = _this.div;

    const _x = graph_x,
          _y = graph_y,
          _pts = _this.pts;

    const flow_thickness = 1.5;

    // The corners of the timestep signature -- they are based on timestep, not the pixel length
    // If you want to access the pixel length, then simply access without the _x.invert e.g. pts.x.min
    const selection = {
      x:{
        max:Math.round(_x.invert(_pts.x.max)),
        min:Math.round(_x.invert(_pts.x.min))
      },
      y:{
        max:Math.round(_y.invert(_pts.y.min)),
        min:Math.round(_y.invert(_pts.y.max))
      }
    };

    // Get the data
    const selected_storyline_entity_data  = get_raw_selected_data(_storyline_data);
    const updated_cohorts                 = compress_data(selection,flatten(selected_storyline_entity_data),selected_storyline_entity_data);

    //get the storyline data that is in the selection
    //get the group data that is in the selection.
    //create x-y scales
    const x = d3.scaleLinear().domain([+selection.x.min,+selection.x.max]).range([0,parseFloat(_div.style("width"))]),
          y = d3.scaleLinear().domain([+selection.y.min,+selection.y.max]).range([parseFloat(_div.style("height")),0]);

    //create line generator
    const entity = d3.line()
        // .curve(d3.curveBasis)
        .x(function(d) { return x(d.x); })
        .y(function(d) { return y(d.y); });

    const updated_entity = d3.line()
        // .curve(d3.curveBasis)
        .x(function(d) { return x(d.x); })
        .y(function(d) {
          for (let i = 0; i < updated_cohorts.length; i++) {
            if(d.x == updated_cohorts[i].x && d.name == updated_cohorts[i].name){
              if(d.y > updated_cohorts[i].y) {
                // return y(updated_cohorts[i].y) - flow_thickness*(d.y - updated_cohorts[i].y);
                return y(updated_cohorts[i].y);
              }
              else if(d.y < updated_cohorts[i].y) {
                // return y(updated_cohorts[i].y) + flow_thickness*(updated_cohorts[i].y - d.y);
                return y(updated_cohorts[i].y);
              }
            }
          }
          return y(d.y);
        });

    //render entities
    const entities = svg.selectAll(".entity")
        .data(get_raw_selected_data(_storyline_data));

    const lines = entities
          .enter().append("g")
          .attr("class", "entity")
        .append("path")

    lines
          .attr("class", "line-segment")
          .style("stroke", function(d,i) {
            if(d[i]){
              const name = d[i].name;
              const DT_id = "#"+(name)+"_DT_row";
              return rgb2hex(d3.select(DT_id).select(".minicolors-swatch-color").style("background-color"));
            }
            else{
              return "#d3d3d3";
            }
           })
           // .style("stroke-width",$("#line_thickness_slider").slider("value")+"px")
           .style("stroke-width",1+"px")
          .attr("d", function(d) { return entity(d); })
          .transition().duration(3500)
          .style("stroke-width",flow_thickness+"px")
          .attr("d", function(d) { return updated_entity(d); })

    // Render groups here

    let stepWidth = x(1)-x(0),
        groups_paths = {};

    const groupBubbleArea = d3.area()
              .curve(d3.curveCatmullRom)
              .x(function(d)  { return x(d.x+.5) - stepWidth/2;})
              .y0(function(d) { return y(d.maxY+.45); })
              .y1(function(d) { return y(d.minY-.45); });

    group_shapes_data.forEach(function(d,i) {
      const groupName = d.group;
      const group_area = svg.append('path');

      group_area
        .datum(d.points)
        .attr('class', groupName + ' group')
        .attr('fill', groupcolors[groupName] )
        .style('opacity', .7)
        .attr('d',groupBubbleArea);

      groups_paths[String(groupName)] = group_area;
      group_area.lower();
    })

    this.flow = {
      data:updated_cohorts,
      lines:lines,
      groups:groups_paths,
      scales:{
        x:x,
        y:y
      }
    };

    /*
    Closures
     */

    function flatten(arr) {
      return arr.reduce(function (flat, toFlatten) {
        return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
      }, []);
    };
    function entities_belongs_in_same_group(d0,d1,timestep){
      const d = group_mesh_data;
      for(let group in d){
        if(d[group].points[timestep]){//if there's any group existent in this timestep
          if( d0.y >= d[group].points[timestep].minY &&
              d0.y <= d[group].points[timestep].maxY &&
              d1.y >= d[group].points[timestep].minY &&
              d1.y <= d[group].points[timestep].maxY)
              return true;
        }
      }
      return false;
    };
    function get_cohorts_for_timestep(data,timestep){//TODO:Optimize for big-o time
      let cohorts = [], // cohorts is a group of lines close enough to each other that you can compress them.
          bin_lst = [],
          no_duplicates_cohorts = [];

      data.forEach(function(d){
        data.forEach(function(d_other){
          let bin = [];
          if(+d.x == timestep && +d_other.x == timestep && d.name != d_other.name){
            if((+d.y + 1 == +d_other.y || +d.y - 1 == +d_other.y) && entities_belongs_in_same_group(d,d_other,timestep)){
              bin.push(d,d_other);
            }
          }
          if(bin.length > 0) bin_lst.push(bin);
        })
      })
      bin_lst.forEach(function(bin){
        bin_lst.forEach(function(bin_other){
          if(bin != bin_other && intersect(bin,bin_other).length > 0){
            let unique_bin = [...bin, ...bin_other].unique();
            if(cohorts.includes_superset_of_cohort(unique_bin)) cohorts.merge_with_superset_of_cohort(unique_bin);
            else cohorts.push(unique_bin);
          }
        })
      })

      cohorts.sort(function(a,b){return b.length - a.length;})
      cohorts.forEach(function(cohort){
        if(!no_duplicates_cohorts.includes_cohort(cohort) && !no_duplicates_cohorts.includes_superset_of_cohort(cohort)) no_duplicates_cohorts.push(cohort);
      })
      return no_duplicates_cohorts;
    };
    function get_avg_y_val(cohort){
      let avg = 0;
      cohort.forEach(function(entity){
        avg += +entity.y;
      })
      return (avg/cohort.length);
    }
    function set_y_val_to_cohort_members(cohort,y_val){
      cohort.forEach(function(entity){
        entity.y = y_val;
      })
    };
    function set_averaged_cohorts_to_data(cohorts,data){
      const flattened_cohorts = flatten(cohorts);
      data.forEach(function(cohort){
        cohort.forEach(function(entity){
          flattened_cohorts.forEach(function(updated_cohort){
            if(updated_cohort.x == entity.x && updated_cohort.name == entity.name) entity.y = updated_cohort.y;
          })
        })
      })
    };
    function compress_data(selection,d,selected_storyline_entity_data){
      let ret = [];
      for (let timestep=+selection.x.min; timestep<=+selection.x.max; timestep++) {

        let cohorts = get_cohorts_for_timestep(d,timestep);

        cohorts.forEach(function(cohort){
          const avg = get_avg_y_val(cohort);
          set_y_val_to_cohort_members(cohort,avg);
        })

        set_averaged_cohorts_to_data(cohorts,selected_storyline_entity_data);
        ret.push(cohorts);
      }
      return flatten(ret);
    };
    function get_raw_selected_data(d){
      let data = [];
      d.forEach(function(entity){
        let line = [];
        for(let i in entity){
          if(+i>=selection.x.min && +i<=selection.x.max && +entity[i]>=selection.y.min && +entity[i]<=selection.y.max && !isNaN(entity[i])){
            let pt = {};
            pt.x = +i;
            pt.y = +entity[i];
            pt.name = entity.name;
            line.push(pt);
          }
        }
        if(line.length > 0) {
          data.push(line);
        }
      })

      //segment the lines so there is a line segment for each timestep. This will make it easier to determine
      // let segmented_storyline_entity_data = [];
      // data.forEach(function(entity){
      //   entity.forEach(function(d,i){
      //     let segment = [];
      //     if(entity[i+1]){
      //       segment.push(d)
      //       segment.push(entity[i+1])
      //       segmented_storyline_entity_data.push(segment);
      //     }
      //   })
      // });
      // return segmented_storyline_entity_data;

      return data;
    };
  };// END create_flow_view()

  _set_resize(){
    const _this = this,
          n     = this.lense_number,
          type  = this.type;

    if(type == "context"){
      $('#analysis_view_div_'+n).resizable({
        // maxHeight: , minHeight: , maxWidth: , minWidth: 450,
        aspectRatio: true,
        start:  function(){
                  update_anchor_lines(n);
                  transform_lense_labels('#analysis_view_div_'+n,$(this));
                  _this.update_context_view();
                },
        resize:   function(){
                  update_anchor_lines(n);
                  transform_lense_labels('#analysis_view_div_'+n,$(this));
                  _this.update_context_view();
                },
        stop:   function(){
                  update_anchor_lines(n);
                  transform_lense_labels('#analysis_view_div_'+n,$(this));
                  _this.update_context_view();
                },
      });
    }
    else if(type == "flow"){
      $('#analysis_view_div_'+n).resizable({
        // maxHeight: , minHeight: , maxWidth: , minWidth: 450,
        aspectRatio: true,
        start:  function(){
                  update_anchor_lines(n);
                  transform_lense_labels('#analysis_view_div_'+n,$(this));
                  _this.update_flow_view();
                },
        resize:   function(){
                  update_anchor_lines(n);
                  transform_lense_labels('#analysis_view_div_'+n,$(this));
                  _this.update_flow_view();
                },
        stop:   function(){
                  update_anchor_lines(n);
                  transform_lense_labels('#analysis_view_div_'+n,$(this));
                  _this.update_flow_view();
                }
      });
    }

  }

  _set_draggable(){
    const n = this.lense_number;

    $('#analysis_view_div_'+n).draggable({
      start:  function(){
                d3.select(this).raise();
                lense_lst.forEach(function(lens){
                  lens.setActive(false);
                });
                lense_lst[n-1].setActive(true);
                update_anchor_lines(n);
              },
      drag:   function(){
                update_anchor_lines(n);
              },
      stop:   function(){
                update_anchor_lines(n);
              },
      containment: "parent"
    });
  }

  _update_storyboard(){
    list_existing_lenses.push(this.lense_number);
    update_storyboard(this.view,this.type,this.character,this.position.start,this.position.stop);
  }
}

let list_existing_lenses = [];

function create_single_line_analysis_view(num,view,character,d0,d1,h){
  let timestep_start = 0,
      timestep_stop = 0;

  if(d0 > d1) {
    timestep_start  = d1;
    timestep_stop   = d0;
  }
  else{
    timestep_start  = d0;
    timestep_stop   = d1;
  }

  return create_egoline_graph(num,character,view, $.extend(true, [], _bubbleset_data),bar_x,character,parseFloat(d3.select("#analysis_view_div_"+num).select(".chart-div").style("height")),lense.width["single line"],timestep_start,timestep_stop);
};

// function create_trend_detection(view,d0,d1,analysis_view_height,analysis_view_width){
//   show_trend_detection(view,d0,d1,analysis_view_height,analysis_view_width);
// };

let clicked_pos_x,clicked_pos_y,curr_x,curr_y;

function push_timestep_markers_down(n){
  var index = list_existing_lenses.indexOf(parseInt(n));
  list_existing_lenses.splice(index, 1);

  var timesteps_to_change = list_existing_lenses.filter(function(lense_ID){
    return parseInt(lense_ID) > parseInt(n);
  });

  // timesteps_to_change.forEach(function(curr,i,ar){
  //   d3.select('#timestep_marker_' + curr)
  //     .transition().duration(200)
  //     .style('y', parseFloat(d3.select('#timestep_marker_' + curr).style('y'))-15);
  //   update_anchor_lines_on_timestep_push(curr);
  // })

  timestep_marker_lst.forEach(function(marker,i){
    if(marker instanceof TimestepSignature){
      marker.getMarker()
            .style('y', parseFloat(d3.select('#timestep_marker_' + curr).style('y'))-15);
      update_anchor_lines_on_timestep_push(i+1);
    }
  })
  timestep_marker_dy -= 15;
};

function add_click_styling(group_name,div,id){
  div
    .on('mousedown',function(){d3.select('#'+id).style('top', parseFloat(d3.select('#'+id).style('top')) + 10 + 'px')})
    .on('mouseup',function(){d3.select('#'+id).style('top', parseFloat(d3.select('#'+id).style('top')) - 10 + 'px')})
};

function add_timestep_range_selection(group){
  d3.selectAll(".select_brush").transition().remove();
  let svg = d3.select("#storylines_g_child");


  console.log('qyuqdiughcsihoihwoi');

  svg.append("g")
    .attr("class", "select_brush")
    // .attr("transform", "translate(" + (0) + "," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")")
    .call(d3.brushX()
        .extent([[graph_x(1), 0], [default_chart_styles.spacing_x - graph_x(2), default_chart_styles.spacing_y]]) //
        .on("start", function(){
          brushstart();
        })
        .on("brush", function(){
          const x = rescaled_graph_x||graph_x;
          // console.log(x);
          if (d3.event.sourceEvent.type === "brush") return;
          var d0 = d3.event.selection.map(x.invert),
              d1 = d0.map(Math.round);

          // If empty when rounded, use floor instead.
          if (d1[0] >= d1[1]) {
            d1[0] = Math.floor(d0[0]);
            d1[1] = d1[0] + 1;
          }
          d3.select(this).call(d3.event.target.move, d1.map(x));
        })
        .on("end", function(){
           range_selected();
           // setTimeout(function(){
           update_anchor_lines(storyboard_list.length);
          // },1100);
        }));

  /*
  Closures
   */
  function translate_brush(){
    d3.select(".selection")
      .style('x',parseFloat(mouseX)+100);
  };

  function brushstart(){
    const clr  = "#d3d3d3";
    d3.select(".selection")
      .attr("fill",clr)
      .attr("stroke",darken(clr,20))
      .attr('x', event.clientX);
  };

  function range_selected(){
    const x_scale = rescaled_graph_x||graph_x,
          y_scale = rescaled_graph_y||graph_y;

    line_selected = group_selected = false;
    if (!d3.event.sourceEvent) return; // Only transition after input.
    if (!d3.event.selection) return; // Ignore empty selections.
    // if (d3.event.sourceEvent.type === "brush") return;

    let d0 = d3.event.selection.map(x_scale.invert),
        d1 = d0.map(Math.round);

    // If empty when rounded, use floor instead.
    if (d1[0] >= d1[1]) {
      d1[0] = Math.floor(d0[0]);
      d1[1] = d1[0] + 1;
    }
    
    const scale = d3.scaleLinear()
      .range(x_scale.domain())
      .domain(graph_x.domain());

    d1[0] = Math.round(+scale(d1[0]));
    d1[1] = Math.round(+scale(d1[1]));

    timestep_marker_lst.push(new TimestepSignature(d3.select("#storyline_svgID"),d1[0],d1[1]));

    const rendering_pos = {
      x: 300 + (num_lenses*10),
      y: (num_lenses*10)
    };

    num_lenses++;

    if(line_mode_active){
      lense_lst.push(new Lense('single line',rendering_pos.x,rendering_pos.y,'null',clicked_line_1,d1[0],d1[1]));
      remove_timestep_range_selection();
    }
    else if(group_mode_active){
      lense_lst.push(new Lense('group',rendering_pos.x,rendering_pos.y,group,"null",d1[0],d1[1]));
      // d3.selectAll(".group").style("opacity",1).style("stroke-width","0px");
      remove_timestep_range_selection();
    }
    else if(outlier_mode_active){
      lense_lst.push(new Lense('outlier',rendering_pos.x,rendering_pos.y,'null','null',d1[0],d1[1]));
      remove_timestep_range_selection();
      add_timestep_range_selection();
    }
    else if(trend_mode_active){
      lense_lst.push(new Lense('trend',rendering_pos.x,rendering_pos.y,'null','null',d1[0],d1[1]));
      remove_timestep_range_selection();
      add_timestep_range_selection();
    }

//     if($('input[name=Global-Normalization]').prop('checked')){
//       set_lenses_global();
//     }
//     else{
//       set_lenses_local();
//     }

    lense_lst.forEach(function(lens){
      lens.setActive(false);
    });
    lense_lst[lense_lst.length-1].setActive(true);
  }
}; // end add_timestep_range_selection()

function add_2d_timestep_range_selection(){
  const x = graph_x,
        y = graph_y;

  const brush = d3.brush()
     .on("brush", brushmove)
     .on("end", range_selected)
     .extent([[0, 0], [$("#scale_x_row").slider("value"), $("#scale_y_row").slider("value")]]);

   const svg = d3.select("#storylines_g_child");

   svg.append("g")
     .attr("class", "select_brush")
     .attr("transform", "translate(" + (0) + ","+ 0 + ")")
     .call(brush);

   /*
   Closures
    */
   function brushmove() {
     if (d3.event.sourceEvent.type === "brush") return;
     const pts = get_selection_rect_pts(d3.event.selection);

     d3.select(this).call(d3.event.target.move, [[pts.x.min,pts.y.min],[pts.x.max,pts.y.max]]);
   }

   function range_selected() {
     if (!d3.event.sourceEvent && !d3.event.selection) return; // Only transition after input AND Ignore empty selections.

     const pts = get_selection_rect_pts(d3.event.selection);

     const rendering_pos = {
       x: +$(".selection").position().left,
       y: +$(".selection").position().top
     };

     timestep_marker_lst.push(new TimestepSignature2D(svg,pts));

     num_lenses++;

     if(context_mode_active){
       lense_lst.push(new OnChartLense('context',pts,rendering_pos));
     }
     else if(flow_mode_active){
       lense_lst.push(new OnChartLense('flow',pts,rendering_pos));
     }

//      if($('input[name=Global-Normalization]').prop('checked')){
//        set_lenses_global();
//      }
//      else{
//        set_lenses_local();
//      }

     lense_lst.forEach(function(lens){
       lens.setActive(false);
     });
     lense_lst[lense_lst.length-1].setActive(true);

     remove_timestep_range_selection();
     add_2d_timestep_range_selection();
   }
   function get_coord(selection){

     const selection_x = selection[0],
           selection_y = selection[1];

     const x_coord = [selection_x[0],selection_y[0]],
           y_coord = [selection_x[1],selection_y[1]];

     return {
       x:x_coord,
       y:y_coord
     }
   }
   function get_scaled_x_coord(coord){
     const inverted_coord = coord.x.map(x.invert),
           rounded_coord  = inverted_coord.map(Math.round);

     return rounded_coord;
   }
   function get_scaled_y_coord(coord){
     const inverted_coord = coord.y.map(y.invert),
           rounded_coord  = inverted_coord.map(Math.round);

    return rounded_coord;
   }
   function get_selection_rect_pts(selection){
     const coord   = get_coord(selection),
           x_coord = get_scaled_x_coord(coord).map(x),
           y_coord = get_scaled_y_coord(coord).map(y);

    return {
      x: {
        min:d3.min([x_coord[0],x_coord[1]]),
        max:d3.max([x_coord[0],x_coord[1]])
      },
      y: {
        min:d3.min([y_coord[0],y_coord[1]]),
        max:d3.max([y_coord[0],y_coord[1]])
      }
    }
   }
}// end add_2d_timestep_range_selection()

function remove_timestep_range_selection(){
  d3.selectAll('.select_brush').transition().remove();
  if(line_mode_active) {
    fade_line(null,0.65);
    d3.select("#storylines_g_child").selectAll(".group").style("opacity",0.3);
    }
  if(group_mode_active){
    d3.selectAll(".group").style("opacity",1);
  }
}

function get_mode_color(){
  if(group_mode_active)   return mode_color('group');
  if(line_mode_active)    return mode_color('single line');
  if(outlier_mode_active) return mode_color('outlier');
  if(trend_mode_active)   return mode_color('trend');
};

function get_lense_color(n){return mode_color(lense_lst[n-1].type);};

let timestep_marker_dy = 75;

function update_anchor_lines(n){
  d3.select('#anchor_line_'+n).remove();

  var div1 = document.getElementById('timestep_marker_'+(n));
  var div2 = document.getElementById('analysis_view_div_'+(n));

  if(!div1) return;

  connect(div1, div2, 2, n);
  // $('#analysis_view_div_'+(n)).parent().append($('#analysis_view_div_'+(n))); // non-d3 version of d3.select.raise()
  $('.analysis_view_div').parent().append($('.analysis_view_div')); // non-d3 version of d3.select.raise()
};

function connect(div1, div2, thickness, n) {
  // const color = get_lense_color(n);
    const color = "#000";
    var off1 = getOffset(div1);
    var off2 = getOffset(div2);
    var x1 = off1.left + off1.width;
    var y1 = off1.top - 4;
    var x2 = off2.left + off2.width;
    var y2 = off2.top;
    var length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
    var cx = ((x1 + x2) / 2) - (length / 2);
    var cy = ((y1 + y2) / 2) - (thickness / 2);
    var angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);

    d3.select('body').append('div')
      .attr('class','anchor_line')
      .attr('id','anchor_line_'+n)
      .style('padding','0.1px')
      .style('margin','0px')
      .style('height',thickness+'px')
      .style('background-color',"rgba(121,121,121,.5)")
      .style('line-height','1px')
      .style('position','absolute')
      .style('border','.5px solid rgba(121,121,121,.5)')
      .style('left',cx+'px')
      .style('top',cy+'px')
      .style('width',length+'px')
      .style('-moz-transform','rotate(' + angle + 'deg)')
      .style('-webkit-transform','rotate(' + angle + 'deg)')
      .style('-o-transform','rotate(' + angle + 'deg)')
      .style('-ms-transform','rotate(' + angle + 'deg)')
      .style('transform','rotate(' + angle + 'deg)');

    function getOffset( el ) {
    var rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + rect.height/2 + window.pageYOffset,
        width: rect.width/2 || el.offsetWidth/2,
        height: rect.height/2 || el.offsetHeight/2
    }
  }
};

function update_anchor_lines_on_timestep_push(n){
  d3.select('#anchor_line_'+n).remove();

  var div1 = document.getElementById('timestep_marker_'+(n));
  var div2 = document.getElementById('analysis_view_div_'+(n));

  _connect(div1, div2, 2, n);
  // $('#analysis_view_div_'+(n)).parent().append($('#analysis_view_div_'+(n))); // non-d3 version of d3.select.raise()
  $('.analysis_view_div').parent().append($('.analysis_view_div')); // non-d3 version of d3.select.raise()
};

function _connect(div1, div2, thickness, n) {
    const color = get_lense_color(n);
    const off1 = getOffset(div1);
    const off2 = getOffset(div2);
    const x1 = off1.left + off1.width;
    const y1 = off1.top + off1.height;
    const x2 = off2.left + off2.width;
    const y2 = off2.top;
    const length = Math.sqrt(((x2-x1) * (x2-x1)) + ((y2-y1) * (y2-y1)));
    const cx = ((x1 + x2) / 2) - (length / 2);
    const cy = ((y1 + y2) / 2) - (thickness / 2);
    const angle = Math.atan2((y1-y2),(x1-x2))*(180/Math.PI);

    let line = d3.select('body').append('div')
      .attr('class','anchor_line')
      .attr('id','anchor_line_'+n)
      .style('padding','1px')
      .style('margin','0px')
      .style('height',thickness+'px')
      .style('background-color',color)
      .style('line-height','1px')
      .style('position','absolute')
      .style('left',cx+'px')
      .style('top',cy+'px')
      .style('width',length+'px')
      .style('-moz-transform','rotate(' + angle + 'deg)')
      .style('-webkit-transform','rotate(' + angle + 'deg)')
      .style('-o-transform','rotate(' + angle + 'deg)')
      .style('-ms-transform','rotate(' + angle + 'deg)')
      .style('transform','rotate(' + angle + 'deg)');

    line
      .transition().duration(200)
      .style('top',(parseFloat(cy)-16)+'px');

    function getOffset( el ) {
    var rect = el.getBoundingClientRect();
    return {
        left: rect.left + window.pageXOffset,
        top: rect.top + rect.height/2 + window.pageYOffset,
        width: rect.width/2 || el.offsetWidth/2,
        height: rect.height/2 || el.offsetHeight/2
    }
  }
};

function update_all_anchor_lines(){
  storyboard_list.forEach(function(curr,i,ar){
    try{
      update_anchor_lines(i+1);
    }catch(e){}
  })
};

function add_close_icon(div,n){
  div.append('img')
      .attr('id','close-icon')
      .attr('src','img/close-icon2.png')
      .on('click',function(){
        $('#analysis_view_div_'+n).remove();
        $(this).parent().remove();
        d3.selectAll(".timestep-select").remove();
        d3.select('#timestep_marker_'+n).remove();
        d3.select('#anchor_line_'+n).remove();
        num_lenses--;
        lense_lst[n-1].deleted = true;

        lense_lst.forEach(function(lens){
          lens.setActive(false);
        });
//         $("#filter_options_div").empty();

//         if($('input[name=Global-Normalization]').prop('checked')){
//           set_lenses_global();
//         }
//         else{
//           set_lenses_local();
//         }
      });
};

function transform_lense_labels(id,chart){d3.select(id).select(".num-entities").style("margin-bottom",String(chart.height())+"px")};

function capitalizeFirstLetter(string) {return string.charAt(0).toUpperCase() + string.slice(1);};

function timestep_main_chart(x,d){
  d3.select(".timestep-single").remove();

  const timestep_single = d3.select("#storylines_g_child").append("g").attr("class","timestep-single");

  lense_lst.forEach(function(lens){
    lens.show_timesteps(x,d);
  });

  timestep_single
    .append("rect")
      .attr("fill","gray")
      .attr("y",20)
      .attr("x",graph_x(x))
      .attr("height",$("#scale_y_row").slider("value"))
      .attr("width",2)
      .attr("transform", "translate(" + 0 + "," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height - graph_margin.top) + ")");

  timestep_single
    .append("text")
      .attr("fill","gray")
      .attr("y",+$("#scale_y_row").slider("value")+40)
      .attr("x",graph_x(x)-10)
      .attr("transform", "translate(" + 0 + "," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height - graph_margin.top) + ")")
      .text(x);

  timestep_single
    .append("text")
      .attr("fill","gray")
      .attr("y",10)
      .attr("x",graph_x(x)-10)
      .attr("transform", "translate(" + 0 + "," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height - graph_margin.top) + ")")
      .text(x);
};

function hide_timesteps(x){
  lense_lst.forEach(function(lens){
    if(lens instanceof OnChartLense) lens.lens_mouseout();
    if(lens instanceof Lense)lens.hide_timestep(x);
  });
};

function set_lenses_local(){
  const lenses = get_lens_lists();

  lenses.trend.forEach(function(trend){
    trend.getTrend().setToLocal();
  });
  lenses.group.forEach(function(group){
    group.getGroup().setToLocal();
  });
  lenses.egoline.forEach(function(egoline){
    egoline.getFreq().setToLocal();
  });
};

function set_lenses_global(){
  const lenses = get_lens_lists();
  lenses.trend.forEach(function(trend){
    trend.getTrend().setToGlobal(get_trend_min_max(),get_global_color_palette());
  });

  lenses.group.forEach(function(group){
    group.getGroup().setToGlobal(get_groups_max());
  });

  lenses.egoline.forEach(function(egoline){
    egoline.getFreq().setToGlobal(get_egolines_max());
  });

  /*
  Closures
   */
   function get_trend_min_max(){
     let min = 0,
         max = 0;

     lenses.trend.forEach(function(trend){
       let domain = trend.getTrend().getDomain();
       if(min>domain[0]) min = domain[0];
       if(max<domain[1]) max = domain[1];
     });

     return [min,max];
   };

   function get_global_color_palette(){
     let d = [],
         color_palette = [];

     lenses.trend.forEach(function(trend){
       d = d.concat(trend.getTrend().color_palette);
     });

     $.each(d, function(i, el){
       if($.inArray(el, color_palette) === -1) color_palette.push(el);
     });

     return color_palette.sort((a, b) => a - b);
   };

   function get_groups_max(){
     let area_global_max_num_entities = 0,
         area_global_min_num_entities = 0,
         bar_global_max_num_entities = 0,
         bar_global_min_num_entities = 0;

     lenses.group.forEach(function(group){
       const area_scale = group.getGroup().getAreaScale(),
             bar_scale = group.getGroup().getBarScale();

       if(area_scale.max > area_global_max_num_entities) area_global_max_num_entities = area_scale.max;
       if(area_scale.min < area_global_min_num_entities) area_global_min_num_entities = area_scale.min;
       if(bar_scale.max > bar_global_max_num_entities) bar_global_max_num_entities = bar_scale.max;
       if(bar_scale.min < bar_global_min_num_entities) bar_global_min_num_entities = bar_scale.min;

     });
     return {
      area:[area_global_min_num_entities,area_global_max_num_entities],
      bar:[bar_global_min_num_entities,bar_global_max_num_entities]
     };
   }

   function get_egolines_max(){
     let global_max_num_entities = 0;

     lenses.egoline.forEach(function(egoline){
       let max = egoline.getFreq().getMaxNumEntities();
       if(global_max_num_entities < max) global_max_num_entities = max;
     });
     return global_max_num_entities;
   }
};

function get_lens_lists(){
  let trend_list   = [],
      group_list   = [],
      outlier_list = [],
      egoline_list = [];

  lense_lst.forEach(function(lens){
    if(lens.getType() == "trend" && lens.deleted == false) trend_list.push(lens);
    if(lens.getType() == "group" && lens.deleted == false) group_list.push(lens);
    if(lens.getType() == "outlier" && lens.deleted == false) outlier_list.push(lens);
    if(lens.getType() == "single line" && lens.deleted == false) egoline_list.push(lens);
  });

  return {
    trend:trend_list,
    group:group_list,
    outlier:outlier_list,
    egoline:egoline_list
  }
}
d3.selection.prototype.add_range_annotations_mouseover = function(n){ //FIXME: Does not scale with new layout.
  let _this = this;

  let   w = _this.style("width"),
        h = _this.style("height");

  _this.selectAll("*")
  .on("mouseover",function(){
    const d0 = lense_lst[n-1].selected_range.start,
          d1 = lense_lst[n-1].selected_range.stop;
    d3.selectAll(".timestep-select").remove();
    d3.select("#storylines_g_child").append("rect")
      .attr("class","timestep-select")
      .attr("y",20).attr("x",graph_x(d0))
      .attr("height",default_chart_styles.spacing_y).attr("width",graph_x(d1)-graph_x(d0))
      .attr("transform", "translate(" + 0 + "," +
                                    (storylines_g_margin.bottom + (default_chart_styles.spacing_y) -
                                      storyline_height - graph_margin.top) + ")");
  })
  .on("mouseout",function(){
    d3.selectAll(".timestep-select").remove();
  });
};

function objectsAreSame(x,y) {
   let objectsAreSame = true;
   for(let propertyName in x) {
      if(x[propertyName] !== y[propertyName]) {
         objectsAreSame = false;
         break;
      }
   }
   return objectsAreSame;
};
function cohorts_are_equal(c1,c2){
  if(c1.length != c2.length) return false;

  c1 = c1.sort(function(a,b){return a.name - b.name || a.y - b.y;})
  c2 = c2.sort(function(a,b){return a.name - b.name || a.y - b.y;})

  for (let i = 0; i < c1.length; i++) {
    if(objectsAreSame(c1[i],c2[i])==false) return false;
  }
  return true;
};
function cohort_is_superset(c1,c2){
  if(c1.length < c2.length) return false;

  c1 = c1.sort(function(a,b){return a.name - b.name || a.y - b.y;});
  c2 = c2.sort(function(a,b){return a.name - b.name || a.y - b.y;});

  for (let i = 0; i < c2.length; i++) {
  //   if(objectsAreSame(c1[i],c2[i])==false) return false;
    if (c1.some(e => e.x == c2[i].x && e.y == c2[i].y && e.name == c2[i].name) == false) return false;
  }
    /* vendors contains the element we're looking for */
  // }
  return true;
};
Array.prototype.unique = function() {
    var a = this.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i] === a[j])
                a.splice(j--, 1);
        }
    }
    return a;
};

Array.prototype.includes_cohort = function(cohort) {
  let ret = [];
  ret = this.filter(function(el){
    return cohorts_are_equal(el,cohort);
  })
  return ret.length > 0;
}

Array.prototype.includes_superset_of_cohort = function(cohort) {
  let ret = [];
  ret = this.filter(function(el){
    return cohort_is_superset(el,cohort);
  })
  return ret.length > 0;
}

Array.prototype.merge_with_superset_of_cohort = function(cohort) {
  let ret = [];
  const _this = this;

  _this.forEach(function(el,i){
    if(cohort_is_superset(el,cohort)||cohorts_are_not_disjoint(el,cohort)){
      _this[i] = [...el, ...cohort].unique();
    }
  })
}

function intersect(a, b) {
    let t;
    if (b.length > a.length) t = b, b = a, a = t; // indexOf to loop over shorter
    return a.filter(function (e) {
        return b.indexOf(e) > -1;
    });
};

function cohorts_are_not_disjoint(a,b){
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < b.length; j++) {
      if(objectsAreSame(a[i],b[j])) return true;
    }
  }
  return false;
};

function highlight_all_entities(){
  d3.select()
}
