// Features
  function toggleLineText(buttonID){
    console.log('99999999999');
    var t = d3
        .duration(750)
        .ease(d3.easeLinear);

    var opacityValue = d3.select("#"+"xAxis").style("opacity");

    if (opacityValue == 1) {
      d3.select("#xAxis").transition(t).style('opacity','0')//.style( "opacity", 0 );
      d3.select("#"+buttonID).text("Axis Labels On");
    }
    else if (opacityValue == 0) {
      d3.select("#xAxis").transition(t).style('opacity','1')//.style( "opacity", 0 );
      d3.select("#"+buttonID).text("Axis Labels Off");
    }
  };

  function toggleNames(buttonID){
    var t = d3
        .duration(750)
        .ease(d3.easeLinear);

    var nameID = String(buttonID).replace(/_name_toggle/g,'');
    var opacityValue = d3.select("#"+nameID+"_textID").style("opacity");

    if (opacityValue == 1) {
      d3.select("#"+nameID+"_textID").transition(t).style('opacity','0');
      d3.select("#"+buttonID).text("Name On");
      // d3.selectAll(".storyline").selectAll("text").transition(t).style('opacity','0');
    }
    else if (opacityValue == 0) {
      d3.select("#"+nameID+"_textID").transition(t).style('opacity','1');
      d3.select("#"+buttonID).text("Name Off");
      // d3.selectAll(".storyline").selectAll("text").transition(t).style('opacity','1');
    }
  };

  function toggleAllNames(buttonID,random_character){
    var t = d3
        .duration(750)
        .ease(d3.easeLinear);

    // console.log(buttonID);

    var opacityValue = d3.select("#"+random_character+"_textID").style("opacity");

    if (opacityValue == 1) {
      d3.select("#"+buttonID).text("Name On");
      d3.selectAll(".storyline").selectAll("text").transition(t).style('opacity','0');
    }
    else if (opacityValue == 0) {
      d3.select("#"+buttonID).text("Name Off");
      d3.selectAll(".storyline").selectAll("text").transition(t).style('opacity','1');
    }
  };

  function toggleStorylineThickness(lineID,thicknessNum){ // takes in line id which is the name of the character
    var t = d3
        .duration(750)
        .ease(d3.easeLinear);

    d3.select("#"+lineID).transition(t).style('stroke-width',thicknessNum);
  };

function toggleLineColor(lineID,colorInHex){ // pass in a hexadecimal value and change the color of that line
  lineID = String(lineID).replace(/_color_toggle/g,'').replace("#","");
  d3.select("#"+lineID).style("stroke", colorInHex);     // set the fill colour
  d3.selectAll("."+lineID).style("stroke", colorInHex);
};

function toggleGroupColor(id,colorInHex){ // pass in a hexadecimal value and change the color of that line
  var id = String(id).replace(/_color_toggle/g,'');
  // $('#'+lineID).css("color","black");
  d3.select("."+id).style("fill", colorInHex).style('stroke', darken(colorInHex,20));     // set the fill colour

};

function set_storyline_toggle_dashboard(parent_container){
  var nav_bar_height = d3.select('.nav-wrapper').style('height');

  var group_toggle_label_height = 50;

  var table_div = parent_container.append('div')
    .attr('id','storyline_toggle')
    .style('overflow-y','scroll')
    .style('position','absolute')
    .style('top', parseFloat(nav_bar_height) + parseFloat($(window).height())*(2/6) - group_toggle_label_height*2 + "px" )
    .style('left', parseFloat($(window).width()*(0/12)) + "px")
    .style('height', parseFloat($(window).height()*(1/6)) - parseFloat(nav_bar_height) + "px")
    .style('width', parseFloat($(window).width()*(3/12)) + "px")
    .style('border-style','solid')
    .style('border-width','1px');

    // var line_toggle_label = d3.select('body').append('h5').text("Entity")
    //   .style('position','absolute')
    //   .style('top', parseFloat(nav_bar_height) + parseFloat($(window).height())*(5/6) - line_toggle_label_height*2 + "px" )
    //   .style('left', parseFloat($(window).width()*(9/12)) + "px");

  // table_div.append('h5').text('Lense Size');
};

