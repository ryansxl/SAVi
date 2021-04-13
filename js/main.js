let context;

const mode_color = d3.scaleOrdinal()
  .domain(["group", "single line", "trend","outlier","storyline"])
  .range(["#fdcdac", "#b3e2cd" , "#cbd5e8","#f4cae4","d3d3d3"]);

let graph_margin,
    graph_x,
    bar_x,
    zoom_x,zoom_y,zoom_scale_x,zoom_scale_y;

let select_entity=[];
let select_group=[];

let default_chart_styles = {
  dataset: "Star Wars",
  name_display: "Inline",
  line_thickness: 2, // FIXME: line thickness slider set statically in index.html
  height_of_chart: 10,
  axis_thickness_color: '#ccc',
  axis_thickness_val: 2,
  num_ticks: 14,
  font_family: "sans-serif",
  spacing_x: 0,
  spacing_y: 0,
  group_opacity:0.3,
  line_opacity:0.65,
  label_opacity:0.5
};

/*****************************************************************
 *                                                               *
 *                         Data Structures                       *
 *                                                               *
 *****************************************************************/

let charts = {"group": []};

/*****************************************************************
 *                                                               *
 *                   Storyline global data vars                  *
 *                                                               *
 *****************************************************************/
let _storyline_data,    // the raw lines data, loaded from data/[dataset_name]/lines.tsv
    _bubbleset_data,    // the raw groups data, loaded from data/[dataset_name]/groups.csv
    lengthOfStoryline,  // the number of timesteps the storyline contains
    group_lst,       // the total number of groups in the storyline
    characters,
    loadedColors = {};  // if included, the loaded file of colors
    loadedAttributes = {};
    groupcolors={};
/*****************************************************************
 *                                                               *
 *                   SVG / Drawing global vars                   *
 *                                                               *
 *****************************************************************/

/**
 * The initialization function called via index.html:body.onLoad.
 * Uses a d3-queue to load the entities and groups (based on index.html:#dataset_dropdown value)
 * @param - none
 * @return - no return value (and no callbacks)
 */
function go() {
  console.log('-- loading the [' + $("#dataset_dropdown").val() + '] dataset --');
  var q = d3.queue();
  q.defer(loadColors)       // load colors file (if it exists)
  q.defer(loadEntities)     // load the lines data
  q.defer(loadGroups)       // load the groups data
  q.defer(loadAttributes)       // load the attributes data
  q.defer(set_up_the_grid)  // add the svg
  q.await(function(error) {
    if(error) {
      console.error("Error loading data files!");
      throw error;
    }
    console.log("-- drawing storyline --");
    setupAndDrawStoryline();

    // Bring the jquery slider handles below the z-index of the lenses.
    d3.selectAll(".ui-slider-handle").style("z-index","0");
    d3.selectAll(".m_switch_b").style("z-index","0");

    const lst = ["Demetrius_Jackson","Amir_Johnson","Markelle_Fultz","Jonah_Bolden","TJ_McConnell","Dario_Saric","Joel_Embiid","Robert_Covington","Jerryd_Bayless","JJ_Redick","Furkan_Korkmaz","Kevin_Durant","Andre_Iguodala","Shaun_Livingston","Draymond_Green","Klay_Thompson","Kevon_Looney","Patrick_McCaw","Malachi_Richardson"
    ,"Lorenzo_Brown","Malcolm_Miller","OG_Anunoby","Fred_VanVleet","Pascal_Siakam","Delon_Wright","Lucas_Nogueira","Norman_Powell","Kyle_Lowry","Jonas_Valanciunas","Serge_Ibaka","CJ_Miller"];

    // highlight_characters(lst,0.1);
  })
  // q.await(loadEvents);
};

/**
 * Load the lines file for the storyline located in data/[dataset_name]/lines.tsv,
 *   process its data, and populate the sidebar table
 *   [dataset_name] is retrieved from index.html.#dataset_dropdown
 * @param callback - The callback that handles the response.
 */
