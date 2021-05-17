let storylines_g,
    storylines_g_margin,
    graph_y,
    storyline_height,
    formattedLineData,
    clicked_line_1,
    storylines,
    end_pts,
    start_pts,
    point_data,
    graph_y_data,
    zoom,
    line_selected = group_selected = false;
/*
  Zoom
 */
// var rescaled_graph_x,
//     rescaled_graph_y;

storylines_g_margin = {top:40,right:0,bottom:25,left:20};

const chart_svg_margin = {bottom:100};

/*
  Classes
 */
class Event{
  constructor(range){
    this.range = range;
  }

  goToFrame(){
    let x = rescaled_graph_x||graph_x,
        y = rescaled_graph_y||graph_y;

    const range = this.range;

    const x_range = parseFloat($("#scale_x_row").slider("value")),
          y_range = parseFloat($("#scale_y_row").slider("value"));

    x.domain([range.x0,range.x1]);
    y.domain([range.y0,range.y1]);

    scale_graph_x_axis(x_range,x);
    scale_graph_y_axis(y_range,y);
  }

  // scaleOut(){
  //   const x_range = parseFloat($("#scale_x_row").slider("value")),
  //         y_range = parseFloat($("#scale_y_row").slider("value"));
  //
  //   x.domain([0,lengthOfStoryline-1]);
  //   y.domain([range.y0,range.y1]);
  //
  //   scale_graph_x_axis(x_range,x);
  //   scale_graph_y_axis(y_range,y);
  // }


};

/**
 * Get the color of a line/entity, based on the
 * value stored in the sidebar minicolors swatch
 */
function event_color(id) {
  return $('#' + id + '_color_toggle').minicolors('value');
}

function create_storyline_graph(data,bubbleset_data,n,d,graph_x,bar_x){
    graph_y_data = d;

    const storyline_window_height = $(window).height();

    storyline_height = storyline_window_height - 130;

    default_chart_styles.spacing_y = parseFloat(storyline_height);

    graph_y       = update_graph_y(storyline_height,graph_y_data);
    const xPoints     = getArrayOfLen(lengthOfStoryline);
    formattedLineData = formatToD3Points(xPoints,data,characters);

    const storyline_svg = d3.select("#storyline_graph_container").append("svg")
                      .attr("id", "storyline_svgID")
                      .attr("width", parseFloat(d3.select("#storyline_graph_container").attr("width"))*2)
                      .attr("height", storyline_window_height);

    const chart_margin = {
      top:20,
      bottom:20,
      left:20,
      right:20
    };

    const chart_svg = storyline_svg.append("svg")
                      .attr("class","chart-svg")
                      .attr("x",storylines_g_margin.left)
                      .attr("y",storylines_g_margin.top + storylines_g_margin.bottom)
                      .attr("width", window.innerWidth - 285 - storylines_g_margin.left - storylines_g_margin.right)
                      .attr("height", storyline_window_height - storylines_g_margin.top - storylines_g_margin.bottom - 65 - chart_svg_margin.bottom);

    storylines = characters.map(function(character) {
      return {
        characters: character,
        values: formattedLineData.map(function(d) {
          let deg;
          if(isNaN(d[character])){
            deg = "DONE";
          }
          else {
            deg = +d[character];
          }
          return {
            timestep: d.x,
            degree: deg
          };
        })
      };
    });
    // So now I have to delete all the degrees that say "DONE".
    storylines.forEach(function(curr){
      if(typeof curr !== "undefined"){
        for (let i = 0; i < curr.values.length; i++) {
          if(curr.values[i].degree == "DONE"){
            curr.values.splice(i,1);
            i = i - 1;
          }
        }
      }
    })

    let zoomable = true;

    let xyzoom = d3.zoom()
    // .extent([[graph_x.range()[0], graph_y.range()[0]], [graph_x.range()[1], graph_y.range()[1]]])
    .scaleExtent([1,2.5])
    // .scaleRatio([0.5, 1])
    // .translateExtent([[graph_x.range()[0], graph_y.range()[0]], [graph_x.range()[1], default_chart_styles.spacing_y]])
    // .translateExtent([graph_x.range()[0],graph_y.range()[1]])
    .on("zoom", zoomable ? zoomedxy : null);
    // let xyzoom = d3.xyzoom()
    // .extent([[graph_x.range()[0], graph_y.range()[0]], [graph_x.range()[1], graph_y.range()[1]]])
    // .scaleExtent([[1, 10], [0, 15]])
    // .scaleRatio([0.5, 1])
    // .translateExtent([[graph_x.range()[0], graph_y.range()[0]], [graph_x.range()[1], graph_y.range()[1]]])
    // .on("zoom", zoomable ? zoomedxy : null);

    let storylines_g_child = chart_svg.append("g").data(storylines).attr('id','storylines_g_child');

    storylines_g_child.append("rect")
                      .attr("height",chart_svg.attr("height"))
                      .attr("width",chart_svg.attr("width"))
                      .style("opacity",0);

    let background = storylines_g_child.call(xyzoom).on("dblclick.zoom", null).on("drag",null);

    let x_transform, y_transform;

    //BUG: the scales are not independantly scaling. On a zoomedx call, it is rescaling both the x and y axes to match the d3.event.transform.k value, not just the x.
    function zoomedxy(){
      if(x_scaling_on) zoomedx();
      if(y_scaling_on) zoomedy();
      translate_ticks();
    };
    function zoomedx(){
      x_transform = d3.event.transform;
      // rescaled_graph_x = x_transform.rescaleX(graph_x);
      // if(y_transform) rescaled_graph_y = y_transform.rescaleY(graph_y);


      x_transform.x = d3.min([x_transform.x, 0]);
      x_transform.y = d3.min([x_transform.y, 0]);
      x_transform.x = d3.max([x_transform.x, (1-x_transform.k) * chart_svg.attr("width")]);
      x_transform.y = d3.max([x_transform.y, (1-x_transform.k) * chart_svg.attr("height")]);

      rescaled_graph_x = x_transform.rescaleX(graph_x);

      const new_val = parseFloat($("#scale_x_row").slider("value"))*parseFloat(x_transform.kx);
      //
      // $("#scale_x_row").slider("value",new_val);

      scale_graph_x_axis(new_val,rescaled_graph_x);
    };
    function zoomedy(){
      y_transform = d3.event.transform;
      // y_transform.kx = 1;
      // rescaled_graph_x = x_transform.rescaleX(graph_x);

      y_transform.x = d3.min([y_transform.x, 0]);
      y_transform.y = d3.min([y_transform.y, 0]);
      y_transform.x = d3.max([y_transform.x, (1-y_transform.k) * chart_svg.attr("width")]);
      y_transform.y = d3.max([y_transform.y, (1-y_transform.k) * chart_svg.attr("height")]);

      rescaled_graph_y = y_transform.rescaleY(graph_y);


      const new_val = parseFloat($("#scale_y_row").slider("value"))*parseFloat(y_transform.k);
      // $("#scale_y_row").slider("value",new_val);

      // scale_graph_x_axis(parseFloat($("#scale_x_row").slider("value")),rescaled_graph_x||graph_x);
      scale_graph_y_axis(new_val,rescaled_graph_y);
    };

    const groups_g = storylines_g_child.append('g').attr("id","groups_g_ID");

    let circle_data = [];

    let min_hash = {},
        max_hash = {};

    formattedLineData.forEach(function(curr_timestep,curr_timestep_index,ar){
      if(curr_timestep_index < lengthOfStoryline - 1){
        characters.forEach(function(curr_char){
          let occured;
          if(typeof curr_timestep[curr_char] != "undefined" && !isNaN(curr_timestep[curr_char])){
            if(typeof occurred == "undefined"){
              occurred = 1;
              circle_data.push(curr_timestep);
            }
            else if(occurred == 1 && (typeof ar[curr_timestep_index + 1][curr_char] == "undefined" || isNaN(ar[curr_timestep_index + 1][curr_char]))) circle_data.push(curr_timestep);
          }
        })
      }
    })
    create_storyline_entities();
};