function set_group_toggle_dashboard(parent_container){

  var nav_bar_height = parseFloat(d3.select('.nav-wrapper').style('height'));
  var input_padding = 10;

  var group_toggle_label_height = 50;

  // var group_toggle_label = parent_container.append('h5').text("Entities");
  // parent_container.append('p').text('Make changes to Groups and Lines')
  //   .style('color','#d3d3d3')
  //   .style('font-size','150%');

  var group_toggle_search = parent_container.append('input').attr('type','text')
    .attr('id','group_toggle_search_ID')
    .attr("placeholder","Search for a Group")
    .attr('oninput','group_toggle_search_did_change(this.value,"group_controls_body_each_line")')
    // .style('font-size','120%')
    .on( "focusin", function(){user_typing = true;})
    .on( "focusout", function(){user_typing = false;});

  // var table_div = parent_container.append('div')
  //   .attr('id','group_toggle')
  //   .style('overflow-y','scroll');


  var table_header = parent_container.append("table")
    // .attr('id','table_header')
    .attr("class"," table_header table");
  var row = table_header.append("thead")
    .append("tr");

  row.append("th").attr('class','table_header_cell_1').text("Name")
  row.append("th").attr('class','table_header_cell_2').text("Opacity")
  row.append("th").attr('class','table_header_cell_3').text("Color");

  var table_div = parent_container.append('div')
    .attr('id','group_toggle')
    .style('overflow-y','scroll');

  table_div.style('top',parseFloat(table_header.style('top'))+parseFloat(table_header.style('height')) +'px')

  var table = table_div.append("table")
    .attr("class","table");

  table.append("tbody")
    .attr("id","group_controls_body_each_line");
};

function set_line_toggle_dashboard(parent_container){

  var nav_bar_height = parseFloat(d3.select('.nav-wrapper').style('height'));
  var input_padding = 10;
  var line_toggle_label_height = 50;

  // var line_toggle_label = parent_container.append('h5').text("Entity")
  //   .style('position','absolute')
  //   .style('top', parseFloat(nav_bar_height) + parseFloat($(window).height())*(5/6) - line_toggle_label_height*2 + "px" )
  //   .style('left', parseFloat($(window).width()*(0/12)) + "px");

  var line_toggle_search = parent_container
    // .append('img').attr('src',"img/search.png").attr('width','30').attr('height','50')
    //   .style('position','absolute')
    //   .style('top', nav_bar_height + parseFloat($('#group_toggle_search_ID').height()) + parseFloat($('#group_toggle').height()) + 'px')
    //   .style('left', input_padding + parseFloat($(window).width()*(0/12)) + "px")
    .append('input').attr('type','text')
      .attr('id','line_toggle_search_ID')
      .attr("placeholder","Search for a Line")
      .attr('oninput','line_toggle_search_did_change(this.value,"controls_body_each_line")')
      .on( "focusin", function(){user_typing = true;})
      .on( "focusout", function(){user_typing = false;});

  var table_header = parent_container.append("table")
    // .attr('id','table_header')
    .attr("class"," table_header table");
  var row = table_header.append("thead")
    .append("tr");

  row.append("th").attr('class','table_header_cell_1').text("Name")
  row.append("th").attr('class','table_header_cell_2').text("Group")
  row.append("th").attr('class','table_header_cell_3').text("Color");

  var table_div = parent_container.append('div')
    .attr('id','group_toggle')
    .style('overflow-y','scroll');

  table_div.style('top',parseFloat(table_header.style('top'))+parseFloat(table_header.style('height')) +'px')

  var table = table_div.append("table")
    .attr("class","table");

  table.append("tbody")
    .attr("id","controls_body_each_line");
};

