const infos = {
  "stockbrest.cognix-systems.com": {
    "dos": {
      "2323": "SIPLEC"
    },
    "islands": {
      "12": {
        "label": "Source 1",
        "id": "12"
      },
      "14": {
        "label": "Source 3",
        "id": "14"
      },
      "16": {
        "label": "Source 2",
        "id": "16"
      }
    },
    "timeslots": [
      {
        "id": "30",
        "label": "04:30 - 04:50"
      },
      {
        "id": "31",
        "label": "04:50 - 05:10"
      },
      {
        "id": "32",
        "label": "05:10 - 05:30"
      },
      {
        "id": "33",
        "label": "05:30 - 05:50"
      },
      {
        "id": "34",
        "label": "05:50 - 06:10"
      },
      {
        "id": "35",
        "label": "06:10 - 06:30"
      },
      {
        "id": "36",
        "label": "06:30 - 06:50"
      },
      {
        "id": "37",
        "label": "06:50 - 07:10"
      },
      {
        "id": "38",
        "label": "07:10 - 07:30"
      },
      {
        "id": "39",
        "label": "07:30 - 07:50"
      },
      {
        "id": "40",
        "label": "07:50 - 08:10"
      },
      {
        "id": "41",
        "label": "08:10 - 08:30"
      },
      {
        "id": "42",
        "label": "08:30 - 08:50"
      },
      {
        "id": "43",
        "label": "08:50 - 09:10"
      }
    ]
  },
  "dpl.cognix-systems.com": {
    "islands": {
      "7": {
        "label": "S3",
        "id": "7"
      },
      "8": {
        "label": "S4",
        "id": "8"
      },
      "9": {
        "label": "S5",
        "id": "9"
      },
      "10": {
        "label": "S6",
        "id": "10"
      },
      "11": {
        "label": "S7",
        "id": "11"
      }
    },
    "timeslots": [
      {
        "id": "30",
        "label": "04:20 - 04:40"
      },
      {
        "id": "31",
        "label": "04:40 - 05:00"
      },
      {
        "id": "32",
        "label": "05:00 - 05:20"
      },
      {
        "id": "33",
        "label": "05:20 - 05:40"
      },
      {
        "id": "34",
        "label": "05:40 - 06:00"
      },
      {
        "id": "35",
        "label": "06:00 - 06:20"
      },
      {
        "id": "36",
        "label": "06:20 - 06:40"
      },
      {
        "id": "37",
        "label": "06:40 - 07:00"
      },
      {
        "id": "38",
        "label": "07:00 - 07:20"
      },
      {
        "id": "39",
        "label": "07:20 - 07:40"
      },
      {
        "id": "40",
        "label": "07:40 - 08:00"
      },
      {
        "id": "41",
        "label": "08:00 - 08:20"
      },
      {
        "id": "42",
        "label": "08:20 - 08:40"
      },
      {
        "id": "43",
        "label": "08:40 - 09:00"
      }
    ],
    "dos": {
      "2295": "SCAPED",
      "2296": "SIPLEC",
      "2299": "CARFUEL",
      "2301": "BOLLORE",
      "2303": "UDP"
    }
  }
};

const domain = window.location.hostname;
const server_url = window.location.protocol + "//" + domain;
const current_do = globalBody['selectedUserId'];

function urlencoding(data) {
    return url = Object.keys(data).map(function(k) { return encodeURIComponent(k) + '=' + encodeURIComponent(data[k]) }).join('&');
}

function create_labeled_input(type, name, value, label) {
    return "<label>" + label + ": <input type=" + type + " name=" + name + " value=" + value + "></label>&nbsp&nbsp&nbsp";
}

function display_console() {
    let console = "<div id='console'>";
    console += create_labeled_input("text", "script_chauffeur", "Jean-Marc", "Nom du chauffeur");
    console += "<br><div id='checkboxs-timeslots'>";
    console += create_labeled_input("checkbox", "activate_script", "activate_script", "Activation");
    console += "<br><br>";
    /* checkboxs timeslots */
    let timeslots = infos[domain]['timeslots'];
    $.each(timeslots, function(index, timeSlot) {
        console += create_labeled_input("checkbox", "script_timeslot", timeSlot.id, timeSlot.label);
    });
    console += "</div><br>";
    /* checkboxs islands */
    console += "<div id='checkboxs-islands'>";
    let islands = infos[domain]['islands'];
    $.each(islands, function(index, island) {
        console += create_labeled_input("checkbox", "script_island", island.id, island.label);
    });
    console += "</div></div>"
    $("main.agenda").prepend(console);
}