function loadEntities(callback) {
  let group_color = d3.scaleOrdinal(d3.schemeCategory20);

  storyline_file = 'data/' + $("#dataset_dropdown").val() + "/lines.tsv";
  console.log("  storyline_file = " + storyline_file);
  d3.tsv(storyline_file, function(storyline_d) {
    _storyline_data = storyline_d;                           // set global var
    lengthOfStoryline = Object.keys(storyline_d[0]).length-1;  // set global var
    console.log(Object.keys(storyline_d[0]).length-1);

    // @chris - @hide, why are you doing this for loop???
    //change the type from string to num
    storyline_d.forEach(function(d) {
      for (let i = 0; i < lengthOfStoryline; i++) {
        if(d[i] === " "){
          d[i] = "DONE";
        }
        if(typeof d[i] !== "undefined"){
          d[i] = +d[i];
        }
      };
    });

    characters = getStorylineCharacters(preproccessStorylinesData(storyline_d,lengthOfStoryline));  // set global var

    // convert index.html.#entities_table to a DataTable
    let chars_table = $("#entities_table").DataTable({
        "scrollY": "200px",                       // table height
        "scrollCollapse": true, "paging": false,  // no pagination, use scrolling instead
        // "autoWidth": false,
        "searching": true,
        "oLanguage": {
          // "sSearch": "Filter:",                   // search bar text
          "sInfo": "_TOTAL_ total lines"       // footer msg
        },
        "columnDefs": [
          // {targets:[0], className:"dt-right"},
          // {targets:[1], className:"dt-left"},
          {targets:[0,1], className:"dt-center"},
          {targets:[1], width: '5'},
          {targets:[0], width: '10' }
//           {targets:[1], visible:false}
        ]

      });

    // add the storyline entities as rows to the table
    characters.forEach(function(char_name,i) {
      let char_color = group_color(i);
      if(loadedColors[char_name] != null) {
        char_color = loadedColors[char_name];
      }
      let row = chars_table.row.add([
        char_name.replace("_"," "),
        '<span class="'+char_name+'-DT-row" style="border:0px solid gray;border-radius:4px;margin-left:45px;float:left;">'+            // put the colorpicker inside
          '<input type="checkbox" style="margin-left:auto; margin-right:auto;" class="entity_checkbox" id="'+char_name+'_checkbox" '+    // a span to
          'checked:false>'+               // allow for margin-left to work
        '</span>'
       ]).node();
       $(row).attr("id", char_name+'_DT_row');
      });
    chars_table.draw(false);              // refresh the table (ie, draw the elements)
    // $('.entity_colorpicker').minicolors({ // create the colorpickers for the entities table
    //   theme:"bootstrap", opacity:false,
    //   change: function(value,opacity) {
    //     toggleLineColor(this.id,value);
    //     console.log('Entity colorpicker #' + this.id + ' color value changed to ' + value + '-' + opacity);
    //     const id = this.id.replace("_color_toggle","").replace("#","");
    //
    //     lense_lst.forEach(function(lens){
    //       lens.toggleEntityClr(id,value);
    //     })
    //   }
    // });
 

    $(".entity_checkbox").change(function(){
      console.log(this.id);
      nowid = this.id.replace("_checkbox","");
      console.log(nowid);
      console.log(select_entity);
      if($(this).prop("checked")==false){
        //d3.selectAll("."+this.id.replace("_checkbox","")).style("opacity",0);
        index0 = select_entity.indexOf(nowid);
        if (index0> -1){
          select_entity.splice(index0,1);
        }
      }
      else{
        //d3.selectAll("."+this.id.replace("_checkbox","")).style("opacity",default_chart_styles.line_opacity);
        select_entity.push(nowid);
      }

      if (select_entity.length>0){
      fade_lines(select_entity,0.15);
      }
      else{
       reset();
      }

    });

    callback(null);
  });


  $('#entities_table tbody')
    .on( 'mouseenter', 'tr', function () {
      if (select_entity.length===0){
      const id = this.id.replace("_DT_row","");
      fade_line(id,0.15);
      d3.select("#"+this.id).style("background-color","#d3d3d3");

      lense_lst.forEach(function(lens){
        lens.highlightEntity(id);
      });
      }
      else{
        d3.select("#"+this.id).style("background-color","#d3d3d3");
        fade_lines(select_entity,0.15);
        const id = this.id.replace("_DT_row","");
        d3.select("#storylines_g_child").selectAll("."+id).style("opacity",1);
      }
    })
    .on('mouseleave','tr', function(){

      if (select_entity.length===0){
      
      const id = this.id.replace("_DT_row","");
      d3.select("#"+this.id).style("background-color","white");
      fade_line(null,0.5);
      if(!(line_mode_active && !line_selected)){
        // fade_line(null,0.5);
        // d3.select("#"+this.id).transition().style("color","black").style("background-color","#fff");
      }

      lense_lst.forEach(function(lens){
        lens.unhighlightEntity(id);
      });
      }
      else{
        d3.select("#"+this.id).style("background-color","white");
        fade_lines(select_entity,0.15);
      }

    })
    .on('click','tr', function(){
      const id = this.id.replace("_DT_row","");
      // add_egoline_analysis(id);
      if(line_mode_active) {
        fade_line(id,0.15);
        add_egoline_analysis(id);
      }
    });

}