function create_groups(){
  const group_data  = _bubbleset_data;

  create_groups_chris();

  let points = [];
  group_lst.forEach(function(group_name){
    group_data.forEach(function(curr){
      if(group_name == curr.group){
        for (let j = curr.timestep_start; j <= curr.timestep_stop; j++) {
          /* FIXME: This is a hack, the data in groups.csv goes past the number of timesteps specified in the line.tsv so
          it's crashing the code. */
          if(j > lengthOfStoryline) continue;
          points.push(getPointData(curr.character,j));
        }
      }
    })
    let group = {"color":"#d3d3d3", "points":points, "name":group_name};
    points    = [];
    render(group);
  })

  function getPointData(name,pt){
      pt = parseFloat(pt);
      if(formattedLineData[pt]) return [graph_x(pt) + parseFloat(graph_margin.left), graph_y(formattedLineData[pt][name]) + parseFloat(graph_margin.top)];
  };
};

function arrayOfArrays2Array(arrayOfArrays){
  // Expected array format: arrayOfArrays = [array1,array2,array3,...];
  array = [];
  for (var i = 0; i < arrayOfArrays.length; i++) {
    myDictionary = arrayOfArrays[i];
    for (var key in myDictionary) {
      var value = myDictionary[key];
      // Use `key` and `value`
      //If it's a valid number
      if(isNaN(value) == false){
        array.push(value);
      }
    }
  }
  return array;
};

function getArrayOfLen(n){
  let ret = [];
  for (let i = 0; i < n; i++) {
    ret.push(i);
  }
  return ret;
};

function dict2Array(dictionary){
  array = [];
  for(key in dictionary){
    if(isNaN(dictionary[key]) == false){
      array.push(dictionary[key]);
    }
  }
  return array;
};

function getStorylineCharacters(data){
  let characters = [];
  // This assumes that the data has already been preprocessed.
  for(let i=0; i < data.length; i++){
    if(data[i].key !== "undefined") characters.push(String(data[i].key));
  }
  return characters;
};

function remove(array, index) {
    if (index != -1) {
        array.splice(index, 1);
    }
};

