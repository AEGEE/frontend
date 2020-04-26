// -*- mode: javascript -*-
import {spawnSync} from 'child_process';
import {randomBytes} from 'crypto';
import * as fs from 'fs';
import https from 'https';
import ICAL from 'ical.js';
const get_uuid = (n) => "e947872a-224b-4c84-8d25-90a541a9ec6-" + n;
//PART zero
ICAL.helpers.foldline = (aLine) => {
    // This prevents splitting multi-octet UTF-8 sequences (emojis) over two
    // lines.  The function can be removed once an ical.js version integrating
    // https://github.com/mozilla-comm/ical.js/pull/439 is released
    let result = "", line = aLine || "";

    while (line.length) {
      let y = ICAL.foldLength + 1;
      if (line.length > y)
          for (; y--; y)
	      if (line.codePointAt(y) < 128) break;
      result += ICAL.newLineChar + " " + line.substr(0, y);
      line = line.substr(y);
    }
    return result.substr(ICAL.newLineChar.length + 1);
}

//replaces a file, if its content would be changed
//returns whether the content was changed
function replace_file(filename, new_content) {
    try {
	if (new_content == fs.readFileSync(filename,'utf8')) return false;
    } catch (e) {if (e.code != 'ENOENT') throw e;}
    const randomFileName = filename + randomBytes(30).readUInt32LE(0);
    try {
	fs.writeFileSync(randomFileName, new_content, {mode: 0o644});
	fs.renameSync(randomFileName, filename);
    } catch (e) {
	fs.unlink(randomFileName);
	throw e;
    }
    return true;
}

const env = {VDIRSYNCER_CONFIG:'./config', PATH:'/usr/local/bin', LC_ALL:'en_US.utf-8'};

//PART ONE
//deals with the data from OMS

//See RFC 5545 Section 3.3.3 for CAL-ADDRESS
function createCalAddress (x) {
    const prop = ICAL.Property.fromString('ATTENDEE:');
    x.first_name = x.first_name?.trim();
    x.last_name = x.last_name?.trim();
    if (x.first_name || x.last_name)
	prop.setParameter("cn", x.first_name ? x.first_name + " " + x.last_name : x.last_name);
    prop.setValue('mailto:' + x.email)
    return prop;
}

function event_to_string(event) {
    let e = new ICAL.Event();
    //Unused data from OMS: status, questions, application_status, deleted
    //
    //Unused iCalendar fields:
    //recurrences: RRULE, EXDATE, RDATE, RECURRENCE-ID (but AEGEE-Events are one-time),
    //TRANSP: the calendar is transparent, so no need for this
    //SEQUENCE: we will likely not need this
    //ATTACH (but there are no attachments)
    //COLOR: the color could be set based on CATEGORIES, but this will mess the colors of the events on the devices.  The members can subscribe to the whole calendar and change its color according to their preference as a whole.  Then all events will have that locally overriden colour.  But if each event has a different color, the caledar subscribers cannot change all of them.
    event.name = event.name.trim();
    const cancelled = /^(cancell?ed:? *)(.*)$/i;
    if (event.deleted || cancelled.test(event.name)) {
        e.component.addPropertyWithValue('STATUS', 'CANCELLED');
	e.summary = cancelled.exec(event.name)[2];
    } else
	e.summary = event.name;
    //component.addPropertyWithValue('TRANSP', 'TRANSPARENT');

    e.uid = get_uuid(event.id);
    if (event.type) {//conference, training, nwm
	const prop = new ICAL.Property.fromString('CATEGORIES:');
	prop.setValues([event.type == 'nwm' ? 'Network meeting' : event.type])
	e.component.addProperty(prop);
    }
    if (event.organizers)
	for (const attendee of event.organizers)
	    e.component.addProperty(createCalAddress(attendee));

    let description = event.description.trim()?.replace(/<\/?(i|b|strong|span|ins|u)>/g, "");
    if (event.budget && event.budget != '-') description += '\nBudget: ' + event.budget.trim();
    if (event.programme && event.programme != '-') description += '\nProgramme: ' + event.programme.trim();

    if (event.locations) {
        //add only the first location, as iCalendar does not allow more
	const name = event.locations[0]?.name?.trim(), lat = event.locations[0]?.position?.lat, lng = event.locations[0]?.position.lng;
	if (name && name != 'Not specified')
	    e.component.addPropertyWithValue('LOCATION', name);
	if (lat && lng)
	    e.component.addPropertyWithValue('GEO', lat + ";" + lng);
    }

    if (event.application_starts) {
	let start_options = {hour:'numeric', minute:'numeric', second:'numeric', weekday: 'long', day: 'numeric', month: 'long'};
	const start_date = new Date(event.application_starts), end_date = new Date(event.application_ends);
	if (start_date.getFullYear() != end_date.getFullYear())
	    start_options.year = 'numeric';
	description += '\nApplications are open between ' + Intl.DateTimeFormat('en-GB', start_options).format(start_date) + ' and ' + Intl.DateTimeFormat('en-GB', {year: 'numeric', month: 'long', day: 'numeric', hour:'numeric', minute: 'numeric', second: 'numeric', timeZoneName: 'short', weekday: 'long'}).format(end_date) + '. ';
    }

    if (event.max_participants) {
	description += `This event is for maximum ${event.max_participants} participants` + (event.organizing_bodies ? ' and is organized by ' :'.')
    }
    if (event.organizing_bodies) {
	if (!event.description)
	    description += "Organized by ";
	for (let i = 0; i < event.organizing_bodies.length; i++) {
	    description += event.organizing_bodies[i].body_name;
	    if (i == event.organizing_bodies.length - 2)
		description += ' and ';
	    else if (i < event.organizing_bodies.length - 2)
		description += ', ';
	}
	description += '.';
    }
    if (event.fee) description += ` The fee is ${event.fee} €.`;
    e.description = description;
    if (event.url) e.component.addPropertyWithValue('URL', 'https://my.aegee.eu/events/' + event.url);
    if (event.image) {
	const prop = ICAL.Property.fromString('IMAGE;VALUE=URI:');
	prop.setValue('https://my.aegee.eu/media/events/headimages/' + event.image);
	e.component.addProperty(prop);
    }
    e.startDate = ICAL.Time.fromJSDate(new Date(event.starts), true);
    e.endDate = ICAL.Time.fromJSDate(new Date(event.ends), true);
    e.component.addPropertyWithValue('last-modified', ICAL.Time.fromJSDate(new Date(event.updated_at), true));
    e.component.addPropertyWithValue('dtstamp', ICAL.Time.fromJSDate(new Date(event.updated_at), true));
    e.component.addPropertyWithValue('created', ICAL.Time.fromJSDate(new Date(event.created_at), true));
    return "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:aegee-oms-ical-converter-1-0\r\n" + e.toString() + "\r\nEND:VCALENDAR\r\n";
}