/**
 * Load the groups file for the storyline located in data/[dataset_name]/groups.csv,
 *    process its data, and populate the sidebar table
 *   [dataset_name] is retrieved from index.html.#dataset_dropdown
 * @param callback - The callback that handles the response.
 */
function loadGroups(callback) {

  group_file = 'data/' + $("#dataset_dropdown").val() + "/groups.csv";
  console.log('  group_file = ' + group_file);
  d3.csv(group_file, function(g_data) {
    _bubbleset_data = g_data;   // set global var
    const sg_d = convert_bubble_set_data_to_stack_graph_data(g_data,null);
    console.log(sg_d);

    group_lst = Object.keys(sg_d[0]);  // set global var

    // convert index.html.#groups_table to a DataTable
    let groups_table = $("#groups_table").DataTable({
        "scrollY": "200px",                       // table height
        "scrollCollapse": true, "paging": false,  // no pagination, use scrolling instead
        "searching": true,
        "oLanguage": {
          // "sSearch": "Filter:",                   // search bar text
        "sInfo": "_TOTAL_ total groups"         // footer msg
        },
        "search": {
            "addClass": 'form-control input-lg col-xs-12'
        },
        "columnDefs": [
          //{targets:[0,1],"searchable": false},
          {targets:[0,1], "className":"dt-center"},
          {targets:[0], width: '10' },
          {targets:[1], width: '5' },
          //{targets:[2], visible:false}
        ]
      });

    let group_color = d3.scaleOrdinal(d3.schemeCategory20).domain(group_lst);
    // add the storyline groups as rows to the table
    group_lst.forEach(function(group_name,i) {
      let groupColor = group_color(group_name);
      if(loadedColors[group_name] != null) {
        groupColor = loadedColors[group_name];
      }
        let row = groups_table.row.add([
          group_name.replace("_"," "),
        '<span class="'+group_name+'-DT-row" style="border:0px solid gray;border-radius:4px;margin-left:45px;float:left;">'+            // put the colorpicker inside
          '<input type="checkbox" style="margin-left:auto; margin-right:auto;" class="group_checkbox" id="'+group_name+'_checkbox" '+    // a span to
          ' checked:false>'+               // allow for margin-left to work
        '</span>'
//         '<div id="'+group_name+'_color_toggle">'+ groupColor +'</div>'
         ]).node();
         groupcolors[group_name]=groupColor;

        $(row).attr("id", group_name+'_DT_row');
    });
    groups_table.draw(false);


    /**              // refresh the table (ie, draw the elements)
    $('.group_colorpicker').minicolors({ // create the colorpickers for the entities table
      theme:"bootstrap", opacity:false,
      change: function(value,opacity) {
        toggleGroupColor(this.id,value);
        console.log('Group colorpicker #' + this.id + ' color value changed to ' + value + '-' + opacity);

        const id = this.id.replace("_color_toggle","").replace("#","");

        lense_lst.forEach(function(lens){
          lens.toggleGroupClr(id,value);
        });

      }
    });
    **/


  $(".group_checkbox").change(function(){
      console.log(this.id);
      nowid = this.id.replace("_checkbox","");
      console.log(nowid);
      
      if($(this).prop("checked")==false){
        //d3.selectAll("."+this.id.replace("_checkbox","")).style("opacity",0);
        index0 = select_group.indexOf(nowid);
        if (index0> -1){
          select_group.splice(index0,1);
        }
      }
      else{
        //d3.selectAll("."+this.id.replace("_checkbox","")).style("opacity",default_chart_styles.line_opacity);
        select_group.push(nowid);
      }


      console.log('11111',select_group);
      
      if (select_group.length>0){
        fadegroups(select_group,0.15);
        if (group_mode_active){
          d3.select("#storylines_g_child").selectAll(".entity").style("opacity",0);
          d3.select("#storylines_g_child").selectAll(".point").style("opacity",0);
          d3.select("#storylines_g_child").selectAll("text").style("opacity",0);      
        }
      }
      else{
         reset();
         if (group_mode_active){
          d3.select("#storylines_g_child").selectAll(".entity").style("opacity",0);
          d3.select("#storylines_g_child").selectAll(".point").style("opacity",0);
          d3.select("#storylines_g_child").selectAll("text").style("opacity",0);      
        }
      }
    });

    callback(null); // this function needs a callback bc it's called using d3-queue
  });




  $('#groups_table tbody')
     .on( 'mouseenter', 'tr', function () {
      const id = this.id.replace("_DT_row","");
      d3.select("#"+this.id).style("background-color","#d3d3d3");

      if (select_group.length===0){
        fade_group(id,0.15);
        if (group_mode_active){
            d3.select("#storylines_g_child").selectAll(".entity").style("opacity",0);
            d3.select("#storylines_g_child").selectAll(".point").style("opacity",0);
            d3.select("#storylines_g_child").selectAll("text").style("opacity",0);
        }
         //const color = rgb2hex(d3.select("#"+this.id).select(".minicolors-swatch-color").style("background-color"));
         //d3.select("#"+this.id).style("background-color","#d3d3d3");
         lense_lst.forEach(function(lens){
           lens.highlightGroup(id);
         });
      }
      else{
        fadegroups(select_group,0.15);
        d3.select("#storylines_g_child").selectAll("."+id).style("opacity",0.7);
        //d3.select("#"+this.id).style("background-color","#d3d3d3");
        if (group_mode_active){
            d3.select("#storylines_g_child").selectAll(".entity").style("opacity",0);
            d3.select("#storylines_g_child").selectAll(".point").style("opacity",0);
            d3.select("#storylines_g_child").selectAll("text").style("opacity",0);
        }
      }

     })
     .on('mouseleave','tr', function(){
      const id = this.id.replace("_DT_row","");
      d3.select("#"+this.id).style("background-color","white");
      //d3.selectAll(".group").style("opacity",0.3);
   
     if (select_group.length===0){

      if(group_mode_active && !group_selected){
          d3.selectAll(".group").style("opacity",0.7).style("stroke-width","0.1px");
          d3.select("#storylines_g_child").selectAll(".entity").style("opacity",0);
          d3.select("#storylines_g_child").selectAll(".point").style("opacity",0);
          d3.select("#storylines_g_child").selectAll("text").style("opacity",0);
      }
      else{
          d3.selectAll(".group").style("opacity",0.3);
          d3.select("#storylines_g_child").selectAll(".entity").style("opacity",0.5);
          d3.select("#storylines_g_child").selectAll(".point").style("opacity",0.5);
          d3.select("#storylines_g_child").selectAll("text").style("opacity",0.5);
      }
      lense_lst.forEach(function(lens){
        lens.unhighlightGroup(id);
      });

    }
    else{
      fadegroups(select_group,0.15);
      if(group_mode_active){
          d3.select("#storylines_g_child").selectAll(".entity").style("opacity",0);
          d3.select("#storylines_g_child").selectAll(".point").style("opacity",0);
          d3.select("#storylines_g_child").selectAll("text").style("opacity",0);
      }

    }





     })
  /**
    .on('mouseleave','tr', function(){
      const id = this.id.replace("_DT_row","");
       d3.select("#"+this.id).style("background-color","white");
      d3.selectAll(".group").style("opacity",0.7);
   
       if(group_mode_active && !group_selected){
          d3.selectAll(".group").style("opacity",1).style("stroke-width","0px");
      }
        lense_lst.forEach(function(lens){
        lens.unhighlightGroup(id);
      });
     })
    .on('click','tr',function(){
      if(group_mode_active){
        const id = this.id.replace("_DT_row","");

        d3.selectAll(".group").style("opacity","0.15");
        // d3.selectAll("." + id).style("opacity",1).style("stroke","black").style("stroke-width","2px"); b/c chris_groups_1
        d3.selectAll("." + id).style("opacity",1);
        add_group_analysis(id);
      }
    });
    */
  
}

