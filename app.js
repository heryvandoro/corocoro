const width = 1200, height = 450
const svg = d3.select('#map').append('svg')
			.attr('width', width)
			.attr('height', height);
const tooltip = d3.select('#map').append('div')
			.attr('class', 'hidden tooltip');

d3.json('indonesia.json').then((can) => {            
    const projection = d3.geoMercator()
				        .translate([-2300, 150])
				        .scale(1400)
    const path = d3.geoPath().projection(projection);
    const provinces = svg.selectAll('.province')
    				.data(can.features).enter();

    provinces.append('path').attr('class', (d) => {
        return 'province'
    })
    .attr('d', path)
    .on('mousemove', function(d) {
        var mouse = d3.mouse(svg.node()).map(function(d) {
            return parseInt(d);
        });
        console.log(mouse);
        tooltip.classed('hidden', false)
            .attr('style', 'left:' + (mouse[0] + 15) +
                    'px; top:' + (mouse[1] - 35) + 'px')
            .html(d.properties.state);
    })
    .on('mouseout', function() {
        tooltip.classed('hidden', true);
    });
});