function set_axis_timestep_toggle(parent_container){

  var nav_bar_height = parseFloat(d3.select('.nav-wrapper').style('height'));
  var header_height = parseFloat(d3.select('#group_toggle_search_ID').style('height'));

  var axis_toggle_label = parent_container.append('h5').text("Axis");
    // .style('position','absolute')
    // .style('text-align','center')
    // .style('top', parseFloat(d3.select('#line_toggle').style('top')) + parseFloat($('#line_toggle').height()) + "px" )
    // .style('left', parseFloat($(window).width()*(1/12)) + "px");

  var table_div = parent_container.append('div')
    .attr('id','axis_toggle')
    // .style('position','absolute')
    // .style('top', parseFloat(d3.select('#line_toggle').style('top')) + parseFloat($('#line_toggle').height()) + header_height + "px" )
    // .style('left', parseFloat($(window).width()*(0/12)) + "px")
    // .style('height', parseFloat($(window).height()*1/6) - parseFloat(nav_bar_height) + 18 + "px")
    // .style('width', parseFloat($(window).width()*(3/12)) + "px");
    // .style('border-style','solid')
    // .style('border-width','1px');

  var table = table_div.append("table")
    .attr('id','timestep_toggle_id')
    .attr("class","table");
    // .attr("class","table table-bordered table-condensed table-responsive table-hover");

  var row = table.append("thead")
    .append("tr");

  row.append("th").text("Opacity")
  row.append("th").text("Color");

  table.append("tbody")

  var table = document.getElementById('timestep_toggle_id');
  var row = table.insertRow(1);
  // var nameCell = row.insertCell(0);
  var opacityCell = row.insertCell(0); // Not defined yet
  var colorCell = row.insertCell(1);
  opacityCell.innerHTML = "<input type='range' value="+0.5+" min='0' max='0.5' step='0.001' oninput='toggleAxisOpacity(value)'/>"
  colorCell.innerHTML = "<input type='color' size ='2' id='timestep_color_toggle' value='#808080' onChange='toggleAxisColor(value)'>";

  // Crappy centering b/c css is failing
  // console.log($('#timestep_color_toggle').parent().width());
};

function toggleAxisOpacity(val){
  // d3.selectAll('.axis--x').selectAll('line').style('opacity',val);
  // d3.selectAll('.axis--x').selectAll('path').style('opacity',val);
  d3.selectAll('.axis--x').selectAll('text').style('opacity',val);
};

function toggleAxisColor(colorInHex){ // pass in a hexadecimal value and change the color of that line
  d3.selectAll('.axis--x').selectAll('line').style('stroke',colorInHex);
  d3.selectAll('.axis--x').selectAll('path').style('stroke',colorInHex);
  d3.selectAll('.axis--x').selectAll('text').style('fill',colorInHex);
};

function set_all_line_toggle(parent_container){

  function toggleAxisOpacity(val){
    // d3.selectAll('.axis--x').selectAll('line').style('opacity',val);
    // d3.selectAll('.axis--x').selectAll('path').style('opacity',val);
    d3.selectAll('.axis--x').selectAll('text').style('opacity',val);
  };

  var nav_bar_height = parseFloat(d3.select('.nav-wrapper').style('height'));
  var header_height = parseFloat(d3.select('#group_toggle_search_ID').style('height'));

  var axis_toggle_label = parent_container.append('h5').text("Line Thickness");

  var table_div = parent_container.append('div')
    .attr('id','all_line_toggle');

  var table = table_div.append("table")
    .attr('id','all_line_toggle_id')
    .attr("class","table table-bordered");

  table.append("tbody")

  var table = document.getElementById('all_line_toggle_id');
  var row = table.insertRow(0);
  var thicknessCell = row.insertCell(0);
  thicknessCell.innerHTML = "<input type='range' value="+storyline_thickness+" min='6' max='27' step='3' oninput='toggleAllStorylineThickness(value)'/>"
  // colorCell.innerHTML = "<input type='color' size ='2' id='timestep_color_toggle' value='#808080' onChange='toggleAxisColor(value)'>";
};

function toggleAllStorylineThickness(val){
  // d3.selectAll('.text_label_background').remove();
  storyline_thickness = parseFloat(val);

  	characters.forEach(function(curr){
      d3.selectAll("."+curr).style('stroke-width',val);
  	})

    // d3.selectAll(".point").attr("r", val);
    update_text_labels(graph_x,graph_y);
    d3.selectAll('line').selectAll('#text_label').raise();
    d3.selectAll('.text_label_background').raise();
    // textPath update end
};