https.get("https://my.aegee.eu/services/oms-events/api", res => {
    let rawData = '';
    res.setEncoding(null);
    res.on('data', c => rawData += c);
    res.on('end', () => {
	const x = JSON.parse(rawData);
	if (x.success) {
	    let s = new Set();//valid filenames
	    const has_data_changed = x.data.map(event => {
		s.add(get_uuid(event.id) + '.ics');
		return replace_file('oms/' + get_uuid(event.id) + '.ics', event_to_string(event))
	    }).some(e => e);
	    for (const x of fs.readdirSync('oms'))
		if (!s.has(x)) fs.unlinkSync(`oms/${x}`);
            //LC_ALL is not needed since python 3.7, 3.6 needs it for click
	    //if (has_data_changed) console.log(spawnSync("vdirsyncer", ['sync', '--force-delete', 'oms_mail'], {env}).stderr.toString());
	}
    })
});

//PART TWO
//deals with the data from the public Google calendar

console.log(spawnSync("vdirsyncer", ['sync', '--force-delete', 'google_download'], {env}).stderr.toString());
let uids = new Set();
for(const file of fs.readdirSync('google_local')) {
    const f = fs.readFileSync('google_local/' + file, 'utf8');
    const comp = new ICAL.Component(ICAL.parse(f));
    for (let e of comp.getAllSubcomponents('vevent')) {
        //Sanitize events coming from google.  iCalendar does not foresee any markup, so :
	//• remove <b>, <i>, <strong>, <ins> tags, opening and closing
	//replace <br> with \n;
	// replace &nbsp; with space
	//leave <a href=...>, <p> and </p> as they are due lack of better ideas
	//replace spaces followed by \n with \n
        //non-breaking spaces (at the end of the line) are not sanitized
	let g = new ICAL.Event(e);
	g.component.removeProperty('transp');
	uids.add(g.uid + '.ics');
	g.description = g.description.trim();
        //if description is wrapped in <p>...</p>,unwrap it.  Then trim, as the result may end in \n
        //replace more than two consecutive \n with \n\n
	if (g.description.slice(-4) == '</p>' && g.description.slice(0, 3) == '<p>')
	    g.description = g.description.slice(3, -4).trim()
	g.description = g.description.replace(/<\/?(i|b|strong|span|ins|u)>/g, "").replace(/<br>/g, "\n").replace(/&nbsp;/g, " ").replace(/<\/p><p>/g, "\n\n").replace(/ +\n/g, "\n").replace(/\n+\n\n/g, "\n\n").trim();
    }
    replace_file('google_sanitized/' + file, comp.toString());
}

for (const x of fs.readdirSync('google_sanitized'))
    if (!uids.has(x)) fs.unlinkSync(`google_sanitized/${x}`);

//console.log(spawnSync("vdirsyncer", ['sync', '--force-delete', 'sanitized_push'], {env}).stderr.toString());
