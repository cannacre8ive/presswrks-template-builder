/** PRESSWRK private intake adapter. Configure Script Properties; see SETUP.md. */
function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    var props = PropertiesService.getScriptProperties(), secret = props.getProperty('INTAKE_SECRET');
    if (!secret || !e.postData || e.postData.contents.length > 4500000) throw Error('Unavailable');
    var envelope = JSON.parse(e.postData.contents);
    if (typeof envelope.payload !== 'string' || Math.abs(Date.now() - envelope.timestamp) > 120000) throw Error('Expired');
    var expected = hex_(Utilities.computeHmacSha256Signature(envelope.timestamp + '\n' + envelope.payload, secret));
    if (!equal_(expected, envelope.signature)) throw Error('Unauthorized');
    var input = JSON.parse(envelope.payload), p = input.packet;
    if (!p || !/^[a-f0-9-]{36}$/i.test(p.submissionId) || !/^[a-f0-9]{64}$/.test(input.rateKey)) throw Error('Invalid reference');
    var data = Utilities.base64Decode(input.file);
    if (!data.length || data.length > 3145728 || hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, data)) !== p.artwork.file.sha256) throw Error('Invalid artwork');
    if (!lock.tryLock(20000)) throw Error('Busy');
    var root = DriveApp.getFolderById(props.getProperty('HOME_FOLDER_ID'));
    if (root.getSharingAccess() !== DriveApp.Access.PRIVATE) throw Error('Intake home must be private');
    var home = folder_(root, 'Website Intake'), clientKey = hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, (p.project.business.trim().toLowerCase() + '\n' + p.project.email.trim().toLowerCase()))).slice(0,12);
    var clientName=safe_(p.project.business) + ' — ' + clientKey, projectName='PW-' + p.submissionId + ' — ' + safe_(p.project.project);
    var clients=home.getFoldersByName(clientName),client=clients.hasNext()?clients.next():null;
    var projects=client?client.getFoldersByName(projectName):null,project=projects&&projects.hasNext()?projects.next():null;
    // Fingerprint excludes timestamps; retries are idempotent. Changed details need a new ID.
    var fingerprint = hex_(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, JSON.stringify({project:p.project,file:p.artwork.file.sha256,target:p.artwork.target})));
    var markers = project?project.getFilesByName('receipt.json'):null;
    if (markers && markers.hasNext()) {var receipt = JSON.parse(markers.next().getBlob().getDataAsString());if(receipt.fingerprint !== fingerprint)throw Error('Changed submission');return json_({ok:true,reference:p.submissionId});}
    var cache = CacheService.getScriptCache(), rateKey = 'rate:' + input.rateKey, count = Number(cache.get(rateKey) || 0);
    var day = Utilities.formatDate(new Date(), 'UTC', 'yyyy-MM-dd'), daily = Number(props.getProperty('DAILY_' + day) || 0);
    if (count >= 5 || daily >= Number(props.getProperty('DAILY_LIMIT') || 30)) throw Error('Intake limit reached');
    cache.put(rateKey, String(count + 1), 3600);props.setProperty('DAILY_' + day, String(daily + 1));
    client=client||folder_(home,clientName);project=project||folder_(client,projectName);
    var pending=project.getFilesByName('request-fingerprint.txt');if(pending.hasNext()&&pending.next().getBlob().getDataAsString()!==fingerprint)throw Error('Changed submission');put_(project,'request-fingerprint.txt',fingerprint,'text/plain');
    var artwork = folder_(project, '01 Artwork'), brief = folder_(project, '02 Project Brief'), estimate = folder_(project, '03 Estimate');
    var mime = p.artwork.file.type === 'PDF' ? 'application/pdf' : p.artwork.file.type === 'JPEG' ? 'image/jpeg' : 'image/png';
    if (!artwork.getFilesByName(safe_(p.artwork.file.name)).hasNext()) artwork.createFile(Utilities.newBlob(data, mime, safe_(p.artwork.file.name)));
    put_(brief, 'project.json', JSON.stringify(p, null, 2), 'application/json');
    put_(brief, 'READ ME.txt', 'PRESSWRK PROJECT INTAKE\nReference: ' + p.submissionId + '\nClient: ' + p.project.business + '\nContact: ' + p.project.name + ' <' + p.project.email + '>\nProject: ' + p.project.project + '\nQuantity: ' + p.project.quantity + '\nVersions: ' + p.project.versions + '\nMaterial: ' + p.project.material + '\nFinish: ' + p.project.finish + '\nRequested date: ' + p.project.deadline + '\nArtwork help requested: ' + p.project.artworkHelp + '\nScope: ' + p.project.notes + '\n\nSTATUS: Received. Estimate pending. Proof NOT approved. Production HOLD.\nClient-side checks are unverified; prepress review is required.\n\n' + p.artwork.checks.map(function(c){return c.status.toUpperCase() + ' — ' + c.label + '\n' + c.detail + '\n' + c.action;}).join('\n\n'), 'text/plain');
    put_(estimate, 'cost-inputs.json', JSON.stringify({inputs:p.estimateInputs,material:p.project.material,finish:p.project.finish,costDashboard:'https://docs.google.com/spreadsheets/d/' + props.getProperty('COST_WORKBOOK_ID') + '/edit',status:'Pending operator costing; no price quoted',missing:['layout and waste','material SKU and current rate','ink coverage','setup and production time','finishing','delivery','tax and margin']}, null, 2), 'application/json');
    var book = SpreadsheetApp.openById(props.getProperty('JOB_WORKBOOK_ID')), sheet = book.getSheetByName('Website Intake') || book.insertSheet('Website Intake');
    if (!sheet.getLastRow()) sheet.appendRow(['Submission ID','Received','Client','Contact','Email','Project','Quantity','Versions','Artwork status','Estimate status','Proof','Production gate','Project folder']);
    var seen = sheet.getLastRow()>1 ? sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(p.submissionId).matchEntireCell(true).findNext() : null;
    if (!seen) sheet.appendRow([p.submissionId,new Date(),literal_(p.project.business),literal_(p.project.name),literal_(p.project.email),literal_(p.project.project),p.project.quantity,p.project.versions,'Needs prepress review','Pending costing','Not approved','HOLD',project.getUrl()]);
    put_(project, 'receipt.json', JSON.stringify({reference:p.submissionId,fingerprint:fingerprint,receivedAt:new Date().toISOString()}), 'application/json');
    return json_({ok:true,reference:p.submissionId});
  } catch (error) {return json_({ok:false,error:'Submission not confirmed. Retry or contact PRESSWRK.'});}
  finally {if (lock.hasLock()) lock.releaseLock();}
}
function folder_(parent,name){var list=parent.getFoldersByName(name);return list.hasNext()?list.next():parent.createFolder(name);}
function put_(folder,name,body,mime){if(!folder.getFilesByName(name).hasNext())folder.createFile(name,body,mime);}
function safe_(value){return String(value).replace(/[\x00-\x1f/\\]/g,'_').slice(0,160);}
function literal_(value){var s=String(value);return /^[=+@\-\t\r]/.test(s)?"'"+s:s;}
function hex_(bytes){return bytes.map(function(b){return ('0'+(b&255).toString(16)).slice(-2);}).join('');}
function equal_(a,b){if(typeof b!=='string'||a.length!==b.length)return false;var d=0;for(var i=0;i<a.length;i++)d|=a.charCodeAt(i)^b.charCodeAt(i);return d===0;}
function json_(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
