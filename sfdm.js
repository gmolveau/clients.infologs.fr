function casesDisponibles(e) {
    return $("tbody tr:eq(" + e + ") td").hasClass("td_libre") | $("tbody tr:eq(" + e + ") td").hasClass("td_en_cours_a_moi")
}

function poster(e) {
    $("tbody tr:eq(" + e + ") .td_libre, tbody tr:eq(" + e + ") .td_en_cours_a_moi ").each(function() {
        var e = $(this).attr("id"),
            t = e.substr(e.length - 4),
            s = e.substr(0, 2),
            a = window.location.href;
        a = a.substr(a.length - 8).substr(0, 3), $.ajax({
            type: "POST",
            url: "https://www.sfdm.biz/includes/input_ajax.php?q=ajax&a=remplir_tableau",
            data: "form_grille_trans~2~" + s + "~" + a + "~" + t + "=46",
            success: function() {
                console.log("success trans")
            }
        }), $.ajax({
            type: "POST",
            url: "https://www.sfdm.biz/includes/input_ajax.php?q=ajax&a=remplir_tableau",
            data: "form_grille_cpdp~2~" + s + "~" + a + "~" + t + "=6563436",
            success: function() {
                console.log("success cpdp")
            }
        }), $.ajax({
            type: "POST",
            url: "https://www.sfdm.biz/includes/input_ajax.php?q=ajax&a=remplir_tableau",
            data: "form_grille_chauffeur~2~" + s + "~" + a + "~" + t + "=Jean-Louis",
            success: function() {
                console.log("success chauff")
            }
        })
    }), $("input:checkbox[value=" + e + "]").attr("checked", !1)
}
var i = 0;
for (i = 0; 36 > i; i++) {
    $("tbody tr:eq(" + i + ")").prepend('<INPUT type="checkbox" name="script" value="' + i + '">');
}
$("thead tr ").prepend("<th>    </th>"), $('input:checkbox[name="script"]').change(function() {
    if ($(this).is(":checked")) {
        var e = $(this).val();
        console.log("je check... " + e), interval = setInterval(function() {
            casesDisponibles(e) && (console.log("free entry"), poster(e), clearInterval(interval))
        }, 1e3)
    }
});