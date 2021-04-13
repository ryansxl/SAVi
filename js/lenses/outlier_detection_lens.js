function get_characters(d0,d1){

  let adj_matrix        = matrix(characters);
  let active_characters = [], links = [];

  //filter
  let filtered_entities = [];
  var shuai = 9999;

  for (let timestep = d0; timestep < d1; timestep++) {
    const data = _bubbleset_data.filter(function(el){ return timestep >= el.timestep_start && timestep <= el.timestep_stop;});
    group_lst.forEach(function(group){
      const single_group_data = data.filter(function(el){return el.group == group;});
      single_group_data.forEach(function(curr_a){
        single_group_data.forEach(function(curr_b){
          if(!filtered_entities.includes(curr_a.character) && !filtered_entities.includes(curr_b.character) && adj_matrix[curr_a.character] && adj_matrix[curr_b.character]){
            adj_matrix[curr_a.character][curr_b.character].val = +(adj_matrix[curr_a.character][curr_b.character].val) + 1;
            adj_matrix[curr_b.character][curr_a.character].val = +(adj_matrix[curr_b.character][curr_a.character].val) + 1;

            adj_matrix[curr_a.character][curr_b.character].group = group;
            adj_matrix[curr_b.character][curr_a.character].group = group;

            if(!active_characters.includes(curr_a.character)) active_characters.push(curr_a.character);
            if(!active_characters.includes(curr_b.character)) active_characters.push(curr_b.character);
          }
        })
      })
    })
  }

  let node_groupings = calculate_independant_sets(adj_matrix);

  const graph = {
    nodes: get_nodes_data(active_characters,node_groupings),
    links: get_links_data(adj_matrix,active_characters)
  };

  return graph;

}


function show_outlier_analysis(svg,h,w,d0,d1,lense_number){
  svg.select("#adjacencyG").remove();
  svg.selectAll("text").remove();

  let adj_matrix        = matrix(characters);
  let active_characters = [], links = [];

  d3.select("#analysis_view_div_"+lense_number).add_range_annotations_mouseover(lense_number);

  //filter
  let filtered_entities = [];
  if(lense_lst[lense_number-1]){
    filtered_entities = lense_lst[lense_number-1].getFilterEntities();
  }
  else{
    filtered_entities = [];
  }

  for (let timestep = d0; timestep < d1; timestep++) {
    const data = _bubbleset_data.filter(function(el){ return timestep >= el.timestep_start && timestep <= el.timestep_stop;});
    group_lst.forEach(function(group){
      const single_group_data = data.filter(function(el){return el.group == group;});
      single_group_data.forEach(function(curr_a){
        single_group_data.forEach(function(curr_b){
          if(!filtered_entities.includes(curr_a.character) && !filtered_entities.includes(curr_b.character) && adj_matrix[curr_a.character] && adj_matrix[curr_b.character]){
            adj_matrix[curr_a.character][curr_b.character].val = +(adj_matrix[curr_a.character][curr_b.character].val) + 1;
            adj_matrix[curr_b.character][curr_a.character].val = +(adj_matrix[curr_b.character][curr_a.character].val) + 1;

            adj_matrix[curr_a.character][curr_b.character].group = group;
            adj_matrix[curr_b.character][curr_a.character].group = group;

            if(!active_characters.includes(curr_a.character)) active_characters.push(curr_a.character);
            if(!active_characters.includes(curr_b.character)) active_characters.push(curr_b.character);
          }
        })
      })
    })
  }

  let node_groupings = calculate_independant_sets(adj_matrix);

  const graph = {
    nodes: get_nodes_data(active_characters,node_groupings),
    links: get_links_data(adj_matrix,active_characters)
  };
  create_adjacency_matrix(svg,adj_matrix,graph,{h:h,w:w},d3.select("#analysis_view_div_"+lense_number));
  // create_force_directed_graph(svg,adj_matrix,graph,h-50,w-50,lense_number,node_groupings,d0,d1);
};

function get_network_graph_data(sim){
  const adj_matrix = sim;

  return {
    labels : characters,
    positions : numeric.transpose(mds.classic(adj_matrix))
  }
};

function create_network_graph(svg,d,h,w){

  mds.drawD3ScatterPlot(svg,
      d.positions[0],
      d.positions[1],
      d.labels,
      {
          w : w,
          h : h,
          padding : 37,
          reverseX : true,
          reverseY : true,
      });
};

let matrix = function(characters){
  var ret = {};
  characters.forEach(function(curr_a){
    var char_array = {};
    characters.forEach(function(curr_b){
      var node_obj    = {};
      node_obj.val    = 0;
      node_obj.group  = 0;
      char_array[curr_b] = node_obj;
    })
    ret[curr_a] = char_array;
  })
  // console.log(ret);
  return ret;
};

