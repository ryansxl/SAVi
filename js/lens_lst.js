function update_storyboard(view,analysis_type,name,d0,d1){
  storyboard_list.push(create_storyboard_object(analysis_type,name,d0,d1,null));

  // saveSvgAsPng(document.getElementById(view._groups[0][0].id), "diagram.png", {scale: 0.5});
  // var scale_value = get_image_scale_value(view);
  // if(scale_value>1) scale_value = 1;
  // // view.select('rect').style('stroke-width','0px');
  //
  // // svgAsDataUri(document.getElementById(view._groups[0][0].id), {scale: scale_value}, function(uri) {
  // svgAsDataUri(document.getElementById(view.attr('id')), {scale: scale_value}, function(uri) {
  //   storyboard_list.push(create_storyboard_object(analysis_type,name,d0,d1,uri));
  //   loadStoryboardControlsRow(storyboard_list,"storyboard_each_line");
  //   // d3.select('#'+view._groups[0][0].id).select('rect').style('stroke-width','10px');
  //
  // });
};

// DATA

let storyboard_list = [];

function create_storyboard_object(analysis_type,name,d0,d1,url){
  if(analysis_type === "single line"){
    return {
      dataset: get_dataset_name(),
      start: d0,
      stop: d1,
      length: d1 - d0,
      name: name,
      mode: analysis_type,
      num: storyboard_list.length + 1,
      image_data: url
    };
  }
  else if(analysis_type === "group"){
    return {
      dataset: get_dataset_name(),
      start: 1,
      stop: lengthOfStoryline,
      length: lengthOfStoryline,
      name: name,
      mode: analysis_type,
      num: storyboard_list.length + 1,
      image_data: url
    };
  }
  else{
    return {
      dataset: get_dataset_name(),
      start: d0,
      stop: d1,
      length: d1 - d0,
      mode: analysis_type,
      num: storyboard_list.length + 1,
      image_data: url
    };
  }
};

function get_dataset_name(){
  if($(".selectpicker").val() == 1) return "Star Wars Original Trilogy";
  else if($(".selectpicker").val() == 1) return "Python Code Swarm";
};

// RENDERING

function set_storyboard(parent_view){

  var nav_bar_height = d3.select('.nav-wrapper').style('height');
  // var tabbed_view = setup_tabbed_view();

  var table_li = parent_view.append('li').attr('class','active');

  var table_div = table_li.append('div')
    .attr('id','storyboard_container')
    .style('overflow-y','scroll')
    .style('position','absolute')
    .style('top', parseFloat(nav_bar_height) + "px" )
    .style('left', parseFloat($(window).width()*(0/12)) + "px")
    .style('height', parseFloat($(window).height()) - parseFloat(nav_bar_height) + "px")
    .style('width', parseFloat($(window).width()*(3/12)) + "px")
    .style('border-style','solid')
    .style('border-width','1px')
    .style('border-color','#d3d3d3');

  var table = table_div.append("table")
    .attr("class","table table-condensed table-responsive");

  table.append("tbody")
    .attr("id","storyboard_each_line");

  loadStoryboardControls(storyboard_list,"storyboard_each_line");
};