function set_name_style_toggle(parent_container){
  var nav_bar_height = parseFloat(d3.select('.nav-wrapper').style('height'));
  var header_height = parseFloat(d3.select('#group_toggle_search_ID').style('height'));

  var label = parent_container.append('h5').text("Name Styling");
    // .style('position','absolute')
    // // .style('text-align','center')
    // .style('top', parseFloat(d3.select('#all_line_toggle').style('top')) + parseFloat($('#all_line_toggle').height()) - 25 + "px" )
    // .style('left', parseFloat($(window).width()*(0.5/12)) + "px");

  var table_div = parent_container.append('div')
    .attr('id','name_styling_toggle_id');
    // .style('position','absolute')
    // .style('top', parseFloat(d3.select('#all_line_toggle').style('top')) + parseFloat($('#all_line_toggle').height()) - 25 + header_height + "px" )
    // .style('left', parseFloat($(window).width()*(0/12)) + "px")
    // .style('height', parseFloat($(window).height()*1/6) - parseFloat(nav_bar_height) + 18 + "px")
    // .style('width', parseFloat($(window).width()*(3/12)) + "px");

  var table = table_div.append("table")
    .attr('id','name_styling_toggle')
    .attr("class","table table-bordered");

  table.append("tbody")

  var table = document.getElementById('name_styling_toggle');
  var row = table.insertRow(0);
  var inlineCell = row.insertCell(0);
  var endpointCell = row.insertCell(1);

  inlineCell.innerHTML = "<button type="+'button'+" onclick='toggleInlineNaming()' style="+'width:100% ; height:100%'+">Inline Style On</button>"
  endpointCell.innerHTML = "<button type="+'button'+" onclick='toggleEndpointNaming()' style="+'width:100% ; height:100%'+">Endpoint Style Off</button>"
};

function scale_graph_x_axis(val,x){
  const stack_graph_data = convert_bubble_set_data_to_stack_graph_data(_bubbleset_data);

  graph_x       = d3.scaleLinear().range([0, parseFloat(default_chart_styles.spacing_x)]).domain([0,lengthOfStoryline-1]),
  bar_x         = d3.scaleLinear().range([0, parseFloat(default_chart_styles.spacing_x)]).domain(d3.extent(stack_graph_data, function(d,i) { return i }));

  const x_axis = d3.axisBottom(x).ticks($("#axis_number_of_ticks_slider").slider("value")).tickValues(graph_x.ticks($("#axis_number_of_ticks_slider").slider("value")).concat(graph_x.domain()));

  if(group_mode_active || line_mode_active || outlier_mode_active || trend_mode_active) add_timestep_range_selection();

  timestep_marker_lst.forEach(function(marker){marker.transform(val)});

  d3.select('#bottom_x_axis').selectAll(".tick").remove();

  d3.select('#bottom_x_axis')
    .call(x_axis.tickSize(-parseFloat(default_chart_styles.spacing_y)+100).ticks(parseFloat($("#axis_number_of_ticks_slider").slider("value"))));

  d3.select('#top_x_axis').selectAll(".tick").remove();

  d3.select('#top_x_axis')
    // .attr("transform", "translate(0," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")")
    .call(x_axis.tickSize(0).ticks(parseFloat($("#axis_number_of_ticks_slider").slider("value"))));

  d3.selectAll('#top_x_axis').selectAll('.tick').selectAll('text').attr('transform','translate(10,' + (-40) +') rotate(-45)');
  d3.selectAll('#bottom_x_axis').selectAll('.tick').selectAll('text').attr('transform','translate(10,'+ (40) +') rotate(-45)');

  update_lines(x,rescaled_graph_y||graph_y);
  update_groups(x,rescaled_graph_y||graph_y);
  update_all_anchor_lines();
};

