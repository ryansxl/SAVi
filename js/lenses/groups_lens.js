let stack_graph_height,
    stack_graph_area,
    stack_graph_svg,
    stack_graph_g,
    data,
    group_data,
    stacked_graph_x,
    stack_color;

class Group {
  constructor() {

    this.area_height;

  }

  setToGlobal(global_scale){
    this.global_scale = global_scale;

    const area_y = d3.scaleLinear().domain(global_scale.area).range([this.area_height, 0]),
          _this = this;

    const area = d3.area()
      .curve(d3.curveCatmullRom)
      .x(function(d,i) {return _this.local.area.x(i+_this.range.start);})
      .y0(function(d) {return area_y(d[0]);})
      .y1(function(d) {return area_y(d[1]);});

    this.area
        .transition()
        .attr("d", area);

    this.area_axis
        .transition()
        .call(d3.axisLeft(area_y).ticks(3));

    const bar_y = d3.scaleLinear().domain([global_scale.bar.min-1,global_scale.bar.max]).range([this.bar_height, -this.bar_height/2]);

    this.bar_g
        .transition()
        .attr("transform", "translate(0," + ((this.bar_height/2)+10) + ")");

    this.bars
        .transition()
        .attr("y", function(d,i) {
          if(d[1] != d[0]){
            if(d[0] < d[1]){ // leaving-negative
              return bar_y(d[0]+1);
            }
            else if(d[0] > d[1]){
              return bar_y(d[0]);
            }
          }
        })
        .attr("height", function(d) {
            return Math.abs(bar_y(d[1]) - bar_y(d[0]));
        });

    this.bar_axis.x
        .transition()
        .attr("transform", "translate(0," + (bar_y(0)+((this.bar_height/2)+10)) + ")");

    this.bar_axis.y
        .transition()
        .attr("transform", "translate(0," + ((this.bar_height/2)+10) + ")")
        .call(d3.axisLeft(bar_y).ticks(3));
  }

  setToLocal(){
    const area_y = d3.scaleLinear().domain([this.area_scale.min,this.area_scale.max]).range([this.area_height, 0]),
          _this = this;

    const area = d3.area()
      .curve(d3.curveCatmullRom)
      .x(function(d,i) {return _this.local.area.x(i+_this.range.start);})
      .y0(function(d) {return area_y(d[0]);})
      .y1(function(d) {return area_y(d[1]);});

    this.area
        .transition()
        .attr("d", area);

    this.area_axis
        .transition()
        .call(d3.axisLeft(area_y).ticks(3));

    const bar_y = d3.scaleLinear().domain([this.bar_scale.min-1,this.bar_scale.max]).range([this.bar_height, -this.bar_height/2]);

    this.bar_g
        .transition()
        .attr("transform", "translate(0," + ((this.bar_height/2)+10) + ")");

    this.bars
        .transition()
        .attr("y", function(d,i) {
          if(d[1] != d[0]){
            if(d[0] < d[1]){ // leaving-negative
              return bar_y(d[0]+1);
            }
            else if(d[0] > d[1]){
              return bar_y(d[0]);
            }
          }
        })
        .attr("height", function(d) {
            return Math.abs(bar_y(d[1]) - bar_y(d[0]));
        });

    this.bar_axis.x
        .transition()
        .attr("transform", "translate(0," + (bar_y(0)+((this.bar_height/2)+10)) + ")");

    this.bar_axis.y
        .transition()
        .attr("transform", "translate(0," + ((this.bar_height/2)+10) + ")")
        .call(d3.axisLeft(bar_y).ticks(3));

  }

  getAreaScale(){
    return this.area_scale;
  }

  getBarScale(){
    return this.bar_scale;
  }