function preproccessStorylinesData(data,len){
  merge_characters(data);
  let character_lst = [], tempArs = [];

  for (let i = 0; i<data.length; i++){
    let tempAr = [];
    for (key in data[i]){
      tempAr.push(data[i][key]);
    }
    character_lst.push(data[i].name);
    tempArs.push(tempAr);
  }

  let dict = []; // create an empty array

  for(let i=0; i<character_lst.length;i++){
    dict.push({
        key:   String(character_lst[i]),
        value: tempArs[i]
    });
  }
  return dict;

  function merge_characters(d){ // Specifically for MOV p1 data, characters do not merge so must do it here.
    remove_whitespace(d);
    var merged_character_lst = [];
    d.forEach(function(character_1_data,i){
      d.forEach(function(character_2_data,j){
        if(String(character_1_data["name"]) == String(character_2_data["name"]) && i!=j){
          merged_character_lst.push(compute_union(character_1_data,character_2_data));
          remove(d,character_1_data);
          remove(d,character_2_data);
        }
      })
    })

    d.concat(merged_character_lst);

    function compute_union(d_1,d_2){
      var ret = {};
      for (var key in d_1) {
        if (d_1.hasOwnProperty(key)) {
          if (d_2.hasOwnProperty(key)) {
            if(typeof(d_1[key]) === "undefined" && typeof(d_2[key]) === "undefined") ret[key] = undefined;
            else if(d_1[key] === "NaN" && d_2[key] === "NaN") ret[key] = "NaN";
            else if(typeof(d_2[key]) !== "undefined" || d_2[key] !== "NaN") ret[key] = d_2[key];
            else ret[key] = d_1[key];
          }
        }

      }
      return ret;
    }
  }

  function remove_whitespace(d){
    d.forEach(function(character,i){
      character["name"] = character["name"].trim();
    })
  }
};

function formatToD3Points(xPts,data,characters){
  let ar = [];
  for(let i = 0; i < xPts.length; i++){
    let obj = {};
    obj['x'] = +xPts[i];

    for (let j = 0; j < characters.length; j++) {
      if(typeof data[j].value[i] !== "undefined"){
        obj[characters[j]] = data[j].value[i];
      }
      else{
        obj[characters[j]] = NaN;
      }
    }
    ar.push(obj);
  }
  return ar;
};

function fade_storylines(id,num){
  if(line_mode_active && !timestep_select_active){
    d3.selectAll(".entity").style("opacity",num);
    d3.selectAll(".point").style("opacity",num);
    d3.selectAll(".group").style("opacity",num);
    d3.selectAll("."+id).style("opacity","1").raise();
  }
};

