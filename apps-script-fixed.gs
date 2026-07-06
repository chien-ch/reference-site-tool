const SPREADSHEET_ID = "1DMPsNpG25juvIqLPIBis98w5ryrJMd2I_OyNCOGHOpM";

const SHEETS = {
  sites: "\u53c3\u8003\u7ad9",
  pending: "\u5f85\u5206\u985e",
  categories: "\u5206\u985e",
  zones: "\u5c08\u5340",
  paidSites: "\u4ed8\u8cbb\u5c08\u5340",
  accounts: "\u5e33\u865f",
  userData: "\u4f7f\u7528\u8005\u8cc7\u6599"
};

const HEADERS = {
  site: {
    id: "id",
    name: "\u7db2\u7ad9\u540d\u7a31",
    domain: "\u57df\u540d",
    url: "\u7db2\u5740",
    categoryId: "\u5206\u985eID",
    categoryName: "\u5206\u985e\u540d\u7a31",
    status: "\u6aa2\u67e5\u72c0\u614b",
    saved: "\u5df2\u6536\u85cf",
    addedAt: "\u5efa\u7acb\u6642\u9593"
  },
  category: {
    id: "\u5206\u985eID",
    name: "\u5206\u985e\u540d\u7a31",
    parentId: "\u7236\u5206\u985eID",
    parentName: "\u7236\u5206\u985e\u540d\u7a31",
    fullName: "\u5b8c\u6574\u5206\u985e\u540d\u7a31",
    depth: "\u5c64\u7d1a"
  },
  account: {
    username: "\u5e33\u865f",
    password: "\u5bc6\u78bc",
    role: "\u89d2\u8272"
  },
  userData: {
    username: "\u5e33\u865f",
    json: "\u8cc7\u6599JSON",
    updatedAt: "\u66f4\u65b0\u6642\u9593"
  },
  zone: {
    id: "\u5c08\u5340ID",
    name: "\u5c08\u5340\u540d\u7a31",
    items: "\u9805\u76eeJSON"
  },
  paid: {
    featureName: "\u529f\u80fd\u540d\u7a31",
    note: "\u529f\u80fd\u8aaa\u660e",
    attachmentName: "\u9644\u4ef6\u540d\u7a31",
    attachmentType: "\u9644\u4ef6\u985e\u578b",
    attachmentUrl: "\u9644\u4ef6\u9023\u7d50"
  }
};

function doGet(e) {
  const action = e.parameter.action;
  let data;

  if (action === "login") {
    data = loginUser(e.parameter.username, e.parameter.password);
  } else {
    data = getAllData();
  }

  return jsonResponse(data, e.parameter.callback);
}

function doPost(e) {
  try {
    const body = parseRequestBody(e);
    const action = body.action;

    if (action === "saveSites") {
      saveSites(body.sites || []);
      return jsonResponse({ success: true });
    }

    if (action === "savePending") {
      savePending(body.pending || []);
      return jsonResponse({ success: true });
    }

    if (action === "saveCategories") {
      saveCategories(body.categories || []);
      return jsonResponse({ success: true });
    }

    if (action === "saveZones") {
      saveZones(body.zones || []);
      return jsonResponse({ success: true });
    }

    if (action === "savePaidSites") {
      savePaidSites(body.paidSites || []);
      return jsonResponse({ success: true });
    }

    if (action === "login") {
      return jsonResponse(loginUser(body.username, body.password));
    }

    if (action === "saveUserData") {
      saveUserData(body.username, body.data || {});
      return jsonResponse({ success: true });
    }

    return jsonResponse({ success: false, message: "Unknown action: " + action });
  } catch (error) {
    return jsonResponse({ success: false, message: String(error && error.message ? error.message : error) });
  }
}

function parseRequestBody(e) {
  const text = String((e.postData && e.postData.contents) || "").trim();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/^payload=(.*)$/s);
    if (match) {
      return JSON.parse(match[1].trim());
    }
    throw error;
  }
}

function getAllData() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  return {
    sites: readSheet(ss, SHEETS.sites),
    pending: readSheet(ss, SHEETS.pending),
    categories: readSheet(ss, SHEETS.categories),
    zones: readSheet(ss, SHEETS.zones),
    paidSites: readSheet(ss, SHEETS.paidSites)
  };
}

function readSheet(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() === 0) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values.shift();

  return values
    .filter(row => row.some(cell => cell !== ""))
    .map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item;
    });
}

function saveSites(sites) {
  writeSitesSheet(SHEETS.sites, sites);
}

function savePending(pending) {
  writeSitesSheet(SHEETS.pending, pending);
}