function get_nodes_data(data,groupings){
  let ret = [];
  data.forEach(function(character){
    let g_val = [];

    groupings["id_set"].forEach(function(g,i){
      if(g.includes(character)) return g_val.push(i);
    })
    ret.push(
      {
        id:character,
        group:groupings["entity_groups"]
      }
    );
  })
  return ret;
};

function get_links_data(adj_matrix,active_characters){
  let ret = [];
  active_characters.forEach(function(character_a,index_a){
    active_characters.forEach(function(character_b,index_b){
      if(adj_matrix[character_a][character_b].val > 0 && character_a !== character_b) ret.push({source: character_a, target: character_b, value: adj_matrix[character_a][character_b].val});
    })
  })
  return ret;
};

function get_max_link_val(adj_matrix){
  let max = 0;
  for(let row in adj_matrix){
    for(let col in adj_matrix[row]){
      if(adj_matrix[row][col].val > max) max = adj_matrix[row][col].val;
    }
  }
  return max;
};

function get_max_node_val(d){
  let max = 0;
  d.nodes.forEach(function(node){
    const links = d.links.filter(function(el){return node.id == el.source || node.id == el.target;})
    if(links.length > max) max = links.length;
  })
  return max;
};

function create_adjacency_matrix(svg,adj_matrix_data,graph,dim,div){
  const rect_diameter = (dim.w - 90) / graph.nodes.length;
  let edgeHash = {};
  graph.links.forEach(edge =>{
    const id = edge.source + "-" + edge.target;
    edgeHash[id] = edge;
  });

  let matrix = [];
  let color_range = [];
  graph.nodes.forEach((source, a) => {
    graph.nodes.forEach((target, b) => {
      var grid = {id: source.id + "-" + target.id, x: b, y: a, weight: 0};
      if(edgeHash[grid.id]){
        grid.weight = edgeHash[grid.id].value;
        if ( !color_range.includes(grid.weight)){
          color_range.push(grid.weight);
        }
      }
    matrix.push(grid)
    })
  });

  if( ! color_range.includes(0)){
    color_range.push(0);
  }

  const scale = d3.scaleSequential(d3.interpolateGreens).domain([d3.min(color_range), d3.max(color_range)]);
  
  var circle_date = []
  if(d3.max(color_range)>=7){
    circle_date = [1,1,1,1,1,1,1,1];
  }else{
    for(let i = 0; i<=d3.max(color_range); i++){
      circle_date.push(1);
    }
  }

  var generator = d3.pie().value((d) => d);
  var slices = generator(circle_date);
  const innerArc = d3.arc().innerRadius(15).outerRadius(25);

  if(circle_date.length > 1){

    svg.append("g")
      //.attr("transform","translate(45,40)")
      .attr("id","pies")
      .attr('width',80)
      .attr('height',80)
      .selectAll('path')
      .data(slices)
      .enter()
      .append('path')
      .attr('transform','translate(40,45)')
      .attr('d',(d,i) => innerArc(slices[i]))
      .attr('fill',(d,i) => scale(i * d3.max(color_range) / (circle_date.length - 1)))
    
    svg.append("text")
      .attr('x',12)
      .attr('y',10.5)
      .text("Interactions")
      .style("font-size","12px")

    for(let i = 0; i < circle_date.length ; i++){

      var angle = (slices[i].startAngle + (slices[i].endAngle - slices[i].startAngle) / 2) * 180 / 3.1415926 ;
      var num = parseInt (i * d3.max(color_range) / (circle_date.length - 1));
      if(num >= 10){
        angle -= 11;
      }else{
        angle -= 4;
      }

      svg.append("text")
        .attr('x',40)
        .attr('y',18)
        .text(num)
        .style("font-size","8px")
        .attr("transform","rotate("+angle+",40,45)")

    }
  }else{
     
     svg.append("g")
      //.attr("transform","translate(45,40)")
      .attr("id","pies")
      .attr('width',80)
      .attr('height',80)
      .selectAll('path')
      .data(slices)
      .enter()
      .append('path')
      .attr('transform','translate(40,44)')
      .attr('d',(d,i) => innerArc(slices[i]))
      .attr('fill',(d,i) => scale(i * d3.max(color_range) / (circle_date.length - 1)))
      .style("fill-opacity", 0)

  }

  

// add matrix
  svg.append("g")
  .attr("transform","translate(85,80)")
  .attr("id","adjacencyG")
  .selectAll("rect")
  .data(matrix)
  .enter()
  .append("rect")
  .attr("class",function(d){
    return "grid " + d.id;
  })
  .attr("width",rect_diameter)
  .attr("height",rect_diameter)
  .attr("x", d=> d.x*rect_diameter)
  .attr("y", d=> d.y*rect_diameter)
  .attr('fill', function(d) {
          return scale(d.weight);
        })
  .style("fill-opacity", d=> d.weight * .6)

//add col name
  svg.append("g")
  .attr("class","matrix-label")
  .attr("transform","translate(85,78) rotate(-90)")
  .selectAll("text")
  .data(graph.nodes)
  .enter()
  .append("text")
  .attr("y",(d,i) => i * rect_diameter + (rect_diameter/1.5))
  .attr("class",d => d.id)
  .text(d => d.id)
  .style("text-anchor","start")
  .style("font-size","0.7em")

//add row name
  svg.append("g")
  .attr("class","matrix-label")
  .attr("transform","translate(83,80)")
  .selectAll("text")
  .data(graph.nodes)
  .enter()
  .append("text")
  .attr("y",(d,i) => i * rect_diameter + (rect_diameter/1.5))
  .attr("class",d => d.id)
  .text(d => d.id)
  .style("text-anchor","end")
  .style("font-size","0.7em")

  d3.selectAll("rect.grid").on("mouseover", gridOver).on("mouseout", gridOut);

  function gridOver(d) {
    const name_a = d.id.split("-")[0],
          name_b = d.id.split("-")[1];

    svg.selectAll("rect").style("stroke-width", function(p) { return p.x == d.x || p.y == d.y ? "3px" : ".5px"});
    svg.selectAll("text").style("opacity","0.1");

    svg.selectAll("."+name_a).style("opacity","1");
    svg.selectAll("."+name_b).style("opacity","1");
    div.select(".lense-label.selection").text(name_a + " <-" + " " + d.weight + " "  +"-> " + name_b);
  }
  function gridOut(d) {
    svg.selectAll("rect").style("stroke-width","1px");
    svg.selectAll("text").style("opacity","1");
    div.select(".lense-label.selection").text("");
  }
};

