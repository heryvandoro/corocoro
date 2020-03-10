const width = 1200, height = 700
const svg = d3.select('#map').append('svg')
			.attr('width', width)
			.attr('height', height);
const tooltip = d3.select('#map').append('div')
			.attr('class', 'hidden tooltip');

const countryAlias = {
	"Mainland China": ["China"],
	"US": ["United States of America"],
}

let countries = {};

d3.json('world.json').then(async (can) => {
	can.features.forEach(feature => {
		countries[feature.properties.name] = {
			id: feature.id,
			name: feature.properties.name
		}
	})

	const coronaStatistics = await fetch("https://covid19.mathdro.id/api/confirmed").then(res => res.json());
	let maxConfirmed = -1;
	let temp = null;

	coronaStatistics.forEach(statistic => {
		let found = true;
		if (!countries[statistic.countryRegion]) {
			const aliases = countryAlias[statistic.countryRegion];
			if (aliases) {
				const alias = aliases.find(al => countries[al]);
				if (!alias) {
					found = !found;
				} else {
					statistic.countryRegion = alias;
				}
			} else {
				found = !found;
			}
		}

		if (found) {
			if (maxConfirmed < statistic.confirmed) {
				maxConfirmed = statistic.confirmed;
			}
			const { confirmed, deaths, recovered } = countries[statistic.countryRegion]; 
			countries[statistic.countryRegion] = {
				...countries[statistic.countryRegion],
				confirmed: (confirmed || 0) + statistic.confirmed,
				deaths: (deaths || 0) + statistic.deaths,
				recovered: (recovered || 0) + statistic.recovered,
			}
		}
	})

	can.features = can.features.map(feature => {
		feature.properties = {
			...feature.properties,
			...{
				confirmed: 0,
				deaths: 0,
				recovered: 0
			},
			...countries[feature.properties.name]
		}
		return feature;
	})

    const projection = d3.geoMercator()
				        .translate([600, 500])
				        .scale(160)
    const path = d3.geoPath().projection(projection);
    const countriesDom = svg.selectAll('.country')
    				.data(can.features).enter();

    countriesDom.append('path')
    .attr('class', 'country')
    .attr('d', path)
    .on('mousemove', function(d) {
        var mouse = d3.mouse(svg.node()).map(d => parseInt(d));

        tooltip.classed('hidden', false)
            .attr('style', `left: ${(mouse[0] + 15)}px; top: ${(mouse[1] - 35)}px;`)
            .html(`
            	<div>
            		${d.properties.name}
            	</div>
            	<div class="tooltip-counter">
            		<div>
            			Confirmed: ${d.properties.confirmed}
            		</div>
            		<div>
            			Death: ${d.properties.deaths}
            		</div>
            		<div>
            			Recovered: ${d.properties.recovered}
            		</div>
            	</div>
        	`);
    })
    .on('mouseout', function() {
        tooltip.classed('hidden', true);
    });
});