  show_group_analysis(svg,group_name,h,w,d0,d1,n){
    this.range = {start:d0,stop:d1};
    this.lense_number = n;

    svg.select(".stack-graph-svg").remove();

    let id = svg.attr("id"),
        container = svg
          .append('svg')
          .attr("class","stack-graph-svg")
          .attr("id",id)
          .attr("height",h*2)
          .attr("width",w);

    let filtered_entities = [];
    if(lense_lst[n-1]){
      filtered_entities = lense_lst[n-1].getFilterEntities();
    }
    else{
      filtered_entities = [];
    }

    const d = convert_bubble_set_data_to_stack_graph_data(_bubbleset_data,filtered_entities);

    let keys  = Object.keys(d[0]);

    const group      = {d:d,name:group_name,keys:keys,range:{start:d0,stop:d1}},
          filtered_d = this.filter_SG_d(group);

    d3.select("#analysis_view_div_"+n).add_range_annotations_mouseover(n);

    this.create_new_stack_graph(group_name,_bubbleset_data,filtered_d,d,w,container,{start:d0,stop:d1});
    this.create_bar_graph(container,_bubbleset_data,group_name,d,this.area_height,w,d0,d1);
  };

  create_new_stack_graph(group_name,group_data,new_data,data,new_width,svg,range){
    const new_height = this.area_height = 130;

    var area_scale = {min:0,max:this.get_max_of_stacked_graph_data(new_data)};

    let x = d3.scaleLinear().domain([range.start,range.stop]).range([3,new_width-20]),
        y = d3.scaleLinear().domain([area_scale.min,area_scale.max]).range([new_height, 15]);

    this.local = {
      area:{
        x:x,
        y:y
      },
      bar:{
        x:null,
        y:null
      }
    };

//     if($('input[name=Global-Normalization]').prop('checked') && this.global_scale && this.global_scale.area){
//       y.domain(this.global_scale.area);
//     }

    let stack = d3.stack().keys(Object.keys(new_data[0]))
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone);

    let area = d3.area()
      .curve(d3.curveCatmullRom)
      .x(function(d,i) {return x(i+range.start);})
      .y0(function(d) {return y(d[0]);})
      .y1(function(d) {return y(d[1]);});

    this.area_data = stack(new_data);
    const _lense_label =  d3.select("#lense_label_"+String(svg.attr("id").replace("analysis_view_","")));
    svg = svg.append("g").attr("transform","translate(15,10)");

    // stack_graph_layer
    this.area = svg
      .data(stack(new_data))
      .append("path")
      .attr("class", "stack_graph selectable")
      .attr("transform", "translate(0,10)")
      .attr("id", function(d) { return group_name; })
      .style("fill", function(d) { return groupcolors[d.key]; })
      .style("opacity",function() { return 0.7; })
      .on("mouseover",function(d){
        on_mouseover_group(group_name);
        d3.select("#lense_label_"+svg._parents[0].id.replace("analysis_view_g","")).text(group_name);
      })
      .on("mouseout", function(){
        on_mouseout_group();
        fade_storyline_entities(0);
        $(".selection").text(lense.placeholder_text);
      })
      .attr("d", area);

    svg.append("g")
        .attr("class", "x_axis")
        .attr("id", "stack_graph_x_axis_ID")
        .attr("transform", "translate(0," + (new_height+10) + ")")
        .call(d3.axisBottom(x).ticks(0).tickFormat(""));

    var area_axis = svg.append("g")
        .attr("id", "stack_graph_y_axis_ID")
        .attr("class", "y_axis")
        .attr("transform", "translate(3,10)")
        .call(d3.axisLeft(y).ticks(4));

    svg.append("text")
      .attr("transform", "translate(0,10)")
      .attr("y",-20)
      .attr("x","47%")
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("font-size","1em")
      .style("color","#d3d3d3")
      .text("Group Size");

      let focus = svg.append("g")
           .attr("class", "focus area")
           .style("display", "none");

        focus.append("line")          // attach a line
          .style("stroke", "#d3d3d3")  // colour the line
          .attr("x1", 0)     // x position of the first end of the line
          .attr("y1", new_height+4)      // y position of the first end of the line
          .attr("x2", 0)     // x position of the second end of the line
          .attr("y2", 0)
          .attr("transform", "translate(-40," + 10 + ")")
          .on("mouseover", function() { focus.style("display", null); });