/**
 * Load a colors file (if it exists) and store to a loadedColors object.
 * Called using d3.queue, so invoke a callback(null) to finish.
 */
function loadColors(callback) {
  colorsFile = 'data/' + $("#dataset_dropdown").val() + "/colors.csv";
  console.log(colorsFile);
  d3.csv(colorsFile, function(data) {
    console.log(data);
    data.forEach(function(d) {
      const id = d.name||d.item;
      loadedColors[id] = d.color;
    });
    callback(null);
  });
}

/**
 * Load an attributes file (if it exists) and store to a loadedAttributes object.
 * Called using d3.queue, so invoke a callback(null) to finish.
 */
function loadAttributes(callback) {
  attributesFile = 'data/' + $("#dataset_dropdown").val() + "/attributes.json";
  console.log(attributesFile);
  d3.json(attributesFile, function(data) {
    console.log(data);
    loadedAttributes = data;

    callback(null);
  });
}

/**
 * (Re-)Adds the SVG for drawing the storyline
 */
function set_up_the_grid(callback){
  d3.select('#main_view_svg').remove(); // remove if already on the page, then re-add it
  const main_svg_height = $(window).height();//- $("#nav_bar").height()
  let main_view_svg = d3.select('#main_content').append('svg')
    .attr('id','main_view_svg')
    .attr("height", main_svg_height)
    .attr("width",$(window).width()*(12/12));
  main_view_svg.append('foreignObject')
    .attr('id','history_container')
    .attr("height", main_svg_height)
    .attr("width",$(window).width()*(2/12));
  main_view_svg.append('foreignObject')
    .attr('id','storyline_graph_container')
    .attr("height", main_svg_height)
    .attr('x',"250")
    .attr("width",$(window).width()*(8/12));

  callback(null);
};