function create_lines(g,d){
      g = g.append("g");
      const line_render = function(d){
        d3.selectAll('.entity').selectAll('#text_label').transition().attr('opacity','0');
        d3.selectAll('.text_label_background').transition().attr('opacity','0');

      const line = d3.line()
        .curve(d3.curveMonotoneX)
        .x(function(d) {return graph_x(d.timestep);})
        .y(function(d) {return graph_y(d.degree);});

      const lines_path = g
        .datum(d);

      lines_path
        .append("path")
        .attr("class", function(d){return "entity "+d.characters;})
        .attr("d", function(d) {return line(d.values);})
        .style("stroke", function(d) {return loadedColors[d.characters];})
        .style("opacity",default_chart_styles.line_opacity)
        .style("stroke-width", 2)
        .on("mouseover", function(d){
          const id = "#"+d.characters+"_DT_row";
          if(line_mode_active && !line_selected) {
            fade_line(d.characters,0.15);
          }
          $(".dataTables_scrollBody").scrollTo(id);
          d3.select(id).style("background-color","#d3d3d3");
        })
        .on("mouseout", function(d){
          const id = "#"+d.characters+"_DT_row";
          d3.select(id).style("background-color","white");
          if(line_mode_active && !line_selected){
            fade_line(null,0.5);
          }
        })
        .on("click",function(d){
          const id = "#"+d.characters+"_DT_row";
          if(line_mode_active) {
            fade_line(d.characters,0.15);
            add_egoline_analysis(d.characters);
          }
          $(".dataTables_scrollBody").scrollTo(id);
          const color = "#444444";
          d3.select(id).transition().duration(400).style("color","white").style("background-color",lighten(color,20)).transition().duration(400).style("color","black").style("background-color","#fff");
        });

      // const label = d3.select("#storylines_g_child") //TODO: change to text elm on top of div.
      const label = lines_path
        .append("g");
      // label
      //    .append("rect")
      //    .attr("class","line-label-start")
      //    .attr("y", function(d){ return graph_y(d.values[0].degree); })//magic number here
      //    .attr("x", function(d){ return graph_x(d.values[0].timestep); })
         // .attr("height",5)
         // .attr("width",15)
      label
        .append('text')
         .attr("class",function (d){ return "start "+d.characters;})
         .attr("y", function(d){ return graph_y(d.values[0].degree); })//magic number here
         .attr("x", function(d){ return graph_x(d.values[0].timestep); })
         .attr('text-anchor', 'end')
         .attr("fill","#444") //TODO: on hover, change to black
         .style("color", function(d){
           const id = "#"+d.characters+"_DT_row";
           return d3.select(id).style("background-color");
         })
         .style("font-size",".9em")
         .style("alignment-baseline","middle")
         .style("opacity",default_chart_styles.label_opacity)
         .attr("dx",-5)
         .text(function(d) { return d.characters.replace("_", " "); });

        d3.selectAll('line').selectAll('#text_label').raise();
        d3.selectAll('.text_label_background').raise();

      label
        // .append("div")
        //  .attr("class","end")
        //  .attr("y", function(d){ return graph_y(d.values[d.values.length-1].degree); })//magic number here
        //  .attr("x", function(d){ return graph_x(d.values[d.values.length-1].timestep); })
         .append('text')
         .attr("class",function (d){ return "end "+d.characters;})
         .attr('text-anchor', 'start')
         .attr("y", function(d){ return graph_y(d.values[d.values.length-1].degree); })//magic number here
         .attr("x", function(d){ return graph_x(d.values[d.values.length-1].timestep); })
         .style("color", function(d){
           const id = "#"+d.characters+"_DT_row";
           return d3.select(id).style("background-color");
         })
         .style("font-size",".9em")
         .attr("dx",5)
         .style("alignment-baseline","middle")
         .style("opacity",default_chart_styles.label_opacity)
         .text(function(d) { return d.characters.replace("_", " "); });
        d3.selectAll('line').selectAll('#text_label').raise();
        d3.selectAll('.text_label_background').raise();

        // lines_path
        // .on("mouseover", function(d){
        //   const id = "#"+d.characters+"_DT_row";
        //   if(line_mode_active && !line_selected) {
        //     fade_line(d.characters,0.15);
        //   }
        //   $(".dataTables_scrollBody").scrollTo(id);
        //   d3.select(id).style("background-color","#d3d3d3");
        // })
        // .on("mouseout", function(d){
        //   const id = "#"+d.characters+"_DT_row";
        //   d3.select(id).style("background-color","white");
        //   if(line_mode_active && !line_selected){
        //     fade_line(null,0.5);
        //   }
        // })
        // .on("click",function(d){
        //   const id = "#"+d.characters+"_DT_row";
        //   if(line_mode_active) {
        //     fade_line(d.characters,0.15);
        //     add_egoline_analysis(d.characters);
        //   }
        //   $(".dataTables_scrollBody").scrollTo(id);
        //   const color = rgb2hex(d3.select(id).select(".minicolors-swatch-color").style("background-color"));
        //   d3.select(id).transition().duration(400).style("color","white").style("background-color",lighten(color,20)).transition().duration(400).style("color","black").style("background-color","#fff");
        // });

      }

    const _draw_lines = function(d){
      let line_data = [];

      d.values.forEach(function(curr,index){
        if(index>1 && (curr.timestep > +d.values[index-1].timestep + 1 || index == d.values.length - 1)){
          if(index == d.values.length - 1) line_data.push(curr); // this line right here is what determines if the "line jump" is renderered or not
          line_render({
            "characters":d.characters,
            "values":line_data
          });
          line_data = [];
          line_data.push(curr);
        }
        else{
          line_data.push(curr);
        }
      })
    }

  d.forEach(function(character){
    _draw_lines(character);
  })
};

let add_egoline_analysis = function(d){
  if(line_mode_active) {
    line_selected = true;
    fade_storylines(d,0.15);
    clicked_line_1 = d;
    add_timestep_range_selection();
  }
};

/*
 * update_lines - Updates the storyline chart's lines.
 * @x: D3 updated x-scale.
 * @y: D3 updated y-scale.graph
 */
function update_lines(x,y){
  const line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) {return x(d.timestep);})
    .y(function(d) {return y(d.degree);});

    d3.selectAll('.entity')
      .attr("d", function(d) {return line(d.values);})
      // .attr("transform", "translate("+(zoom_x)+"," +(zoom_y)+ ")");
      // .attr("transform", "translate("+(d3.event.translate)+")");

    d3.selectAll('.line').selectAll('#text_label').raise();
    d3.selectAll('.text_label_background').raise();

     d3.selectAll(".start")
     .attr("y", function(d){
       const y = rescaled_graph_y||graph_y;
       return y(d.values[0].degree);
     })//magic number here
     .attr("x", function(d){
       const x = rescaled_graph_x||graph_x;
       return x(d.values[0].timestep);
     })

     d3.selectAll(".end")
      .attr("y", function(d){
        const y = rescaled_graph_y||graph_y;
        return y(d.values[d.values.length-1].degree);
      })//magic number here
      .attr("x", function(d){
        const x = rescaled_graph_x||graph_x;
        return x(d.values[d.values.length-1].timestep);
      })
      d3.selectAll('line').selectAll('#text_label').raise();
      d3.selectAll('.text_label_background').raise();

    // const g = d3.select(".line-text");
    // g.selectAll(".end")
    //   // .attr("y", graph_y(dim_start.degree))//magic number here
    //   .attr("x", function(d){
    //     const x = rescaled_graph_x||graph_x,
    //           dim = d.values[d.values.length-1];
    //     console.log(dim);
    //     return x(dim.timestep);
    //   })
      // .attr("y", function(d){
      //   const y = rescaled_graph_y||graph_y,
      //         dim = d.values[d.values.length-1];
      //   console.log(dim.degree);
      //   return y(dim.degree);
      // });

    // g.selectAll(".start")
    //   // .attr("y", graph_y(dim_start.degree))//magic number here
    //   .attr("x", function(d){
    //     const x = rescaled_graph_x||graph_x,
    //           dim = d.values[0];
    //     console.log(dim);
    //     return x(dim.timestep);
    //   })
      // .attr("y", function(d){
      //   const y = rescaled_graph_y||graph_y,
      //         dim = d.values[d.values.length-1];
      //   console.log(dim.degree);
      //   return y(dim.degree);
      // });

    // d.forEach(function(curr){
    //   const id = "#"+curr.characters+"_DT_row",
    //         dim_start = curr.values[0]
    //         dim_end = curr.values[curr.values.length-1];
    //
    //   g.append("text")
    //    .attr("y", graph_y(dim_start.degree))//magic number here
    //    .attr("x", function(){ return graph_x(dim_start.timestep)})
    //    .attr('text-anchor', 'end')
    //    .style("color",d3.select(id).style("background-color"))
    //    .style("font-size",".5em")
    //    .text(curr.characters);
    //
    //  g.append("text")
    //   .attr("y", graph_y(dim_end.degree))//magic number here
    //   .attr("x", function(){ return graph_x(dim_end.timestep)})
    //   .attr('text-anchor', 'start')
    //   .style("color",d3.select(id).style("background-color"))
    //   .style("font-size",".5em")
    //   .text(curr.characters);
    // });
};

