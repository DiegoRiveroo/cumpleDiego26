const SPREADSHEET_ID = "PEGA_AQUI_EL_ID_DE_TU_GOOGLE_SHEET";
const RSVP_SHEET = "RSVP_Diego";
const MEMORY_SHEET = "Recuerdos_Diego";
const MAX_CAPACITY = 33;

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    if (data.type === "rsvp_diego") {
      return handleRsvp(ss, data);
    }

    if (data.type === "memory_diego") {
      return handleMemory(ss, data);
    }

    return jsonResponse({ ok: false, message: "Tipo de formulario no reconocido." });
  } catch (error) {
    return jsonResponse({ ok: false, message: "Error al procesar la solicitud." });
  }
}

function handleRsvp(ss, data) {
  const sheet = getOrCreateSheet(ss, RSVP_SHEET, [
    "Timestamp",
    "Nombre DNI",
    "DNI",
    "Teléfono",
    "Asistencia",
    "Restricción alimentaria / Comentario",
    "Estado"
  ]);

  const attendance = String(data.attendance || "").trim();

  if (attendance === "Sí" && getConfirmedCount(sheet) >= MAX_CAPACITY) {
    sheet.appendRow([
      new Date(),
      data.dniName || "",
      data.dni || "",
      data.phone || "",
      attendance,
      data.foodRestriction || "",
      "Sin cupo"
    ]);

    return jsonResponse({
      ok: false,
      message: "Gracias por querer acompañarme. En este momento los lugares disponibles ya se encuentran completos y no puedo recibir más confirmaciones. Espero que podamos encontrarnos y celebrar en otra ocasión."
    });
  }

  sheet.appendRow([
    new Date(),
    data.dniName || "",
    data.dni || "",
    data.phone || "",
    attendance,
    data.foodRestriction || "",
    attendance === "Sí" ? "Confirmado" : "Registrado"
  ]);

  if (attendance === "Sí") {
    return jsonResponse({ ok: true, message: "¡Listo! Tu lugar ha sido reservado. Nos vemos el sábado 4 de julio." });
  }

  return jsonResponse({ ok: true, message: "Gracias por responder. Tu registro fue guardado." });
}

function handleMemory(ss, data) {
  const sheet = getOrCreateSheet(ss, MEMORY_SHEET, [
    "Timestamp",
    "Nombre",
    "Mensaje"
  ]);

  sheet.appendRow([
    new Date(),
    data.name || "",
    data.message || ""
  ]);

  return jsonResponse({ ok: true, message: "Gracias. Tu mensaje fue guardado." });
}

function getConfirmedCount(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;

  const values = sheet.getRange(2, 5, lastRow - 1, 3).getValues();

  return values.filter(row => {
    const attendance = row[0];
    const status = row[2];
    return attendance === "Sí" && status === "Confirmado";
  }).length;
}

function getOrCreateSheet(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headers);
    return sheet;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function jsonResponse(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