function scale_graph_y_axis(val,y){
  const x_axis   = d3.axisBottom(rescaled_graph_x||graph_x).tickSize(-parseFloat(val)).ticks(parseFloat($("#axis_number_of_ticks_slider").slider("value")));
  const stack_graph_data = convert_bubble_set_data_to_stack_graph_data(_bubbleset_data);

  if(group_mode_active || line_mode_active || outlier_mode_active || trend_mode_active) add_timestep_range_selection();

  timestep_marker_lst.forEach(function(marker){
    if(marker instanceof TimestepSignature2D) marker.transform();
  });

  storyline_height  = parseFloat(val);
  // graph_y           = update_graph_y(storyline_height,graph_y_data);

  // d3.select('#bottom_x_axis')
  // .call(x_axis);
  //
  // d3.select('#top_x_axis')
  // .attr("transform", "translate(0," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")")
  //
  // d3.selectAll('#top_x_axis').selectAll('.tick').selectAll('text').attr('transform','translate(-10,' + (-40) +') rotate(-45)');
  // d3.selectAll('#bottom_x_axis').selectAll('.tick').selectAll('text').attr('transform','translate(-10,'+ (40) +') rotate(-45)');

  update_lines(rescaled_graph_x||graph_x,y);
  update_groups(rescaled_graph_x||graph_x,y);
  update_all_anchor_lines();
};

function scale_storyline_slider_released(){
  change_analysis_mode("Storyline_mode");
  update_lines(rescaled_graph_x,rescaled_graph_y);
  update_groups(rescaled_graph_x,rescaled_graph_y);
  update_all_anchor_lines();
};

function toggleInlineNaming(){
  characters.forEach(function(curr){
    $(".text_label_"+curr).fadeTo(0, 1);
    $(".text_label_background").fadeTo(0, 1);
  })
  $(".Endpoint").fadeTo(0, 0);
};

function toggleEndpointNaming(){
  characters.forEach(function(curr){
    $(".text_label_"+curr).fadeTo(0, 0);
    $(".text_label_background").fadeTo(0, 0);
  })
  $(".Endpoint").fadeTo(0, 1);
};

function toggleNoNaming(){
  characters.forEach(function(curr){
    $(".text_label_"+curr).fadeTo(0, 0);
    $(".text_label_background").fadeTo(0, 0);
  })
  $(".Endpoint").fadeTo(0, 0);
};

function toggle_name_style(val){
  if(val == "Endpoint") toggleEndpointNaming();
  else if(val == "Inline") toggleInlineNaming();
  else if(val == "None") toggleNoNaming();
};

/* Reset Function Handlers */

function reset_settings(){
  console.log('reset_settings called')

  $("#name_styling_dropdown").val(default_chart_styles.name_display);
  toggle_name_style(default_chart_styles.name_display);

  $("#line_thickness_slider").val(default_chart_styles.line_thickness);
  toggleAllStorylineThickness(parseFloat(default_chart_styles.line_thickness));

  $("#axis_colorpicker").minicolors('value',default_chart_styles.axis_thickness_color);
  toggleAxisColor(default_chart_styles.axis_thickness_color);

  $("#axis_thickness_slider").val(default_chart_styles.axis_thickness_val);
  d3.selectAll('.axis--x').selectAll('path')

    .style('stroke-width', default_chart_styles.axis_thickness_val+'px');
  d3.selectAll('.axis--x').selectAll('line')

    .style('stroke-width', default_chart_styles.axis_thickness_val+'px');

  reset_axes();
  // reset_axis_style();
//   $("#filter_options_div").slideUp("slow");
  $("#entities_options_div").slideUp("slow");
  $("#groups_options_div").slideUp("slow");
};


// @chris - I commented out these functions because I'm not sure they're needed. Please advise...
function reset_axes(){
  $("#axis_number_of_ticks_slider").slider("value",default_chart_styles.num_ticks);
  $("#scale_x_row").slider("value",$(window).width() - 290);
  $("#scale_y_row").slider("value",default_chart_styles.spacing_y);

  storyline_height  = default_chart_styles.spacing_y;

  scale_graph_y_axis(default_chart_styles.spacing_y);

  scale_graph_x_axis($(window).width()	- 290);

  storylines_g.call(zoom.transform, d3.zoomIdentity.translate(0,0).scale(1))
};

function reset_line_thickness(){ $("#line_thickness_slider").slider("value",default_chart_styles.line_thickness);};
function reset_line_opacity(){ $("#line_opacity_slider").slider("value",default_chart_styles.line_opacity);};
function reset_group_opacity(){ $("#group_opacity_slider").slider("value",default_chart_styles.group_opacity);};