/*
 * update_text_labels - Updates the storyline's text labels.
 * @x: D3 updated x-scale.
 * @y: D3 updated y-scale.
 */
function update_text_labels(x,y){
  var val     = parseFloat($("#line_thickness_slider").val());
  var padding = {right: 20, left: 20}; // in px

  var background = d3.selectAll(".text_label_background")
    .transition()
    .attr("x",function(d){
      if(d.type === "start") return x(d.x) + Math.ceil(val/2);
      else if(d.type === "end") return x(d.x) - Math.ceil(val/2);
    })
    .attr("y", function(d){return y(formattedLineData[d.x][d.character]) - (val/2);})
    .attr("width", function(d){
      return parseFloat(get_width_of_text_in_px(d.character)) + padding.right + padding.left; // this function call can slow things down a lot.
    })
    .attr("height", val)
    .attr("transform", "translate(0," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")")

  background
    .selectAll('rect')
    .attr("transform", "translate(0," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")");

  background
    .selectAll('text')
    .attr("font-size", val)
    .attr("transform", "translate(0," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")");
  // d3.select(".text_label")
  //   .attr("transform", "translate(0," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")");
};

function create_text_labels(parent_g){
  var padding = {right: 20, left: 20}; // in px
  d3.selectAll('line').selectAll('#text_label').remove();
  d3.selectAll('.text_label_background').remove();
  var d             = get_text_label_data(padding);
  var text_label_g  = parent_g.append("g").attr('id','text_label');

  var text_background = text_label_g.selectAll("rect").data(d).enter().append('svg')
                                    .attr('class','text_label_background')
                                    .attr("x",function(d){
                                      if(d.type == "start") return graph_x(d.x) + Math.ceil(default_chart_styles.line_thickness/2);
                                      else if(d.type == "end") return graph_x(d.x) - Math.ceil(default_chart_styles.line_thickness/2);
                                    })
                                    .attr("y", function(d){return graph_y(formattedLineData[d.x][d.character]) - (default_chart_styles.line_thickness/2);})
                                    .attr("width", function(d){
                                      return parseFloat(get_width_of_text_in_px(d.character)) + padding.right + padding.left; // this function call can slow things down a lot.
                                    })
                                    .attr("height", default_chart_styles.line_thickness);
  text_background
    .append("rect")
    .style('width','100%')
    .style('height','100%')
    .attr("fill","white");

  text_background
    .append('text')
    .attr("x","50%")
    .attr("y","60%")
    .attr("alignment-baseline","middle")
    .attr("text-anchor","middle")
    .attr("class",function(d){ return "text_label_"+d.character; })
    .attr("font-size",default_chart_styles.line_thickness)
    .attr("font-family",default_chart_styles.font_family)
    //.attr("fill", function(d){return event_color(d.character);})
    .text( function(d){ return d.character;});

    update_endpoint_text_labels();
};

function get_text_label_data(padding){
  let ret     = [];
  ret         = ret.concat(get_start_inline_pt(formattedLineData,characters,start_pts,padding));
  // ret         = ret.concat(get_middle_inline_pt(formattedLineData,characters,start_pts,padding));
  ret         = ret.concat(get_end_inline_pt(formattedLineData,characters,end_pts,padding));
  return ret;
};