// function create_force_directed_graph(svg,adj_matrix,graph,height,width,lense_number,node_g,d0,d1){
//   const groups = group_lst;

//   let fake_node_positions = {};

//   const n = Math.ceil(groups.length/2)*2,
//         a = Math.sqrt(n),
//         b = n/a,
//         w = width-70,
//         h = height-70;

//   for (let i = 0; i < a; i++) {
//     for (let j = 0; j < b; j++) {
//       const index = Math.round(i*b+j);
//       fake_node_positions[String(groups[index])] = {
//         "x": w/(2*b) + (j*w/b),
//         "y": h/(2*a) + (i*h/a)
//       }
//     }
//   }
//   // console.log(fake_node_positions);
//
//   let node_radius_scale = d3.scaleLinear()
//     .domain([0, get_max_node_val(graph)])
//     .range([3,width/25]);
//
//   const max_link_len = get_max_link_val(adj_matrix);
//
//   const link_len_scale = d3.scaleLinear()
//     .domain([1,max_link_len])
//     .range([1,(width/20)]);
//
//   svg.selectAll('.nodes').remove();
//   svg.selectAll('.links').remove();
//   svg.selectAll('circle').remove();
//   svg.selectAll('.nodes').remove();
//
//   let max         = 20;
//   let scale_edge  = d3.scaleLinear().domain([0,max]).range([0,5]);
//
//   var forceCollide = d3.forceCollide()
//       .radius(function(d) { return 10; })
//       .iterations(1);
//
//   let simulation = d3.forceSimulation()
//       .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(3))
//       .force("center", d3.forceCenter(w / 2, h / 2))
//       .force('collision', forceCollide)
//       .force('x', d3.forceX().x(function(d) {
//         let x = 0;
//         if(!(d.id in d.group)){
//           return w / 2;
//         }
//         d.group[d.id].forEach(function(group,i){
//           if(i == 1){
//             x = (+x + +fake_node_positions[group].x);
//           }
//           else{
//             x += (+x + +fake_node_positions[group].x)/2;
//           }
//         })
//         return x;
//       }).strength(1))
//       .force('y', d3.forceY().y(function(d) {
//         let y = 0;
//         if(!(d.id in d.group)){
//           return h / 2;
//         }
//         d.group[d.id].forEach(function(group,i){
//           if(i == 1){
//             y = (+y + +fake_node_positions[group].y);
//           }
//           else{
//             y += (+y + +fake_node_positions[group].y)/2;
//           }
//         })
//         return y;
//       }).strength(1));
//
//   let link = svg.append("g")
//       .attr("class", "links")
//       .selectAll("line")
//       .data(graph.links)
//       .enter().append("line")
//       .attr("id",function(d){return d.source + d.target + lense_number;})
//       .attr("stroke",function(d){
//         return "#999";
//       })
//       .attr("opacity",0.3)
//       .attr("stroke-width", "0.5");
//
//   const _links = graph.links.slice();
//
//   let node = svg.append("g")
//       .attr("class", "nodes")
//       .selectAll("circle")
//       .data(graph.nodes)
//       .enter().append("circle")
//       .attr("class","selectable")
//       .attr("id",function(d){return d.id+lense_number;})
//       .attr("r", function(d){
//         const links_containing_this = graph.links.filter(function(el){return d.id == el.source || d.id == el.target;})
//         return node_radius_scale(links_containing_this.length);
//       })
//       .attr("fill", function(d) { return event_color(d.id); })
//       .style("stroke", "#d3d3d3")
//       .style("stroke-width", default_chart_styles.line_thickness/2)
//       .style("opacity",0.7)
//       .on("mouseover",function(d){
//           d3.select("#"+String(svg.attr("id")).replace("analysis_view_","analysis_view_div_")).select(".selection").text(d.id);
//
//           const links_containing_this = _links.filter(function(el){return d.id == el.source.id || d.id == el.target.id;})
//
//           svg.selectAll("line").each(function(line){
//             d3.select("#"+this.id).attr("opacity",0.1);
//           })
//           svg.selectAll(".selectable").each(function(circle){
//             d3.select("#"+this.id).style("opacity",0.1);
//           })
//
//           links_containing_this.forEach(function(link){
//             d3.select("#"+link.source.id+link.target.id+lense_number).attr("opacity",1);
//             d3.select("#"+link.source.id+lense_number).style("opacity",1);
//             d3.select("#"+link.target.id+lense_number).style("opacity",1);
//           })
//
//           d3.select(this).attr("opacity",1);
//
//           on_mouseover_entity(d.id);
//       })
//       .on("mouseout", function(){
//         d3.select("#"+String(svg.attr("id")).replace("analysis_view_","analysis_view_div_")).select(".selection").text(lense.placeholder_text);
//
//         svg.selectAll("line").each(function(line){
//           d3.select("#"+line.source.id+line.target.id+lense_number).attr("opacity",0.3);
//         })
//         svg.selectAll("circle").each(function(circle){
//           d3.select("#"+this.id).style("opacity",0.7);
//         })
//         on_mouseout_entity();
//       });
//
//     node.append("title")
//         .text(function(d) { return d.id; });
//
//     simulation
//         .nodes(graph.nodes)
//         .on("tick", ticked);
//
//     simulation.force("link")
//         .links(graph.links);
//
//     function ticked() {
//       link
//           .attr("x1", function(d) {
//             return d.source.x;
//           })
//           .attr("y1", function(d) {
//             return d.source.y;
//           })
//           .attr("x2", function(d) {
//             return d.target.x;
//           })
//           .attr("y2", function(d) {
//             return d.target.y;
//           });
//
// // TODO: change the max to pad the x and y
//       node
//       .attr("cx", function(d) { return d.x; })
//       .attr("cy", function(d) { return d.y; });
//     }
//
//     function dblclick(d) {
//       d3.select(this).classed("fixed", d.fixed = false);
//     }
// };