function set_line_thickness(val){ $("#line_thickness_slider").slider("value",val);};
function set_line_opacity(val){ $("#line_opacity_slider").slider("value",val);};
function set_group_opacity(val){ $("#group_opacity_slider").slider("value",val);};

// function reset_axis_style(){
//   $('#Axis_style').prop('checked', false);
//   $('#Axis_style_solid').prop('checked', true);
//   set_axis_style("Solid");
// };
//

/*
 * ANALYSIS MODE
 */

 let group_mode_active = line_mode_active = outlier_mode_active = trend_mode_active = context_mode_active = flow_mode_active = timestep_select_active = false;

function change_analysis_mode(mode){

     group_mode_active = line_mode_active = outlier_mode_active = trend_mode_active = context_mode_active = flow_mode_active = false;

     $("#Storyline_mode").removeClass("active");
     $("#Group_mode").removeClass("active");
     $("#Trend_mode").removeClass("active");
     $("#Line_mode").removeClass("active");
     $("#Outlier_mode").removeClass("active");
     $("#Context_mode").removeClass("active");
     $("#Flow_mode").removeClass("active");
     $("#"+mode).addClass("active");


     console.log('000000000',mode);
     switch(mode){
       case "Group_mode":
           group_mode_active = true;
           reset();
           activate_group_mode();
           $("#entities_options_div").slideUp("slow");
           $("#groups_options_div").slideDown("slow");
           break;

       case "Line_mode":
           line_mode_active = true;
           reset();
           activate_line_mode();
           $("#entities_options_div").slideDown("slow");
           $("#groups_options_div").slideUp("slow");
           break;

       case "Outlier_mode":
           outlier_mode_active = true;
           reset();
           add_timestep_range_selection();
           $("#entities_options_div").slideDown("slow");
           $("#groups_options_div").slideUp("slow");
           break;

       case "Trend_mode":
           trend_mode_active = true;
           reset();
           add_timestep_range_selection();
           $("#entities_options_div").slideUp("slow");
           $("#groups_options_div").slideUp("slow");
           break;

       case "Context_mode":
           context_mode_active = true;
           reset();
           add_2d_timestep_range_selection();
           $("#entities_options_div").slideUp("slow");
           $("#groups_options_div").slideUp("slow");
           break;

      case "Flow_mode":
          flow_mode_active = true;
          reset();
          add_2d_timestep_range_selection();
          break;

       case "Storyline_mode":
           reset();
           break;

       default:
         return;
     }
 };

 /*
  * MODE IN/ACTIVATION HANDLER FUNCTIONS - activate_line_mode, activate_group_mode
  *
  * Handlers that are called when the user switches the mode. Called from change_analysis_mode().
  */

 /*
  * activate_line_mode - Handler that runs set-up/tear-down for LINE Mode context.
  */
 function activate_line_mode(){
   remove_timestep_range_selection();
 	// d3.select("#groups_g_ID").lower();
 	fade_storyline_entities(default_chart_styles.line_opacity);
  fade_groups(default_chart_styles.group_opacity);
 	timestep_select_active = false;
 };

 /*
  * activate_group_mode - Handler that runs set-up/tear-down for GROUP Mode context.
  */
 function activate_group_mode(){
   remove_timestep_range_selection();
   d3.select("#groups_g_ID").raise();
   fade_storyline_entities(0);
   fade_groups(0.7);
 };

 function reset(){
   remove_timestep_range_selection();
   d3.selectAll(".entity").raise();
   d3.select("#groups_g_ID").lower();
   d3.select("#top_x_axis").lower();
   d3.select("#bottom_x_axis").lower();
   d3.selectAll(".entity_checkbox").property('checked',false);
   d3.selectAll(".group_checkbox").property('checked',false);
   select_entity=[];
   select_group=[];
   fade_storyline_entities(default_chart_styles.line_opacity);
   fade_groups(default_chart_styles.group_opacity);
 };

 /*
  * RENDERING FUNCTIONS - fade_storyline_entities, fade_storyline_line, fade_circles.
  */

 /*
  * fade_storyline_entities - Aggregate call to fade in storyline entities: lines, endpoints, and text labels.
  */
 function fade_storyline_entities(n){
  fade_storyline_line(n);
  fade_circles(n);
  // fade_text_label(n);
 };

 function fade_line(id,num){
   const entity_w = $('#line_thickness_slider').slider("option", "value");
   // d3.select("#storylines_g_child").selectAll(".entity").style("opacity",num).style("stroke-width",entity_w); // Do this for the group_1_renderer
   d3.select("#storylines_g_child").selectAll(".entity").style("opacity",num);
   d3.select("#storylines_g_child").selectAll(".point").style("opacity",num);
   d3.select("#storylines_g_child").selectAll(".group").style("opacity",num);
   d3.select("#storylines_g_child").selectAll("text").style("opacity",num);

   d3.select("#storylines_g_child").selectAll("."+id).style("opacity",1);
    // .style("stroke-width",entity_w*3);
 };

 function fade_lines(list,num){
   d3.select("#storylines_g_child").selectAll(".entity").style("opacity",num);
   d3.select("#storylines_g_child").selectAll(".point").style("opacity",num);
   d3.select("#storylines_g_child").selectAll(".group").style("opacity",num);
   d3.select("#storylines_g_child").selectAll("text").style("opacity",num);

   for(let i=0;i<list.length;i++){
     d3.select("#storylines_g_child").selectAll("."+list[i]).style("opacity",1);
   }

 }

 function fade_group(id,num){
   d3.select("#storylines_g_child").selectAll(".entity").style("opacity",num);
   d3.select("#storylines_g_child").selectAll(".point").style("opacity",num);
   d3.select("#storylines_g_child").selectAll(".group").style("opacity",num);
   d3.select("#storylines_g_child").selectAll("."+id).style("opacity",0.7);
 };

 function fadegroups(list,num){
   d3.select("#storylines_g_child").selectAll(".entity").style("opacity",num);
   d3.select("#storylines_g_child").selectAll(".point").style("opacity",num);
   d3.select("#storylines_g_child").selectAll(".group").style("opacity",num);

   for(let i=0;i<list.length;i++){
     d3.select("#storylines_g_child").selectAll("."+list[i]).style("opacity",0.7);
   }
   
 };

 /*
 * fade_storyline_line - Fades in/out the storyline lines.
 * @num: Opacity value to change to.
 */
 function fade_storyline_line(num){d3.selectAll(".entity").style("opacity",num);d3.selectAll(".start").style("opacity",num);d3.selectAll(".end").style("opacity",num);};

 /*
 * fade_circles - Fades in/out the storyline end points.
 * @num: Opacity value to change to.
 */
 function fade_circles(num){d3.selectAll(".point").style("opacity",num);};

 /*
 * fade_groups - Fades in/out the storyline groups.
 * @num: Opacity value to change to.
 */
 function fade_groups(num){d3.selectAll(".group").style("opacity",num);};

 /*
  * TODO: fade_text_label
  */
 function fade_text_label(num){
 // d3.select("#text_label").attr('opacity',num);
 // characters.forEach(function(curr){
 // 	$(".text_label_"+curr).fadeTo(0, num);
 // })
 };

 function on_mouseover_entity(id){
   d3.selectAll(".selection").attr("fill-opacity",0);
   fade_line(id,0);
   fade_groups(0.3);

   const DT_id = "#"+id+"_DT_row";
   $(".dataTables_scrollBody").scrollTo(DT_id);
   d3.select(DT_id).style("background-color","#d3d3d3");
 };

 function on_mouseout_entity(){
   d3.selectAll(".selection").attr("fill-opacity",0.3);
   fade_line(null,1);
   fade_groups(0.5);
 };

function on_mouseover_group(id){
   d3.selectAll(".selection").attr("fill-opacity",0);
   fade_group(id,0);
   fade_storyline_entities(0.3);

   // const DT_id = "#"+id+"_DT_row";
   // $(".dataTables_scrollBody").scrollTo(DT_id);
   // d3.select(DT_id).style("background-color","#d3d3d3");
};

 function on_mouseout_group(){
   // d3.select(DT_id).style("background-color","white");
   d3.selectAll(".selection").attr("fill-opacity",0.3);
   fade_storyline_entities(1);
   fade_groups(0.5);
 };
