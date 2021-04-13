/*  FIXME: The problems are:
 *  (1) The data should be passed in as a whole and created as a whole, not one at a time.
 *  (2) The area generator variable needs to read data w.r.t. graph_x and graph_y scales.
 *  (3) Needs to be part of storyline
 *  (4) Classes, use OO Programming
 *  (5) Points data is using scale to generate points but should be used on render. But if used on render and not
 *  in the data processing, it screws up all the groups.
 */

/*
 * CONDITIONAL FUNCTIONS - no_lines_in_group, bubble_height_too_small, wide_enough
 */

/*
 * no_lines_in_group - Detects when there are no lines in a group.
 * @d: Point data for bubble - x, y, height.
 * @i: Timestep by way of index.
 *
 * NOTUSED at the moment but may still need for later.
 */
function no_lines_in_group(d,i){ return parseFloat(d[i].y) == parseFloat(d[i].height); };

/*
 * bubble_height_too_small - Detects when the bubble shrinks too much passed a certain threshold.
 * @d: Point data for bubble - x, y, height.
 * @i: Timestep by way of index.
 */
function bubble_height_too_small(d,i){
  const minimum_height = 30, bubble_height = Math.abs(parseFloat(d[i].y) - parseFloat(d[i].height));
  return bubble_height < minimum_height;
};

/*
 * wide_enough - Detects when the bubble does not cover enough timesteps.
 * @d: Point data for bubble - x, y, height.
 */
function wide_enough(d){
  const minimum_width = 10, bubble_width = Math.abs(parseFloat(d[0].x) - parseFloat(d[d.length-1].x));
  return bubble_width > minimum_width;
};

function jump_detected(d,i){
  // console.log(d);
  const jump_value = 10;
  if(i > 0 && ((d[i].y < d[i-1].y - jump_value) && (d[i].height < d[i-1].height - jump_value) || (d[i].y > d[i-1].y + jump_value) && (d[i].height > d[i-1].height + jump_value))) return true;
  return false;
};

function index_is_at_end(d,i){ return i == 0 || i == 1 || i == d.length - 1 || i == d.length - 2;};

/*
 * RENDERING FUNCTIONS - render, render_bubble, add_area_text_label, add_click_actions
 */

/*
 * render - MAIN function for this file, called to render groups in the form of bubble sets.
 * @group: Object that represents a single group in the dataset.
 */
function render(group){
  var bubbles   =   get_group_data(filter_data(group.points), group.name);
  bubbles.forEach(function(bubble){
    // const bubble = {"bubble": bubble, "color": group.color, "name": group.name};
    // render_bubble({"points": bubble, "color": group.color, "name": group.name});
  })
  // add_area_text_label(storylines_g_child,area,group_name);
};

function render_bubble(data){
  const area  = d3.area()
                .curve(d3.curveBasisOpen)
                // .x(function(d) { return graph_x(d.x); })
                // .y0(function(d) { return graph_y(d.y); })
                // .y1(function(d) { return graph_y(d.height); });
                .x(function(d) { return d.x; })
                .y0(function(d,i) {
                  if(index_is_at_end(data.points,i)) return pinch_ends(d);
                  return (d.y + (default_chart_styles.line_thickness*2));
                })
                .y1(function(d,i) {
                  if(index_is_at_end(data.points,i)) return pinch_ends(d);
                  return (d.height - (default_chart_styles.line_thickness*2));
                });
  d3.select("#groups_g_ID").append("path")
    .datum(data.points)
    .attr("d", area)
    .attr("transform", "translate(" + (-graph_margin.left) + "," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height - graph_margin.top) + ")")
    .style("fill", data.color)
    // .style("fill", function(d) {return "#d3d3d3";})
    .style("opacity","1")
    .style('stroke', darken(data.color,20))
    .style('stroke-width','0px')
    .attr("class", data.name + " group")
    .style('opacity','0.5')
    .on("mouseover", function(d){
      if(group_mode_active && !group_selected){
        d3.selectAll(".group").style("opacity","0.15");
        d3.selectAll("." + String(d3.select(this).attr('class')).replace(" ",".")).style("opacity","1");
      }
    })
   .on("mouseout", function(d){
      if(group_mode_active && !group_selected){
        d3.selectAll(".group").style("opacity","1");
      }
    })
    .on("click", function(d){
      if(group_mode_active){
        d3.selectAll(".group").style("opacity","0.15");
        d3.selectAll("." + String(d3.select(this).attr('class')).replace(" ",".")).style("opacity","1");
        lense_lst.push(new Lense("group",300,0,(String(d3.select(this).attr('class')).split(" "))[0],"null",10,40));
      }
    });
};

function getBoundingBoxCenter (selection) {
  // // get the DOM element from a D3 selection
  // // you could also use "this" inside .each()
  // var element = selection.node();
  // // use the native SVG interface to get the bounding box
  // var bbox = element.getBBox();
  // // return the center of the bounding box
  // return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];

  // var state = d3.select("#state_01000");
  // var centroid = path.centroid(selection.datum());
  // return centroid;
  var bbox = selection.getBBox();
  return [bbox.x + bbox.width/2, bbox.y + bbox.height/2];
}


/*
 * TODO: add_area_text_label - Adding label to the "Bubbles"
 * NOTUSED
 */
function add_area_text_label(svg,area,text){};

/*
 * DATA PROCESSING FUNCTIONS - filter_data, get_group_data, filter_out_undefined.
 */

function filter_data(data){
  return data.filter(function(curr){
    if(curr) return curr[0] != graph_margin.left && curr[1] != graph_margin.top;
    // return curr[0] != 0 && curr[1] != 0;
  })
};

function get_group_data(points,group_name){
  var timesteps = [], too_long = 10;
  for (var i = 0; i < lengthOfStoryline; i++)
    timesteps.push({x: graph_x(i) + graph_margin.left});
    // timesteps.push({x: parseFloat(i)});
  var new_points = timesteps.slice();

  timesteps.forEach(function(curr,index){
    var timestep = [];

    points.forEach(function(curr_pt){
      if( Math.abs(curr.x - curr_pt[0]) < 1 ) timestep.push(curr_pt[1]);
    })

    new_points[index]['y']      = curr.y      = d3.max(timestep);
    new_points[index]['height'] = curr.height = d3.min(timestep);
  })

  // FIXME: Should be a setter method with a class
  charts["group"][group_name]   = new_points;

  timesteps     = filter_out_undefined(timesteps);
  var bubbles = [], bubble = [];
  timesteps.forEach(function(d,i){
    bubble.push(d);
    if(bubble_height_too_small(timesteps,i) && jump_detected(timesteps,i)){
    // if(jump_detected(timesteps,i)){
    // if(bubble_height_too_small(timesteps,i)){
      if(bubble != []){
        if(wide_enough(bubble)){
          bubbles.push(bubble);
        }
        bubble = [];
      }
    }
  })
  return bubbles;
};

function filter_out_undefined(points){ return points.filter(function(curr){return typeof curr.y !== "undefined";}) };

function pinch_ends(d){ return parseFloat(d.height + d.y)/2; };