function loadStoryboardControlsRow(character,id){
  var nav_bar_height = d3.select('#nav_bar').style('height');

  var row = $("<tr>");

  row.append($("<div id='storyboard_chart_"+(storyboard_list.length -1)+"'><svg id='storyboard_chart_label_"+(storyboard_list.length -1)+"'></svg><img class='storyboard_chart_img' id='storyboard_chart_img_"+(storyboard_list.length-1)+"' src='"+storyboard_list[storyboard_list.length-1].image_data+"'></img></div>"));
  $("#"+id).append(row);

  var num = storyboard_list.length - 1;
  create_label_on_storyboard_chart(num);

  d3.select("#storyboard_chart_img_"+(num))
    // .attr("height",parseFloat($(window).height()/5))
    // .attr("width",parseFloat($(window).width()*(3/12)))
    .attr("height",parseFloat($(window).height()/5))
    .attr("width",parseFloat($(window).width()*(3/12)))
    .on('click',function(){
      // console.log(d3.select(this)._groups[0][0].x);
      d3.selectAll('.background_storyboard').remove();

      d3.select('#main_view_svg')
        .append('rect')
          .attr('class','background_storyboard')
          .attr('x', parseFloat($(window).width()*(3/12)))
          .attr('y',0)
          .attr('height',parseFloat($(window).height()) - parseFloat(nav_bar_height))
          .attr('width',parseFloat($(window).width()*(10/12)))
          .attr('fill','black')
          .attr('opacity',0.8);

      var background_storyboard_image_xpos = (parseFloat($(window).width()*(9/12))/2) - d3.select(this)._groups[0][0].width/2;
      var background_storyboard_image_ypos = ((parseFloat($(window).height()) - parseFloat(nav_bar_height))/2) - d3.select(this)._groups[0][0].height*2;
      var background_storyboard_image_w = d3.select(this)._groups[0][0].width*2;
      var background_storyboard_image_h = d3.select(this)._groups[0][0].height*2;

      var i = 0;

      for (var key in storyboard_list[num]) {
        i += 1;
        if (!storyboard_list[num].hasOwnProperty(key)) continue;
        if(key === "image_data") continue;
        d3.select('#main_view_svg')
          .append("text")
            .attr('class','background_storyboard_text')
            .attr("x", '50%')
            .attr("y", background_storyboard_image_ypos + ((parseFloat($(window).height()) - (parseFloat(nav_bar_height))/2)/15)*i)
            // .transition().duration(500)
            // .attr("y", background_storyboard_image_ypos + background_storyboard_image_h + ((parseFloat($(window).height()) - (parseFloat(nav_bar_height))/2)/15)*i)
            .attr('opacity',0)
            .attr('fill', mode_color(storyboard_list[num].mode))
            .text(key + ": " + storyboard_list[num][key]);
      }

      d3.select('#main_view_svg')
        .append('image')
          .attr('class','background_storyboard')
          .attr('xlink:href',storyboard_list[num].image_data)
          .attr('height', d3.select(this)._groups[0][0].width)
          .attr('width', d3.select(this)._groups[0][0].height)
          .attr('x', d3.select(this)._groups[0][0].x + graph_margin.left)
          .attr('y', d3.select(this)._groups[0][0].y - parseFloat(nav_bar_height) - graph_margin.top - graph_margin.bottom)
        .transition().duration(500)
          .attr('x', background_storyboard_image_xpos)
          .attr('y', background_storyboard_image_ypos)
        .transition().duration(200)
          .attr('width', background_storyboard_image_w)
          .attr('height', background_storyboard_image_h);

      setTimeout(function(){
        d3.selectAll(".background_storyboard_text")
          .attr('opacity',1)
          .transition().duration(300)
          .attr('transform','translate(0,'+background_storyboard_image_h+')');
      //       var i = 0;
      //
      //       for (var key in storyboard_list[num]) {
      //         i += 1;
      //         if (!storyboard_list[num].hasOwnProperty(key)) continue;
      //         if(key === "image_data") continue;
      //         d3.select('#main_view_svg')
      //           .append("text")
      //             .attr('class','background_storyboard')
      //             .attr("x", background_storyboard_image_xpos)
      //             .attr("y", background_storyboard_image_ypos + ((parseFloat($(window).height()) - (parseFloat(nav_bar_height))/2)/15)*i)
      //             .transition().duration(500)
      //             .attr("y", background_storyboard_image_ypos + background_storyboard_image_h + ((parseFloat($(window).height()) - (parseFloat(nav_bar_height))/2)/15)*i)
      //             .attr('stroke','#d3d3d3')
      //             .text(key + ": " + storyboard_list[num][key]);
      //       }
      }, 700);
    })
    .on('mouseout',function(){
      d3.selectAll('.background_storyboard').remove();
      d3.selectAll('.background_storyboard_text').remove();
    });
};

function create_label_on_storyboard_chart(n){
  var h = 25;
  var svg = d3.select("#"+'storyboard_chart_label_'+n)
    .attr('height', h)
    .attr('width', parseFloat($(window).width()*(3/12)))
    .style("background-color", mode_color(storyboard_list[n].mode));

  var num_label = svg.append("text")
    .attr('x','10%')
    .attr('y','80%')
    .text(n+1)
    .style('font-size',(h*0.85)+"px");

  var mode_label = svg.append("image")
    .attr('xlink:href',function(){
      if(storyboard_list[n].mode === "trend") return './img/t.png';
      else if(storyboard_list[n].mode === "single line") return './img/l.png';
      else if(storyboard_list[n].mode === "group") return './img/g.png';
      else if(storyboard_list[n].mode === "outlier") return './img/o.png';
    })
    .attr('x','80%')
    .attr('y','0%')
    .attr('height', h)
    .attr('width', h);
};

function loadStoryboardControls(ar,id){
  ar.forEach(function(curr){
    loadStoryboardControlsRow(curr,id);
  })
};

function get_image_scale_value(view){
  // console.log(view);
  var max_scale_from_value  = d3.max([view.style('width'),view.style('height')]);
  var max_scale_to_value    = d3.max([parseFloat($(window).height()/5),parseFloat($(window).width()*(3/12))]);
  return parseFloat(max_scale_to_value/max_scale_from_value);
  // return d3.max([parseFloat($(window).height()/5),parseFloat($(window).width()*(3/12))]);
};
