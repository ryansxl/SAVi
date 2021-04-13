

/**
 * Store relative x/y data about each group in a map.
 *	Set / re-set in function get_group_point_meshes();
 *
 * key = group names, value = { name: group's name,
 *								points: { key = timestep (relative x),
 *										  value = { minY: relative Y number,
 *												    maxY: relative Y number
 *												}
 * 										}
 *							  }
 */
var group_mesh_data;

/**
 * An array of shape paths for the group bubbles
 */
var group_shapes_data;

function create_groups_chris() {

	get_group_point_meshes();	// only need to call 1x - parses the raw groups.csv file
								//   and populates the group_mesh_data object
	get_group_shapes();			// only need to call 1x - takes the group_mesh_data map
								//    and creates a set of path-based polygon bubbles
	update_groups_drawing_chris(); // draws (or redraws) the groups on the chart

}

function update_groups_drawing_chris() {
	clear_groups_chris();		// clear prior group bubbles
	// if($("#dataset_dropdown").val()=="EpiSimS" || $("#dataset_dropdown").val()=="nba" ) draw_groups_chris1();	// draw "nicer", rounded shapes
	// else draw_groups_chris1(); // draw rudimentary polygons
	draw_groups_chris2();
}

function clear_groups_chris() {
	d3.selectAll('.group_bubble').remove();
}

function getCharRelativePoint(character_name, timestep) {
	// console.log('['+character_name + '], [' + timestep + ']',timestep,character_name);
	if(formattedLineData[timestep] == undefined || formattedLineData[timestep][character_name] == undefined)
		return { x: timestep, y: undefined };
	var relativeY = formattedLineData[timestep][character_name];
	let point = { x: timestep, y: relativeY};
	return point;
}

/**
 * Populates the group_mesh_data map
 */
function get_group_point_meshes() {
	const group_data  = _bubbleset_data;

	group_mesh_data = {}; // clear the map (in case it's not empty)

	// iterate through each group
	group_lst.forEach(function(group_name){
		let group_mesh = { name: group_name, points: {} };
		group_mesh_data[group_name] = group_mesh;
		let points = {};

		// add that group's points to a map of x/y points
		group_data.filter(function(curr) { return group_name == curr.group})
							.forEach(function(curr){

			let character_name = curr.character;
			for(let i = +curr.timestep_start; i <= +curr.timestep_stop; i++) {
				let tempPoint = getCharRelativePoint(character_name, i);
				if(tempPoint.y == undefined || isNaN(tempPoint.y)) continue;
				if(points[i] == null) {
					points[i] = { x: i, maxY: tempPoint.y, minY:tempPoint.y };
				} else {
					points[i].minY = (points[i].minY > tempPoint.y) ? tempPoint.y : points[i].minY;
					points[i].maxY = (points[i].maxY < tempPoint.y) ? tempPoint.y : points[i].maxY;
					// if(isNaN(points[i].minY) || isNaN(points[i].maxY)){
					// 	console.log(tempPoint.y);
					// }
				}
			}
		});
		group_mesh.points = points;
	});
}

/**
 * Populate the group_shapes_data object
 *  (path-based polygons for the group bubbles)
 *  based on the group_mesh_data data structure
 */
function get_group_shapes() {
	group_shapes_data = [];  // clear the shapes map (in case it's not empty)

	group_lst.forEach(function(group_name){
		let group_bubble = { group: group_name, points: [] };

		// get that specific group from the group_mesh_data object
		let group_mesh = group_mesh_data[group_name];
		let pointsList = d3.values(group_mesh.points);

		let priorTimestep = +pointsList[0].x - 1,
			savedPoints = [],
			priorPoint = pointsList[0];
		for(let i = 0; i < pointsList.length; i++) {
			let point = pointsList[i];
			let xSpot = +point.x;

			if((xSpot - priorTimestep != 1)
				|| (point.maxY < priorPoint.minY - 1)
				|| (point.minY > priorPoint.maxY + 1)
				) {
				savedPoints.push({ x: priorPoint.x + .5, maxY: (priorPoint.maxY + priorPoint.minY)/2, minY: (priorPoint.maxY + priorPoint.minY)/2 })
				group_bubble.points = savedPoints;
				savedPoints = []
				savedPoints.push({ x: point.x-.5, maxY: (point.maxY + point.minY)/2, minY: (point.maxY + point.minY)/2 })
				group_shapes_data.push(group_bubble);
				group_bubble = { group: group_name, points: [] };
			}
			savedPoints.push(point);
			priorTimestep = xSpot;
			priorPoint = point;
		}
		// var point = pointsList[pointsList.length-1];
		// savedPoints.push({ x: point.x+.3, maxY: (point.maxY + point.minY)/2, minY: (point.maxY + point.minY)/2 })
		group_bubble.points = savedPoints;
		group_shapes_data.push(group_bubble);
	});
}

/**
 * Very simple draw function that draws vertical lines to show the groups
 */