function check_if_script_is_enabled() {
    let interval = 0;
    $("input:checkbox[name='activate_script']").change(function() {
        if ($(this).is(":checked")) {
            interval = setInterval(function() {
                console.clear();
                $.ajax({
                    type: "POST",
                    url: server_url + "/ajax-time-slot/display",
                    data: globalBody,
                    success: function(resp) {
                        if(resp.error) {
                            console.log(new Date().toLocaleTimeString(), ": booking seems to be closed... [error in response]");
                            return;
                        }
                        if (resp['quota'] !== undefined && resp['quota']['slot'][0]['value'] === 0) {
                            console.log(new Date().toLocaleTimeString(), ": booking seems to be closed... [0 quota]");
                            return;
                        }
                        else {
                           reserve_slots();
                       }
                    }
                });
            }, 500);
        } else {
            clearInterval(interval);
        }
    });
};

function reserve_slots() {
    console.clear();

    let islands = $.map($("input:checkbox[name='script_island']:checked"), function(c) {
        return c.value;
    });
    if (islands.length === 0) return;

    let timeslots = $.map($("input:checkbox[name='script_timeslot']:checked"), function(c) {
        return c.value;
    });
    if (timeslots.length === 0) return;

    console.log("essai de réservation d'horaires pour le DO:",infos[domain]['dos'][current_do]);
    $.each(islands, function(index_island, island_id) {
        $.each(timeslots, function(index_timeslot, timeslot_id) {
            check_if_timeslot_available(island_id, timeslot_id);
        });
    });
}

function check_if_timeslot_available(island_id, timeslot_id) {
    $.ajax({
        type: "POST",
        url: server_url + "/ajax-time-slot/display",
        data: globalBody,
        success: function(resp) {
            if(resp.error)
                return;
            if (resp['quota'] !== undefined)
                if(resp['quota']['slot'][0]['value'] === 0)
                    return;
            let timeslot = resp.island[island_id]['slot'][timeslot_id];
            if (timeslot !== undefined) {
                if (timeslot.status !== "available") {
                    return;
                }
            }
            ajax_prebook_timeslot(island_id, timeslot_id);
        },
        error: function(resp, status, error) {
            console.clear();
            console.log(resp, status, error);
            console.log("error contacting server...");
            return;
        }
    });
}

function ajax_prebook_timeslot(island_id, timeslot_id) {
    let form = globalBody;
    form.islandId = island_id;
    form.timeSlotId = timeslot_id;
    form.quantity = 0;
    form.bookingId = 0;
    form.registration = "1234"; // immatriculation
    form.truckDriverName = $("input:text[name='script_chauffeur']").val() || "Jean-Marc"; // nom du chauffeur
    form.authorizationNumber = "1234";
    $.ajax({
        type: "POST",
        url: server_url + "/ajax-booking/display",
        data: urlencoding(form),
        success: function(resp) {
            if(resp['id'] != false) {
                form.bookingId = resp['id'];
                ajax_book_timeslot(form);
            }
        },
        error: function(resp, status, error) {
            console.log(resp, status, error);
            console.log("pre-reservation failed, canceling...")
        }
    });
}

function ajax_book_timeslot(form) {
    $.ajax({
        type: "POST",
        url: server_url + "/ajax-booking/edit",
        data: urlencoding(form),
        success: function(resp) {
            console.log(resp);
            console.log("slot est réservé");
        },
        error: function(resp, status, error) {
            console.log(resp, status, error);
            console.log("pre-reservation failed, canceling...")
            ajax_cancel_book_timeslot(form);
        }
    });
}

function ajax_cancel_book_timeslot(form) {
    $.ajax({
        type: "POST",
        url: server_url + "/ajax-booking/close",
        data: urlencoding(form)
    });
}

display_console();
check_if_script_is_enabled();
console.clear();
// $.getScript("http://clients.infologs.fr/cognixsystems.js");