/**
 * Draws the storyline
 */
function setupAndDrawStoryline() {
  let graph_width = $(window).width()	- 290;

  graph_margin  = {top: 20, right: 20, bottom: 30, left: 50},
  graph_x       = d3.scaleLinear().range([0, graph_width]).domain([-5,lengthOfStoryline+4]),
  bar_x         = d3.scaleLinear().range([0, graph_width]).domain(d3.extent(convert_bubble_set_data_to_stack_graph_data(_bubbleset_data,null), function(d,i) { return i }));

  let arrayOfStorylinesDataValues = arrayOfArrays2Array(_storyline_data);

  create_storyline_graph(preproccessStorylinesData(_storyline_data,lengthOfStoryline),_bubbleset_data,lengthOfStoryline,arrayOfStorylinesDataValues,graph_x,bar_x);
  update_scale_X(graph_width);
  update_scale_Y();
};

function update_scale_X(w){
  $("#scale_x_row").slider({
    min:parseFloat(d3.select("#storyline_graph_container").attr("width")),max:parseFloat(d3.select("#storyline_graph_container").attr("width"))*8,value: w,step: 1,
    slide:function(event,ui){
      scale_graph_x_axis(ui.value);
    },
    stop: function( event, ui ) {
      update_all_anchor_lines();
    }

  }).slider("float");

  //console.log('phphphphph',parseFloat(d3.select("#storyline_graph_container").attr("width")),parseFloat(d3.select("#storyline_graph_container").attr("width"))*8);

  //console.log('oooooooo');
  default_chart_styles.spacing_x = w;
};

function update_scale_Y(){
  $("#scale_y_row").slider({
    min:parseFloat(storyline_height/2),max:parseFloat(storyline_height)*8,value:parseFloat(storyline_height),step:1,
    slide:function(event,ui){
      scale_graph_y_axis(ui.value)
    },
    stop: function( event, ui ) {
      update_all_anchor_lines();
    }
  }).slider("float");

  default_chart_styles.spacing_y = parseFloat(storyline_height);
};

function set_settings_view(){
  var tab_ul = d3.select('body').append('ul').attr('id','tab')
  set_storyboard(tab_ul);

  $(document).ready(function(){
    $("ul#tabs li").click(function(e){
        if ($(this).hasClass("notactive")) {

            $("ul#tab li.active").removeClass("active").addClass("temp");
            $("ul#tab li.notactive").removeClass("notactive").addClass("active");
            $("ul#tab li.temp").removeClass("temp").addClass("notactive");

            $("ul#tabs li.active").removeClass("active").addClass("notactive");
            $(this).removeClass("notactive").addClass("active");
        }
    });
  });
  set_settings();
  format_tabs();
};