       const timestep_text = focus.append("text")
            .attr("class","timestep")
            .attr("x",0)
            .attr("y",new_height + 17)
            .attr("dx", "-.5em")
            .attr("transform", "translate(-40," + 10 + ")")
            .style("font-size","10px")
            .style("fill","#d3d3d3");


       const overlay = svg.append("rect")
           .attr("class", "overlay")
           .attr("y",10)
           .attr("width", new_width + 5)
           .attr("height", new_height+55)
           // .attr("transform", "translate(0," + (0) + ")")
           .attr("opacity",0)
           .on("mouseover", function() {
              focus.style("display", null); 
              })
           .on("mouseout", function() {
             let x0 = x.invert(d3.mouse(this)[0]),
                  j = Math.round(x0);
             hide_timesteps(j);
             d3.select(".timestep-single").remove();
             focus.style("display", "none");
//              d3.select("#lense_label_"+svg._parents[0].id.replace("analysis_view_g","")).text("");
             _lense_label.text("");
             d3.selectAll("." +group_name).style("opacity",0.7).style("stroke","black").style("stroke-width","0px");
           })
           .on("mousemove", mousemove);

       function mousemove() {
         // focus.style("display", null);
         d3.selectAll(".group").style("opacity","0.15");
         d3.selectAll("." +group_name).style("opacity",0.7).style("stroke","black").style("stroke-width","2px");

         let x0 = x.invert(d3.mouse(this)[0]), j = Math.round(x0);
         focus.attr("transform", "translate(" + ( x(j) ) + ",0)");
         timestep_text.text(j);
         timestep_main_chart(j);
         _lense_label.text("Time:"+ j+ " -> "+group_name+" : "+new_data[j-range.start][group_name]);
//          d3.select("#lense_label_"+svg._parents[0].id.replace("analysis_view_g","")).text(""+group_name+" : "+new_data[j-range.start][group_name]);
       }
  };

  // ****************************************** //
  // ************* STACK BAR CHART ************ //
  // ****************************************** //

  create_bar_graph(svg,group_data,group_name,new_data,h,w,d0,d1){
//     if(d1-d0 <= 1){
//       alert("please select more timesteps");
//     }

    h /= 2;

    const padding = {top:(h/2)};
    const lens_num = svg.attr("id").replace("analysis_view_","");
    const _lense_label =  d3.select("#lense_label_"+String(svg.attr("id").replace("analysis_view_","")));

    const d = this.get_stack_bar_d(group_data,{start:d0,stop:d1},group_name);
    const data = d[0],
          characters = d[1];

    // let g = svg.append("svg")
    //   .attr("x",20)
    //   .attr("y",(200)-50)
    //   .attr("width",w)
    //   .attr("height",h*4)
    //   .append("g");

    let g = svg.append("g").attr("transform","translate(15,170)");

    const bar = g.selectAll(".bar").data(new_data), stack = d3.stack().keys(characters).offset(d3.stackOffsetDiverging);
    let x = d3.scaleLinear().domain([d0,d1]).range([3,w-20]),
        y = d3.scaleLinear().domain([this.getMaxMin(data,group_name,stack)[0],this.getMaxMin(data,group_name,stack)[1]]).range([h*1.5,0]);

    this.bar_height = h,
    this.local.bar.x = x,
    this.local.bar.y = y,
    this.bar_scale = {min:parseFloat(this.getMaxMin(data,group_name,stack)[0]),max:this.getMaxMin(data,group_name,stack)[1]};

//     if($('input[name=Global-Normalization]').prop('checked') && this.global_scale && this.global_scale_bar){
//       y.domain(this.global_scale.bar);
//     }

    this.bar_g = g.append("g")
      .attr("transform", "translate(0," + padding.top + ")");

    let bar_g = this.bar_g
      .selectAll("g")
      .data(stack(data[group_name]))
      .enter().append("g")
        .attr("class",function(d){return d.key;})
        .attr("fill", function(d) { return groupcolors[d.key]; })
        .on("mouseover",function(d,i){
          _lense_label.text(d.key);
          //on_mouseover_entity(d.key);
         d3.selectAll("."+d.key).selectAll("rect").style("stroke","gold").style("stroke-width","2px");
         d3.selectAll(".group").style("opacity","0.15");
         d3.selectAll("." +group_name).style("opacity",0.7).style("stroke","black").style("stroke-width","0px");
         d3.select("#storylines_g_child").selectAll("."+d.key).style("opacity",1);
        })
        .on("mouseout", function(d){
          _lense_label.text(lense.placeholder_text);
          on_mouseout_entity();
          fade_storyline_entities(0);
          d3.selectAll("."+d.key).selectAll("rect").style("stroke-width","0px");
        });

    this.bars = bar_g
      .selectAll("rect")
      .data(function(d){
        return d;})
      .enter().append("rect")
        .attr("rx", 3)
        .attr("ry", 3)
        .attr("x", function(d,i) {
          return x(i+d0);
        })
        .attr("y", function(d,i) {
          if(d[1] != d[0]){
            if(d[0] < d[1]){ // leaving-negative
              return y(d[0]+1);
            }
            else if(d[0] > d[1]){
              return y(d[0]);
            }
          }
        })
        .attr("height", function(d) {
            return Math.abs(y(d[1]) - y(d[0]));
        })
        .attr("width", function(){
          const min_width = 5;
          if((w/d1-d0) > min_width && Math.abs(w/d1-d0) > 0) return (w/d1-d0);
          return min_width;
        })
        .on("mouseover",function(d,i){
          // console.log(d);
          mouseover_rect(i);
          d3.select(this).display_entities_list(d);
        })
        .on("mouseout",function(d){
          d3.selectAll(".mouseover-widget").remove();
        });

      this.bar_axis = {
        x:null,
        y:null
      };

      this.bar_axis.x = g.append("g")
          .attr("class", "stack_bar_graph_axis")
          .attr("transform", "translate(0," + (y(0)+padding.top) + ")")
          .call(d3.axisBottom(x).ticks(0).tickFormat(""));

      this.bar_axis.y = g.append("g")
          .attr("class", "stack_bar_graph_axis")
          .attr("transform", "translate(3," + padding.top + ")")
          .call(d3.axisLeft(y).ticks(3));

      const entering_label = g.append("text")
        .attr("y", 10)
        .attr("x","47%")
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size","1em")
        .style("color","#d3d3d3")
        .text("Entering & Leaving");

//       const leaving_label = g.append("text")
//         .attr("y", h*1.7)
//         .attr("x","47%")
//         .style("text-anchor", "middle")
//         .style("font-size","1em")
//         .style("color","#d3d3d3")
//         .text("Leaving");

      let focus = g.append("g")
           .attr("transform", "translate(0," + padding.top + ")")
           .attr("class", "focus bar")
           .style("display", "none");

        focus.append("line")          // attach a line
          .style("stroke", "#d3d3d3")  // colour the line
          .attr("x1", 0)     // x position of the first end of the line
          .attr("y1", h*1.5)      // y position of the first end of the line
          .attr("x2", 0)     // x position of the second end of the line
          .attr("y2", -17)
          .attr("transform", "translate(0," +  padding.top + ")")
          .on("mouseover", function() { focus.style("display", null); });

       const timestep_text = focus.append("text")
            .attr("class","timestep")
            .attr("x",0)
            .attr("y",9)
            .attr("dx", "-.5em")
            .style("font-size","12px")
            .style("fill","#d3d3d3")
            .on("mouseover", function() { focus.style("display", null); });

       focus.append("text")
           .attr("class","entities-entering-text")
           .attr("x",10)
           .attr("y",9)
           .attr("dx", ".7em")
           .style("fill","black")
           .style("font-size","12px")

       focus.append("text")
           .attr("class","entities-leaving-text")
           .attr("x",0)
           .attr("y",h*1.5 + 5 + padding.top)
           .attr("dx", "-1.2em")
           .attr("dy", ".55em")
           .style("fill","black")
           .style("font-size","12px")

       const overlay = g.append("rect")
           .attr("class", "overlay")
           .attr("width", w)
           .attr("height", h*1.5)
           .attr("transform", "translate(3," +  padding.top + ")")
           .attr("opacity",0)
           .on("mouseover", function() { focus.style("display", null); })
           .on("mouseout", function() {
             _lense_label.text("");
             let x0 = x.invert(d3.mouse(this)[0]),
                  j = Math.round(x0);
             hide_timesteps(j);
             d3.select(".timestep-single").remove();
             d3.selectAll("." +group_name).style("opacity",0.7).style("stroke","black").style("stroke-width","0px");
             focus.style("display", "none");
           })
           .on("mousemove", mousemove);

       overlay.lower();

       function mousemove() {

         const datum = data[group_name];
         let x0 = x.invert(d3.mouse(this)[0]), entering_entities_ct = 0, leaving_entities_ct = 0, j = Math.round(x0);
         const index = j-d0;
         for(key in datum[index]){
           if(datum[index][key] < 0) leaving_entities_ct++;
           if(datum[index][key] > 0) entering_entities_ct++;
         }

         focus.attr("transform", "translate(" + ( x(j) + 20 ) + ",0)");
         timestep_text.text(j);
         focus.select(".entities-entering-text").text(entering_entities_ct);
         focus.select(".entities-leaving-text").text(leaving_entities_ct);
         _lense_label.text("Time:"+ j+ " -> "+"Entering: "+entering_entities_ct+ "   "+"Leaving: " + leaving_entities_ct);
         d3.selectAll(".group").style("opacity","0.15");
         d3.selectAll("." +group_name).style("opacity",0.7).style("stroke","black").style("stroke-width","2px");
         timestep_main_chart(j,{entering:entering_entities_ct, leaving:leaving_entities_ct});
       }

       function mouseover_rect(index) {
         focus.style("display", null);
         const datum = data[group_name];
         let entering_entities_ct = 0, leaving_entities_ct = 0;
         // const index = j-d0;

         for(key in datum[index]){
           if(datum[index][key] < 0) leaving_entities_ct++;
           if(datum[index][key] > 0) entering_entities_ct++;
         }
         focus.attr("transform", "translate(" + ( x(index+d0) + 20 ) + ",0)");
         timestep_text.text(index+d0);
         focus.select(".entities-entering-text").text(entering_entities_ct);
         focus.select(".entities-leaving-text").text(leaving_entities_ct);
       }
  };

  getMaxMin(d,g,stack){
    let ar = [];
    stack(d[g]).forEach(function(g){
      g.forEach(function(g_1){
        ar = ar.concat(g_1[1]);
        ar = ar.concat(g_1[0]);
      });
    });
    return [d3.min(ar),d3.max(ar)];
  };

  // ****************************************** //
  // ***************** BAR CHART ************** //
  // ****************************************** //

  filter_SG_d(group){
    const _keys = group.keys,
          _name = group.name,
          _d = group.d,
          _range = group.range;

    let temp = [];

    _keys.forEach(function(key){
      if(key == _name){
        for (let i = _range.start; i <= _range.stop; i++) {
          let obj = {};
          obj[key] = _d[i][key];
          temp.push(obj);
        }
      }
    })
    return temp;
  };

  get_max_of_stacked_graph_data(data){
    // Find the value of the day with highest total value
    return d3.max(data, function(d){
      let vals = d3.keys(d).map(function(key){ return key != "date" ? d[key] : 0 });
      return d3.sum(vals);
    });
  };

  /*
   * DATA
   */

  get_stack_bar_d(data,range,group_name){
     // Get a list of all characters
     let filtered_entities = [];
     if(lense_lst[this.lense_number-1]){
       filtered_entities = lense_lst[this.lense_number-1].getFilterEntities();
     }
     else{
       filtered_entities = [];
     }

     const characters_list = [],
           groups_list = [],
           max_timestep = d3.max(data, function(d) {return +d.timestep_stop;} );

     data = data.filter(function(d){return (+d.timestep_start >= range.start || +d.timestep_stop <= range.stop) && (d.group == group_name);});

     data.forEach(function(curr,index,ar){
       if(!filtered_entities.includes(curr.character)){
         if(!(characters_list.includes(curr.character))){
           characters_list.push(curr.character);
         }
         if(!(groups_list.includes(curr.group))){
           groups_list.push(curr.group);
         }
       }
     });
     // loop through
       // each object should have a list of every character set to either "in" or "out".

     let final_data_format = this.populate_groups_list(groups_list,characters_list,max_timestep);
     data.forEach(function(curr,index,ar){
       final_data_format[curr.group][curr.timestep_start][curr.character] = final_data_format[curr.group][curr.timestep_start][curr.character] + 1 || 0;
       final_data_format[curr.group][curr.timestep_stop][curr.character] = final_data_format[curr.group][curr.timestep_stop][curr.character] - 1 || 0;
     });
     final_data_format[group_name] = final_data_format[group_name].filter(function(d,i){
       return i >= range.start && i <= range.stop;
     });

     return [final_data_format,characters_list];
   };

   populate_obj(lst){
     let ret = {};
     lst.forEach(function(curr){
       ret[curr] = 0;
     })
     return ret;
   };

   populate_current_list(lst,max_timestep){
     let ret = [];
     for (let i = 0; i <= max_timestep; i++) {
       ret.push(this.populate_obj(lst));
     }
     return ret;
   };

   populate_groups_list(groups_list,characters_list,max_timestep){
     let temp = {},_this = this;
     groups_list.forEach(function(curr,index,ar){
       temp[curr] = _this.populate_current_list(characters_list,max_timestep);
     })
     return temp;
   };

}// END Group Class