function get_start_inline_pt(data,chars,pts,padding){
  var ret = [];
  var len_characters  = get_widths_of_text_labels_in_timesteps(chars,padding);
  var start_pt_radius = Math.ceil(graph_x.invert(default_chart_styles.height_of_chart/2));
  var recursive_characters = [];

  chars.forEach(function(curr_char){
    var obj = {};
    var len_curr_char = parseInt(len_characters[curr_char]);
    var start_pt = pts[curr_char];
    for (var i = start_pt + start_pt_radius; i <= start_pt+len_curr_char; i++) {
      if(i+3 >= data.length) break;
      if(data[i][curr_char] !== "undefined"){
        if(data[i][curr_char] != data[i+1][curr_char] && data[i][curr_char] != data[i+2][curr_char] && data[i][curr_char] != data[i+3][curr_char]) break; // because start point radius is 2.
      }
    }
    if(!(Math.abs(i - start_pt) < len_curr_char) && i < end_pts[curr_char] ){
      // console.log(Math.abs(i - start_pt),i - start_pt,i,end_pts[curr_char],curr_char);
      obj['character'] = curr_char;
      obj['x']         = start_pt + start_pt_radius;
      obj['type']      = 'start';

      ret.push(obj);
    }
    else if(i < end_pts[curr_char]){
      recursive_characters.push(curr_char);
      pts[curr_char] = pts[curr_char] + 3;
    }
  })

  if(recursive_characters.length > 0) ret = ret.concat(get_start_inline_pt(data,recursive_characters,pts,padding));

  return ret;
};

function get_middle_inline_pt(data,chars,pts,padding){
  var ret = [];
  var len_characters  = get_widths_of_text_labels_in_timesteps(chars,padding);
  var start_pt_radius = Math.ceil(graph_x.invert(default_chart_styles.height_of_chart/2));
  var recursive_characters = [];

  chars.forEach(function(curr_char){
    var obj = {};
    var len_curr_char = parseInt(len_characters[curr_char]);
    var start_pt = pts[curr_char];
    for (var i = start_pt + start_pt_radius; i <= start_pt+len_curr_char; i++) {

      if(data[i][curr_char] !== "undefined"){
        if(data[i][curr_char] != data[i+1][curr_char] && data[i][curr_char] != data[i+2][curr_char] && data[i][curr_char] != data[i+3][curr_char]) break; // because start point radius is 2.
      }
    }
    if(!(Math.abs(i - start_pt) < len_curr_char) && i < end_pts[curr_char] ){
      // console.log(Math.abs(i - start_pt),i - start_pt,i,end_pts[curr_char],curr_char);
      obj['character'] = curr_char;
      obj['x'] = start_pt + start_pt_radius;
      obj['type'] = 'start';
      ret.push(obj);
    }
    else if(i < end_pts[curr_char]){
      recursive_characters.push(curr_char);
      pts[curr_char] = pts[curr_char] + 3;
    }
  })

  if(recursive_characters.length > 0) ret = ret.concat(get_middle_inline_pt(data,recursive_characters,pts,padding));

  return ret;
};

function get_end_inline_pt(data,chars,pts,padding){
  var ret = [];
  var len_characters = get_widths_of_text_labels_in_timesteps(chars,padding);
  var end_pt_radius = Math.ceil(graph_x.invert(default_chart_styles.height_of_chart/2));
  var recursive_characters = [];

  chars.forEach(function(curr_char){
    var obj = {};
    var len_curr_char = parseInt(len_characters[curr_char]);
    var end_pt = pts[curr_char];
    for (var i = end_pt - end_pt_radius; i >= end_pt - len_curr_char; i--) {
      // if(data[i][curr_char] !== "undefined"){
      if(i > 3){
        if(data[i][curr_char] != data[i-1][curr_char] && data[i][curr_char] != data[i-2][curr_char] && data[i][curr_char] != data[i-3][curr_char]) break; // because start point radius is 2.
      }
      // }
      // if(data[i][curr_char] !== data[i-2][curr_char]) break;
    }
    if(!(Math.abs(i - end_pt - end_pt_radius) < len_curr_char) && ((end_pt-len_curr_char) - end_pt_radius) > 0){
      obj['character'] = curr_char;
      obj['x'] = (end_pt-len_curr_char) - end_pt_radius;
      obj['type'] = 'end';
      ret.push(obj);
    }
    else if(((end_pt-len_curr_char) - end_pt_radius) > 0) {
      recursive_characters.push(curr_char);
      pts[curr_char] = pts[curr_char] - 3;
      // console.log(curr_char);
    }
  })

  if(recursive_characters.length > 0) ret = ret.concat(get_end_inline_pt(data,recursive_characters,pts,padding));
  return ret;
};

function get_widths_of_text_labels_in_timesteps(ar,padding){
  var ret = {};
  ar.forEach(function(character){
    ret[character] = Math.ceil(graph_x.invert(get_width_of_text_in_timesteps(character) + padding.right + padding.left));
  })
  return ret;
};

function get_width_of_text_in_timesteps(character){ // in timesteps
  var font_size = default_chart_styles.line_thickness;
  return parseFloat(get_width_of_text_in_px(character, font_size + default_chart_styles.font_family));
};

function get_width_of_text_in_px(txt, font) { // in px
  this.element = document.createElement('canvas');
  this.element.setAttribute('id','temp_text_label');
  this.context = this.element.getContext("2d");
  this.context.font = font;
  // var tsize = {'width':this.context.measureText(txt).width, 'height':parseInt(this.context.font)};
  var w = this.context.measureText(txt).width;
  d3.selectAll('#temp_text_label').remove();
  return w;
};