function format_tabs(){
  var nav_bar_height = d3.select('.nav-wrapper').style('height');

  // console.log(parseFloat(d3.select('#storyboard_container').style('width')));
  // console.log(d3.select('#tabs').selectAll('li').style('width'));
  var padding = parseFloat(d3.select('#storyboard_container').style('width'))/parseFloat(d3.select('#tabs').selectAll('li').style('width'));
  d3.select('#tabs').selectAll('li')
    .style('width',parseFloat(d3.select('#storyboard_container').style('width'))/2 +'px')
    .style('height',nav_bar_height)
    .style('line-height',nav_bar_height)
    .style('font-size', '15px')
};

function toggleAllNamesButtonPressed(id){
  toggleAllNames(id,characters[3]);
};

function toggleNamesButtonPressed(id){
  toggleNames(id);
};

function toggleLineTextButtonPressed(id){
  toggleLineText(id);
};

function toggleAllStorylineThicknessButtonPressed(thicknessValue){
  for (var i = 0; i < characters.length; i++) {
    toggleStorylineThickness(characters[i],thicknessValue);
    document.getElementById(characters[i]+'_thickness_toggle').value = thicknessValue;
  }
};

function toggleStorylineThicknessButtonPressed(buttonID,value){
  var nameID = String(buttonID).replace(/_thickness_toggle/g,'');
  toggleStorylineThickness(nameID,value);
};

