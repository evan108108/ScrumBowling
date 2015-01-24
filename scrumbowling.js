var cgsb = {
	config: {
		SPRINT_DAYS: [ "W", "Th", "F", "M", "T", "W", "TH", "F", "M", "T" ],
		POINT_VALUES: [-20, -13, -8, -5, -3, -2, 0, 2, 3, 5, 8, 13, 20],
		HALF_DAYS: 1,
		TEAM: [
			{ name: "Evan", days_available: 5 },
			{ name: "Caleb", days_available: 2 },
			{ name: "Naveen", days_available: 10 },
			{ name: "Jihyun", days_available: 10 },
			{ name: "Alex", days_available: 10 },
			{ name: "Kosta", days_available: 10 },
			{ name: "Ryan", days_available: 10 }
		],
		MAX_POINTS_PER_DAY: 5,
		EMPTY_FRAME_CHAR: '-',
		SCRUB_BOWLING_ID: 'scrum_bowling',
		TEAM_MEMBER_INDEX_ATTRIBUTE_NAME: 'team_member_index',
		TEAM_MEMBER_ID_PREFIX: 'team-member-',
		TABLE_BODY_ID: 'scrum_bowling_table_body',
		TEAM_MEMBER_SELECT_MENU_ID: 'team-menu',
		POINT_MENU_ID: 'points-menu',
		SUBMIT_BUTTON_ID: 'submit-button',
		UNAVAILABLE_COLOR: '#000000',
		TOTAL_POINTS_COL_NAME: 'Total Points'
	},
	drawTableHeader: function(tbl) {
		var thead = tbl.createTHead();
		var row = thead.insertRow(0);
		row.insertCell(0).innerHTML = "";
		cgsb.config.SPRINT_DAYS.reduce(function(acc, item, index) {
			row.insertCell(index +1).innerHTML = item;
		}, 0);
		row.insertCell(cgsb.config.SPRINT_DAYS.length+1).innerHTML = cgsb.config.TOTAL_POINTS_COL_NAME;
		return tbl;
	},
	drawTableBody: function(tbl) {;
		var tbody = tbl.createTBody('tbody');
		tbody.setAttribute('id', cgsb.config.TABLE_BODY_ID);

		cgsb.config.TEAM.reduce(function(acc, item, index){
			var row = tbody.insertRow(index);
			row.setAttribute('id', cgsb.config.TEAM_MEMBER_ID_PREFIX + item.name);
			row.setAttribute(cgsb.config.TEAM_MEMBER_INDEX_ATTRIBUTE_NAME, index );
			row.insertCell(0).innerHTML = item.name;
			cgsb.config.SPRINT_DAYS.reduce(function(a, v, i) {
				return row.insertCell(i+1).innerHTML = cgsb.config.EMPTY_FRAME_CHAR;
			}, 0);
			row.insertCell(cgsb.config.SPRINT_DAYS.length+1).innerHTML = cgsb.config.EMPTY_FRAME_CHAR;
		}, 0);
		return tbl;
	},
	drawInitialPointsForTeamMember: function(team_member_index) {
		var days_unavailable = cgsb.config.SPRINT_DAYS.length - cgsb.config.TEAM[team_member_index].days_available;
		if(days_unavailable > 0) {
			cgsb.addStoryPointsToTeamMember(team_member_index, days_unavailable * cgsb.config.MAX_POINTS_PER_DAY);
		}
	},
	drawTable: function() {
		var tbl = document.createElement('table');
		tbl.setAttribute('border','1');
		tbl = cgsb.drawTableBody(cgsb.drawTableHeader(tbl));
		$('#' + cgsb.config.SCRUB_BOWLING_ID).append(tbl);
		cgsb.config.TEAM.reduce(function(acc, v, i) {
			cgsb.drawInitialPointsForTeamMember(i);
		}, 0);
		cgsb.indicateUnavailableDays();
	},
	calcPointsForTeamMember: function(team_member_index) {
		return cgsb.config.SPRINT_DAYS.reduce(function(acc, item, index) {
			var row_val = $('#' + cgsb.config.TABLE_BODY_ID, '#' + cgsb.config.SCRUB_BOWLING_ID).children()[team_member_index].children[index + 1].innerHTML;
			return ((row_val == cgsb.config.EMPTY_FRAME_CHAR)? acc: acc + parseInt(row_val));
		}, 0);
	},
	clearPointsForTeamMember: function(team_member_index) {
		cgsb.config.SPRINT_DAYS.reduce(function(acc, item, index) {
			var row = $('#' + cgsb.config.TABLE_BODY_ID, '#' + cgsb.config.SCRUB_BOWLING_ID).children()[team_member_index].children[index + 1];
			row.innerHTML = cgsb.config.EMPTY_FRAME_CHAR
		}, 0);
	},
	updatePointTotalsForTeamMember: function(team_member_index) {
		var point_total = cgsb.calcPointsForTeamMember(team_member_index) - ((cgsb.config.SPRINT_DAYS.length - cgsb.config.TEAM[team_member_index].days_available) * cgsb.config.MAX_POINTS_PER_DAY);
		var row = $('#' + cgsb.config.TABLE_BODY_ID, '#' + cgsb.config.SCRUB_BOWLING_ID).children()[team_member_index].children[cgsb.config.SPRINT_DAYS.length+1];
		row.innerHTML = point_total;
	},
	addStoryPointsToTeamMember: function(team_member_index, points) {
		var base_points = (cgsb.config.SPRINT_DAYS.length - cgsb.config.TEAM[team_member_index].days_available) * cgsb.config.MAX_POINTS_PER_DAY;
		var new_point_total = cgsb.calcPointsForTeamMember(team_member_index) + points
		
		if(points < 0) { if(new_point_total < base_points) { new_point_total = base_points; } }

		cgsb.clearPointsForTeamMember(team_member_index);
		points = new_point_total;

		cgsb.config.SPRINT_DAYS.reduce(function(acc, item, index) {
			var row = $('#' + cgsb.config.TABLE_BODY_ID, '#' + cgsb.config.SCRUB_BOWLING_ID).children()[team_member_index].children[index + 1];
			var row_val = row.innerHTML;
			var new_row_val = 0;

			if(points > 0) {
				if(row_val != cgsb.config.EMPTY_FRAME_CHAR) {
					row_val = parseInt(row_val);
				} else { row_val = 0; }

				Array.apply(null, Array(cgsb.config.MAX_POINTS_PER_DAY)).map(function (_, i) {
					if(points > 0) {
						new_row_val += 1;
						points--;
					}
				});
				row.innerHTML = (new_row_val > 0)? new_row_val: row_val;
			}
		}, 0);
		cgsb.updatePointTotalsForTeamMember(team_member_index);
	},
	drawTeamMemberDropDown: function() {
		var menu = $("<select></select>").attr("id", cgsb.config.TEAM_MEMBER_SELECT_MENU_ID).attr("name", cgsb.config.TEAM_MEMBER_SELECT_MENU_ID);
		$.each(cgsb.config.TEAM, function (i, el) {
				menu.append("<option value='" + i + "'>" + el.name + "</option>");
		});
		$('#' + cgsb.config.SCRUB_BOWLING_ID).append(menu)
	},
	drawPointsDropDown: function() {
		var menu = $("<select></select>").attr("id", cgsb.config.POINT_MENU_ID).attr("name", cgsb.config.POINT_MENU_ID);
		$.each(cgsb.config.POINT_VALUES.reverse(), function (i, el) {
				menu.append("<option value='" + el + "'" + (el==0?"SELECTED":"") +">" + el + "</option>");
		});
		$('#' + cgsb.config.SCRUB_BOWLING_ID).append(menu)
	},
	drawSubmitButton: function() {
		var submitButton = $("<input></input>").attr("type", "submit").attr("id", cgsb.config.SUBMIT_BUTTON_ID).attr("name", cgsb.config.SUBMIT_BUTTON_ID).attr("onClick", "cgsb.processForm()");
		$('#' + cgsb.config.SCRUB_BOWLING_ID).append(submitButton)
	},
	processForm: function() {
		cgsb.addStoryPointsToTeamMember($('#' + cgsb.config.TEAM_MEMBER_SELECT_MENU_ID).val(), parseInt($('#' + cgsb.config.POINT_MENU_ID).val()));
	},
	indicateUnavailableDays: function() {
		$.each(cgsb.config.TEAM, function (index, el) {
			var badDays = (cgsb.config.SPRINT_DAYS.length - el.days_available);
			if(badDays > 0) {
				Array.apply(null, Array(badDays)).map(function (_, i) {
					$('#' + cgsb.config.TEAM_MEMBER_ID_PREFIX + el.name).children()[i+1].setAttribute('bgcolor', cgsb.config.UNAVAILABLE_COLOR);
				});
			}
		});
	},
	init: function() {
		cgsb.drawTable();
		cgsb.drawTeamMemberDropDown();
		cgsb.drawPointsDropDown();
		cgsb.drawSubmitButton();
	}
}

$( document ).ready( function(){
	cgsb.init();
});