function update_endpoint_text_labels(){
  const _g = d3.select("#storylines_g_child");

  // Create an Endpoint text label for each line_toggle
  characters.forEach(function(curr){
    _g.append("text")
    .attr('class','Endpoint text_label_'+curr)
    .attr('x', function(){
      try {
        return d3.select('.' + curr + '_' + end_pts[curr] + '_pointID').attr('cx');
      } catch (e) {
        return null;
      }
    })
    .attr('y', function(){
      try {
        return d3.select('.' + curr + '_' + end_pts[curr] + '_pointID').attr('cy');
      } catch (e) {
        return null;
      }
    })
    // .attr("transform", "translate(" + (width+3) + "," + y(data[0].open) + ")")
    .attr("dy", ".35em")
    .attr("dx", "25px")
    .attr("text-anchor", "start")
    .attr('font-size',default_chart_styles.line_thickness)
    //.style("fill", event_color(curr))
    .style("opacity",0)
    .text(curr);
  })
};

function get_endpoint_timesteps(data){
  var ret = {};
  characters.forEach(function(curr,i,ar){
    ret[curr] = "undefined";
  })

  data.reverse().forEach(function(data_curr,data_i,data_ar){
    characters.forEach(function(char){
      if(!isNaN(data_curr[char]) && data_curr[char] !== "undefined" && data_curr[char] !== "NaN" && isNaN(ret[char])){
        ret[char] = data_curr.x;
      }
    })
  })
  return ret;
};

function get_startpoint_timesteps(data){
  var ret = {};
  characters.forEach(function(curr,i,ar){
    ret[curr] = "undefined";
  })

  data.forEach(function(data_curr,data_i,data_ar){
    characters.forEach(function(char){
      if(!isNaN(data_curr[char]) && data_curr[char] !== "undefined" && data_curr[char] !== "NaN" && isNaN(ret[char])){
        ret[char] = data_curr.x;
      }
    })
  })
  return ret;
};

function get_point_data(d){
  data      = d.slice(0);
  start_pts = get_startpoint_timesteps(data);
  end_pts   = get_endpoint_timesteps(data);

  let ar = [], ret = [];

  for (var key in start_pts) {
    if (start_pts.hasOwnProperty(key)) {
      if(!(ar.indexOf(start_pts[key]) > -1)) ar.push(start_pts[key]);
    }
  }
  for (var key in end_pts) {
    if (end_pts.hasOwnProperty(key)) {
      if(!(ar.indexOf(end_pts[key]) > -1)) ar.push(end_pts[key]);
    }
  }

  let filtered_data = data.filter(function(timestep){
    return (ar.indexOf(timestep.x) > -1);
  })

  filtered_data.forEach(function(curr){
    let temp = {};
    for (var key in curr) {
      for (var st_key in start_pts) {
        if(curr.x === start_pts[st_key]){
          temp.x       = curr.x;
          temp[st_key] = curr[st_key];
        }
      }
      for (var end_key in end_pts) {
        if(curr.x === end_pts[end_key]){
          temp.x        = curr.x;
          temp[end_key] = curr[end_key];
        }
      }
    }
    ret.push(temp);
  })
  let t = [];
  ret.forEach(function(curr){
    for (var key in curr) {
      if(key !== 'x'){
        let temp      = {};
        temp.x        = curr.x;
        temp[key]     = curr[key];
        temp.y        = curr[key];
        temp['name']  = key;
        t.push(temp);
      }
    }
  })

  return t.filter(function(elm){
    return Object.keys(elm).length > 2;
  })
};

/*
 * create_points - Creates the endpoints for a storyline, for every storyline.
 * @g: The group that the points render on top of.
 * @d: The coordinates for the data in (x,y) format.
 */
// function create_points(g,d){
//   g
//     .append("g").attr("class","end-points")
//     .selectAll(".point")
//     .exit()
//     .data(d)
//     .enter().append("circle")
//       .attr("r", parseFloat($("#line_thickness_slider").val()))
//       .attr("fill", function(d){ return event_color(d.name); })
//       // .attr("fill", function(d){ return "#d3d3d3"; })
//       .attr("opacity", "1")
//       .attr("cx", function(d) { return graph_x(d.x);})
//       .attr("cy", function(d) { return graph_y(d.y);})
//       .attr("class", function(d) { return d.name + '_' + d.x + '_pointID' + " point"})
//       .attr("transform", "translate(0," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")");
// };


/*
 * update_points - Updates the endpoints of every storyline.
 * @x: D3 updated x-scale.
 * @y: D3 updated y-scale.
 */
// function update_points(x,y){
//     d3.selectAll(".point")
//       .transition()
//       .attr("cx", function(d) { return x(d.x);})
//       .attr("cy", function(d) { return y(d.y);})
//       .attr("transform", "translate(0," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")");
// };

/*
 * update_graph_y - Sets the storyline's y range scale
 * @h: height of the y-scale.
 * RETURNS the y-scale
 */
function update_graph_y(h,d){
  console.log("The y-axis is "+(Math.abs(d3.max(d)) + Math.abs(d3.min(d)))+" units high -- value to calculate this is in storyline.js line 772 update_graph_y()");
  let y = d3.scaleLinear()
    .domain([d3.min(d)-2, d3.max(d)+2])
    .range([h-100, 0]);

  return y;
};

/*
 * create_storyline_entities - Creates all entities for a storyline chart: axes, storylines, end points,text labels, and bubbles.
 */