function writeSitesSheet(sheetName, sites) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
  const headers = [
    HEADERS.site.id,
    HEADERS.site.name,
    HEADERS.site.domain,
    HEADERS.site.url,
    HEADERS.site.categoryId,
    HEADERS.site.categoryName,
    HEADERS.site.status,
    HEADERS.site.saved,
    HEADERS.site.addedAt
  ];

  const rows = sites.map(site => [
    site.id || "",
    site.name || "",
    site.domain || "",
    site.url || "",
    site.categoryId || "",
    site.categoryName || "",
    site.status || "",
    site.saved ? "\u662f" : "\u5426",
    site.addedAt || ""
  ]);

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function saveCategories(categories) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.categories) || ss.insertSheet(SHEETS.categories);
  const headers = [
    HEADERS.category.id,
    HEADERS.category.name,
    HEADERS.category.parentId,
    HEADERS.category.parentName,
    HEADERS.category.fullName,
    HEADERS.category.depth
  ];
  const rows = [];

  categories.forEach(cat => {
    rows.push([cat.id || "", cat.name || "", "", "", cat.name || "", 0]);

    (cat.children || []).forEach(child => {
      rows.push([
        child.id || "",
        child.name || "",
        cat.id || "",
        cat.name || "",
        `${cat.name}\uff08${child.name}\uff09`,
        1
      ]);
    });
  });

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function saveZones(zones) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.zones) || ss.insertSheet(SHEETS.zones);
  const headers = [HEADERS.zone.id, HEADERS.zone.name, HEADERS.zone.items];
  const rows = zones.map(zone => [
    zone.id || "",
    zone.name || "",
    JSON.stringify(zone.items || [])
  ]);

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function savePaidSites(paidSites) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.paidSites) || ss.insertSheet(SHEETS.paidSites);
  const headers = [
    HEADERS.site.id,
    HEADERS.paid.featureName,
    HEADERS.site.name,
    HEADERS.site.domain,
    HEADERS.site.url,
    HEADERS.paid.note,
    HEADERS.paid.attachmentName,
    HEADERS.paid.attachmentType,
    HEADERS.paid.attachmentUrl,
    HEADERS.site.addedAt
  ];
  const rows = paidSites.map(site => {
    const attachment = savePaidAttachment(site);
    return [
      site.id || "",
      site.featureName || site.note || "",
      site.name || "",
      site.domain || "",
      site.url || "",
      site.note || "",
      attachment.name || "",
      attachment.type || "",
      attachment.url || "",
      site.addedAt || ""
    ];
  });

  sheet.clearContents();
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  if (rows.length) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }
}

function savePaidAttachment(site) {
  const existing = {
    name: site.attachmentName || "",
    type: site.attachmentType || "",
    url: site.attachmentUrl || ""
  };

  if (!site.attachmentData) return existing;

  const match = String(site.attachmentData).match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return existing;

  const mimeType = match[1] || site.attachmentType || "application/octet-stream";
  const bytes = Utilities.base64Decode(match[2]);
  const safeName = sanitizeFileName(site.attachmentName || site.name || "paid-tool-attachment");
  const blob = Utilities.newBlob(bytes, mimeType, safeName);
  const folder = getPaidAttachmentFolder();
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  return {
    name: safeName,
    type: mimeType,
    url: file.getUrl()
  };
}

function getPaidAttachmentFolder() {
  const folderName = "\u53c3\u8003\u7ad9\u4ed8\u8cbb\u5c08\u5340\u9644\u4ef6";
  const folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return DriveApp.createFolder(folderName);
}

function sanitizeFileName(name) {
  return String(name || "attachment")
    .replace(/[\\/:*?"<>|]/g, "-")
    .slice(0, 120);
}

function loginUser(username, password) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.accounts);
  if (!sheet) return { success: false, message: "Missing account sheet" };

  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  const userIndex = headers.indexOf(HEADERS.account.username);
  const passIndex = headers.indexOf(HEADERS.account.password);
  const roleIndex = headers.indexOf(HEADERS.account.role);

  if (userIndex < 0 || passIndex < 0 || roleIndex < 0) {
    return { success: false, message: "Account sheet needs columns: account, password, role" };
  }

  const row = rows.find(r => String(r[userIndex]) === String(username));
  if (!row || String(row[passIndex]) !== String(password)) {
    return { success: false, message: "Invalid username or password" };
  }

  return {
    success: true,
    username,
    role: row[roleIndex] || "\u4f7f\u7528\u8005",
    data: getUserData(username)
  };
}

function getUserData(username) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.userData);
  if (!sheet || sheet.getLastRow() === 0) return null;

  const rows = sheet.getDataRange().getValues();
  const headers = rows.shift();
  const userIndex = headers.indexOf(HEADERS.userData.username);
  const dataIndex = headers.indexOf(HEADERS.userData.json);

  if (userIndex < 0 || dataIndex < 0) return null;

  const row = rows.find(r => String(r[userIndex]) === String(username));
  if (!row || !row[dataIndex]) return null;

  return JSON.parse(row[dataIndex]);
}

function saveUserData(username, data) {
  if (!username) throw new Error("Missing username");

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(SHEETS.userData) || ss.insertSheet(SHEETS.userData);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([HEADERS.userData.username, HEADERS.userData.json, HEADERS.userData.updatedAt]);
  }

  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const userIndex = headers.indexOf(HEADERS.userData.username);
  let targetRow = -1;

  for (let i = 1; i < rows.length; i += 1) {
    if (String(rows[i][userIndex]) === String(username)) {
      targetRow = i + 1;
      break;
    }
  }

  const values = [username, JSON.stringify(data), new Date()];

  if (targetRow > 0) {
    sheet.getRange(targetRow, 1, 1, values.length).setValues([values]);
  } else {
    sheet.appendRow(values);
  }
}

function jsonResponse(data, callback) {
  const json = JSON.stringify(data);
  if (callback) {
    return ContentService
      .createTextOutput(`${callback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}