function convert_bubble_set_data_to_stack_graph_data(data,filtered_entities){
  const num_timesteps = lengthOfStoryline || 243; //FIXME: for some reason, lengthOfStoryline is undefined in the minecraft dataset
  let ar = [];

  for (let i = 0; i < num_timesteps; i++){ar[i] = {};}

  if(filtered_entities){
    data.forEach(function(currentValue, index, array){
      if(filtered_entities && !filtered_entities.includes(currentValue["character"])){
        if(!(currentValue["group"] in ar[0])){
          for (let i = 0; i < num_timesteps; i++) {
            ar[i][currentValue["group"]] = 0;
          }
        }

        let start = currentValue["timestep_start"]*1, stop = currentValue["timestep_stop"]*1;
        /* FIXME: This is a hack, the data in groups.csv goes past the number of timesteps specified in the line.tsv so
        it's crashing the code. */
        if(stop>num_timesteps-1) stop = num_timesteps;
        for (let j = start; j <= stop; j++) {
          ar[j][currentValue["group"]] = ar[j][currentValue["group"]] + 1;
        }
      }
    });
  }
  else{
    data.forEach(function(currentValue, index, array){
      if(!(currentValue["group"] in ar[0])){
        for (let i = 0; i < num_timesteps; i++) {
          ar[i][currentValue["group"]] = 0;
        }
      }

      let start = currentValue["timestep_start"]*1,
          stop = currentValue["timestep_stop"]*1;
      /* FIXME: This is a hack, the data in groups.csv goes past the number of timesteps specified in the line.tsv so
      it's crashing the code. */
      if(stop>num_timesteps-1) stop = num_timesteps;
      for (let j = start; j < stop; j++) {
        ar[j][currentValue["group"]] = ar[j][currentValue["group"]] + 1;
      }
    });
  }
  return ar;
};


/*
 * D3 SELECTION PROTOTYPES
 */

d3.selection.prototype.display_entities_list = function(d){
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

  let html = "<ul>";
  entering_entities.forEach(function(e){
    const DT_id = "#"+e+"_DT_row";
    const color = "#444444";
    if(e == current_entity) html = html + "<li style='border:1px solid black; color:"+color+";'>" + e + "</li>";
    else html = html + "<li style='color:"+color+"'>" + e + "</li>";
  });
  html = html + "</ul>";

  document.getElementById("current").innerHTML = html;
};

function getOffset( el ) {
    var _x = 0;
    var _y = 0;
    while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
}