// Multiple nodes can belong in multiple groups
function calculate_independant_sets(data){

  function removeDuplicateUsingSet(A){
    let hash = {},
        out = [];
    for (let i = 0, l = A.length; i < l; i++) {
      let key = A[i].join('|');
      if (!hash[key]) {
        out.push(A[i]);
        hash[key] = 'found';
      }
    }
    return out;
  };

  let d = Object.assign(data);
  let num_groups = [];
  let g_lst = [],
      entity_groups = {};

  for(rhs in d){
    let g = {}, lst = [], group_associations = [];
    for(lhs in d){
      if(rhs == lhs) continue;
      else{
        if(d[rhs][lhs].group != 0){ // they are connected
          if(!(lst.includes(rhs))) lst.push(rhs);
          if(!(lst.includes(lhs))) lst.push(lhs);
          if(!(group_associations.includes(d[rhs][lhs].group))) group_associations.push(d[rhs][lhs].group);
          if(!(num_groups.includes(d[rhs][lhs].group))) num_groups.push(d[rhs][lhs].group);
        }
      }
    }
    if(group_associations.length > 0) entity_groups[rhs] = group_associations;
    if(lst.length > 0) g_lst.push(lst);
  }

  g_lst.map(function(d){d.sort();});

  return {
    "id_set": removeDuplicateUsingSet(g_lst).sort(function (a, b) {
                return b.length < a.length;
              }),
    "entity_groups" : entity_groups,
    "num_groups": +num_groups.length
  }
}

function get_groups(d){
  const g_lst = group_lst;

  let ret = {};
  for (entity_key in d){
    let groups = [];
    for(other_entity_key in d[entity_key]){
      if(!(groups.includes(d[entity_key][other_entity_key].group)) && g_lst.includes(d[entity_key][other_entity_key].group)){
        groups.push(d[entity_key][other_entity_key].group);
      }
    }
    ret.entity_key = groups;
  }
  return ret;
};