function draw_groups_chris1() {
	let groupSvg = d3.select("#groups_g_ID"),
			stepWidth = graph_x(1)-graph_x(0);

	// iterate through each group
	d3.values(group_mesh_data).forEach(function(group_mesh){
		let groupName = group_mesh.name;
		let groupPoints = d3.values(group_mesh.points);
		let groupColor = groupcolors[groupName];

		d3.values(group_mesh.points).forEach(function(d) {
			groupSvg.append('line')
				.attr('class', groupName + ' group')
				.attr('x1', function(d){
					console.log(d.x);
					return graph_x(d.x+.5) - stepWidth/2;
				})
				.attr('x2', graph_x(d.x+.5) - stepWidth/2 )
				.attr('y1', graph_y(d.maxY)+5) // FIXME: @chris-causing some line errors.
				.attr('y2', graph_y(d.minY)-5)
				.attr('stroke',groupColor)
				.attr('opacity',.7)
				.attr('stroke-width',stepWidth + .2)
				.attr("transform", "translate(" + (0) + "," + (storylines_g_margin.bottom + (default_chart_styles.spacing_y) - storyline_height) + ")")
				.on("mouseover", function(d){
					const id = "#"+groupName+"_DT_row";
					if(group_mode_active && !group_selected){
						d3.selectAll(".group").style("opacity","0.15");
						d3.selectAll("." + String(d3.select(this).attr('class')).replace(" ",".")).style("opacity",1);
					}
					$(".dataTables_scrollBody").scrollTo(id);
					const color = rgb2hex(d3.select(id).select(".minicolors-swatch-color").style("background-color"));
					d3.select(id).transition().duration(400).style("color","white").style("background-color",lighten(color,20)).transition().duration(400).style("color","black").style("background-color","#fff");
				})
			 .on("mouseout", function(d){
					if(group_mode_active && !group_selected){
						d3.selectAll(".group").style("opacity",1);
					}
				})
				.on("click", function(d){
					if(group_mode_active){
						add_group_analysis((String(d3.select(this).attr('class')).split(" "))[0]);
					}
				});
		});
	});
}

let add_group_analysis = function(d){
	if(group_mode_active){
		group_selected = true;
		timestep_select_active = true;
		add_timestep_range_selection(d);
	}
}

/**
 * Updated version of draw_groups_chris1() that draws bubbles
 *  instead of vertical lines.
 */
function draw_groups_chris2() {
	// console.log('@@ draw_groups_chris2 @@')
	const x_scale = (rescaled_graph_x) ? rescaled_graph_x:graph_x,
				y_scale = (rescaled_graph_y) ? rescaled_graph_y:graph_y;

	const translate = d3.event ? d3.event.translate: 0;

	let groupSvg = d3.select("#groups_g_ID");
	let stepWidth = x_scale(1)-x_scale(0);

	var groupBubbleArea = d3.area()
					  .curve(d3.curveCatmullRom)
						.x(function(d)  {
							if(+d.x<=100) return x_scale(d.x);
							return x_scale(d.x-.5) - stepWidth/2;
						})
						// .x0(function(d){ return x_scale(d.x);})
						// .x1(function(d){ return x_scale(d.x);})
						// .x1(function(d)  { return x_scale(d.x+.5) + stepWidth/2;})
						.y0(function(d) { return y_scale(d.maxY+.75); })
						.y1(function(d) { return y_scale(d.minY-.75); });

  	// iterate through each bubble & draw it as an "area"
	group_shapes_data.forEach(function(d,i) {
		const groupName = d.group;
		groupSvg.append('path')
			.datum(d.points)
			.attr('class', groupName + ' group')
			.attr('fill', groupcolors[groupName])
			.style('opacity', default_chart_styles.group_opacity)
			// .style("fill","none")
			// .style("stroke",$('#' + d.group + '_color_toggle').val() )
			// .style("stroke-width",parseFloat($("#line_thickness_slider").val()))
			.attr('d',groupBubbleArea)
			// .attr("transform", "translate(" +(zoom_x+translate_x)+ "," +(zoom_y+translate_y)+ ")")
			// .attr("transform", "translate("+(translate)+")")

			// .attr("transform", "translate(" + (translate_val) + ")")
			.on("mouseover", function(d){
				const id = "#"+groupName+"_DT_row";
				if(group_mode_active && !group_selected){
					d3.selectAll(".group").style("opacity","0.15");
					d3.selectAll("." + String(d3.select(this).attr('class')).replace(" ",".")).style("opacity",0.7).style("stroke","black").style("stroke-width","2px");
				}
				$(".dataTables_scrollBody").scrollTo(id);
				d3.select(id).style("background-color","#d3d3d3");
			})
		  .on("mouseout", function(d){
				const id = "#"+groupName+"_DT_row";
				d3.select(id).style("background-color","white");

				if(group_mode_active && !group_selected){
					d3.selectAll(".group").style("opacity",0.7).style("stroke-width","0px");
				}
			})
			.on("click", function(d){
				if(group_mode_active){
					d3.selectAll(".group").style("opacity","0.15");
					d3.selectAll("." + String(d3.select(this).attr('class')).replace(" ",".")).style("opacity",0.7).style("stroke","black").style("stroke-width","2px");
					add_group_analysis((String(d3.select(this).attr('class')).split(" "))[0]);
				}
			});
	});
}