function set_settings(){

  var container_margin = {top: 20, bottom: 20, left: 20, right: 20};

  var nav_bar_height = parseFloat(d3.select('.nav-wrapper').style('height'));

  var div = d3.select('#tab').append('li').attr('class','notactive')
    .append('div').attr('id','settings_container')
    .style('position','absolute')
    .style('top', nav_bar_height + "px" )
    .style('left', parseFloat($(window).width()*(0/12)) + "px")
    .style('height', parseFloat($(window).height()) - parseFloat(nav_bar_height) + "px")
    .style('width', parseFloat($(window).width()*(3/12)) + "px")
    .style('overflow-y','scroll');

  // set up the data set selection thing

  var select_container = div.append('div').attr('id','select_container')
    .style('position','absolute')
    .style('top', container_margin.top +'px' )
    .style('left', parseFloat($(window).width()*(0/12)) + container_margin.left + "px")
    .style('width', parseFloat($(window).width()*(3/12)) - container_margin.right - container_margin.left + "px")
    .style('height', parseFloat($(window).height()*(2.4/10)) - container_margin.top - container_margin.bottom + "px");

  var select = select_container.append('h5').text("Dataset").append('p').text('Choose a new dataset')
    .append('select').attr('id','select');
  select.append('option').attr('value','1').attr('selected',"selected").text('Star Wars data');
  select.append('option').attr('value','2').text('Python Commit data');

  // set up the data set selection thing END

  // set_storyline_toggle_dashboard(div);
  // Set up entities settings panel START
  var entities_container = div.append('div').attr('id','entities_container')
    .style('position','absolute')
    .style('top', container_margin.top + parseFloat($(window).height()*(2/10)) +'px' )
    .style('left', parseFloat($(window).width()*(0/12)) + container_margin.left + "px")
    .style('width', parseFloat($(window).width()*(3/12)) - container_margin.right - container_margin.left + "px")
    .style('height', parseFloat($(window).height()*(7/10)) - container_margin.top - container_margin.bottom + "px");

  var group_toggle_label = entities_container.append('h5').text("Entities")
    .append('p').text('Make changes to Groups and Lines');

  var entities_tab_container = entities_container.append('div');
  var entity_tabs = entities_tab_container.attr('id','entities_tabs').append('ul').attr('class',"nav nav-tabs");
  entity_tabs.append('li').append('a').attr('data-toggle','tab').attr('href','#entities_tabs_tabs-1').text('Groups');
  entity_tabs.append('li').append('a').attr('data-toggle','tab').attr('href','#entities_tabs_tabs-2').text('Lines');

  // $(entities_container).html("<ul><li><a href'#tabs-1'>Nunc tincidunt</a></li><li><a href='#tabs-2'>Proin dolor</a></li><li><a href='#tabs-3'>Aenean lacinia</a></li></ul>");
  var tab_content = entities_tab_container.append('div').attr('class','tab-content');
  var group_div = tab_content.append('div').attr('id','entities_tabs_tabs-1').attr('class','tab-pane');
  var lines_div = tab_content.append('div').attr('id','entities_tabs_tabs-2').attr('class','tab-pane');

  // Set up entities settings panel END


  // Set up chart settings panel START
  var chart_container = div.append('div').attr('id','chart_container')
    .style('position','absolute')
    .style('top', container_margin.top + parseFloat($(window).height()*(8.6/10)) +'px' )
    .style('left', parseFloat($(window).width()*(0/12)) + container_margin.left + "px")
    .style('width', parseFloat($(window).width()*(3/12)) - container_margin.right - container_margin.left + "px")
    .style('height', parseFloat($(window).height()*(5/10)) - container_margin.top - container_margin.bottom + "px");

  chart_container.append('h5').text("Chart")
    .append('p').text('Make changes to the Chart');

  var chart_tab_container = chart_container.append('div');
  var chart_tabs = chart_tab_container.attr('id','chart_tabs').append('ul').attr('class',"nav nav-tabs");
  chart_tabs.append('li').append('a').attr('data-toggle','tab').attr('href','#chart_tabs_tabs-1').text('Axis Styling');
  chart_tabs.append('li').append('a').attr('data-toggle','tab').attr('href','#chart_tabs_tabs-2').text('Line Thickness');
  chart_tabs.append('li').append('a').attr('data-toggle','tab').attr('href','#chart_tabs_tabs-3').text('Name Styling');
  chart_tabs.append('li').append('a').attr('data-toggle','tab').attr('href','#chart_tabs_tabs-4').text('Scaling');

  // $(entities_container).html("<ul><li><a href'#tabs-1'>Nunc tincidunt</a></li><li><a href='#tabs-2'>Proin dolor</a></li><li><a href='#tabs-3'>Aenean lacinia</a></li></ul>");
  var tab_content = chart_tab_container.append('div').attr('class','tab-content');
  var div1 = tab_content.append('div').attr('id','chart_tabs_tabs-1').attr('class','tab-pane');
  var div2 = tab_content.append('div').attr('id','chart_tabs_tabs-2').attr('class','tab-pane');
  var div3 = tab_content.append('div').attr('id','chart_tabs_tabs-3').attr('class','tab-pane');
  var div4 = tab_content.append('div').attr('id','chart_tabs_tabs-4').attr('class','tab-pane');

  set_group_toggle_dashboard(group_div);
  set_line_toggle_dashboard(lines_div);

  set_axis_timestep_toggle(div1);
  set_all_line_toggle(div2);
  set_name_style_toggle(div3);
  set_scaling(div4)

  // I need a button
  // <button class="ui-button ui-widget ui-corner-all">A button element</button>
  d3.select('body').append('button')
    .attr('class','ui-button ui-widget ui-corner-all')
    .attr('id','reset_button');

  d3.select('body').append('input')
    .attr('id','timestep_slider')
    .attr('type','range')
    .style('width', parseFloat($(window).width()*(3/24)) + "px")
    .attr('min','1')
    .attr('max',parseFloat(lengthOfStoryline))
    .attr('step','1')
    .attr('value', '1')
    .on('input',function(){ // Doesnt work
      // storylines_g.transition().call(zoom.transform, d3.zoomIdentity.translate(parseFloat(d3.select('#timestep_slider').attr('value')) ,0))
    });

  $(document).ready(function () {
      $("#entities_tabs").tabs();
      $("#chart_tabs").tabs();
      $( "#select" ).selectmenu();
      $( "#select" ).on('selectmenuchange', function() {
          on_input_file_change();
      });
      $( "button" ).click( function( event ) {
        event.preventDefault();
        storylines_g.transition().call(zoom.transform, d3.zoomIdentity.translate(0,0).scale(1))
      } );
  });

};

function loadEvents(){
  const event = new Event({
    x0:200, x1:220, y0:-20, y1:50
  });

  event.goToFrame();
}