function create_storyline_entities(){
  const g = d3.select("#storylines_g_child");

  const x_axis = d3.axisBottom(graph_x).ticks($("#axis_number_of_ticks_slider").slider("value")).tickValues(graph_x.ticks($("#axis_number_of_ticks_slider").slider("value")).concat(graph_x.domain()));

  point_data = get_point_data(formattedLineData);
  create_axes(d3.select("#storyline_svgID"),storyline_height,x_axis,storylines_g_margin);
  create_lines(g,storylines);
  create_groups();
  translate_ticks();
};

/*
 * create_axes - Creates the grid-like axis in the back of the storyline chart.
 * @g: Parent group of the axis.
 * @h: Height of the axis.
 * @xAxis: Axis of the storyline.
 * @margin: Margin for storyline.
 *
 * Only one x axis is used, no y-axis declared. The "Grid" is made by stacking 2 x-axes on top of each other
 * and setting the tick size to h.
 *
 * The axes are lowered because we always want the "Grid" in the background.
 */
function create_axes(g,h,xAxis,margin){
  let bottom_grid_lines = g.append("g")
    .attr("class", "axis--x")
    .attr("id","bottom_x_axis")
    .attr("transform", "translate("+(margin.left)+"," + (h + margin.bottom + margin.top - 100) + ")")
    .call(xAxis.tickSize(-(h-100)).ticks(default_chart_styles.num_ticks));

  let top_grid_lines = g.append("g")
                        .attr("class", "axis--x")
                        .attr("id","top_x_axis")
                        .attr("transform", "translate("+(margin.left)+"," + (margin.bottom + margin.top) + ")")
                        .call(xAxis.tickSize(0).ticks(default_chart_styles.num_ticks));

  d3.selectAll('#top_x_axis').selectAll('.tick').selectAll('text').attr('transform','translate(10,' + (-40) +') rotate(-45)');
  d3.selectAll('#bottom_x_axis').selectAll('.tick').selectAll('text').attr('transform','translate(10,'+ (40) +') rotate(-45)');

  bottom_grid_lines.lower();
  top_grid_lines.lower();

  /*
  Creates the border around the timestep signatures
   */
  const chart = d3.select(".chart-svg");

  g.append("rect")//TODO:change this rect to a div that holds Timestep signatures.
    .attr("class","timestep-signature-container")
    .attr("x",chart.attr("x"))
    // .attr("y",+chart.attr("y") + +chart.attr("height"))
    .attr("y",+chart.attr("y") + +chart.attr("height") + 90)
    .attr("width",+chart.attr("width"))
    .attr("height",40)
    .attr("fill","white")
    .style("stroke-width","2px")
    .style("stroke","#d3d3d3");
};

/*
 * update_groups - update the groups on x or y scaling.
 * @x: UNUSED D3's x-scale
 * @y: UNUSED D3's y-scale
 *
 * This function deletes and reruns the whole data parsing and rendering. This is because the
 * algorithm for styling the groups takes out groups and creates gaps between groups if a part of the groups
 * is too skinny in either height or width-determined by thresholds. But as you scale, this changes, thus, the data must process again
 * in order to determine what is visually displeasing to the eye based on these thresholds.
 */
function update_groups(x,y){
  d3.selectAll(".group").remove();
  create_groups();
  // This code is tested and works to update. It's here if needed.
  // var area =  d3.area()
  //               .curve(d3.curveBasisOpen)
  //               .x(function(d) { return x(d.x); })
  //               .y0(function(d) { return y(d.y); })
  //               .y1(function(d) { return y(d.height); });
  //
  // d3.selectAll(".group")
  //   .transition()
  //   .attr("d", area);
};

function translate_ticks(){
  //translate ticks to dates
  d3.selectAll(".tick").each(function(tick){
    d3.select(this).select("text").text(tick_vals_2_dates(tick));
  });
};

function tick_vals_2_dates(val){
  if($("#dataset_dropdown").val()!="nba"){
    return val;
  }

  const min = "2/18/2010",
        max = "8/1/2018";

  var parseDate = d3.timeParse("%m/%d/%Y");
  let scale = d3.scaleTime().domain([0,104]).range([parseDate(min),parseDate(max)]);
  const date =  scale(val).toISOString().substring(0, 7);
  if(date.substring(5,7) == "01") return "Jan"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "02") return "Feb"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "03") return "Mar"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "04") return "Apr"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "05") return "May"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "06") return "Jun"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "07") return "Jul"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "08") return "Aug"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "09") return "Sep"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "10") return "Oct"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "11") return "Nov"+"-"+date.substring(2,4);
  if(date.substring(5,7) == "12") return "Dec"+"-"+date.substring(2,4);
  // return date.substring(6,7) + "/" + date.substring(2,4);
}
// function rename(d){
//   d.forEach(function(curr){
//     curr.character = curr.character;
//   })
//   return d;
// };

function highlight_characters(lst,num){
  d3.select("#storylines_g_child").selectAll(".entity").style("opacity",num);
  d3.select("#storylines_g_child").selectAll(".point").style("opacity",num);
  // d3.select("#storylines_g_child").selectAll(".group").style("opacity",num);
  d3.select("#storylines_g_child").selectAll("text").style("opacity",num);
  lst.forEach(function(l){
    d3.select("#storylines_g_child").selectAll("."+l).style("opacity",1);
  });
}
