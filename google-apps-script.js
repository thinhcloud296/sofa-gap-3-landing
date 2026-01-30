// =============================================
// GOOGLE APPS SCRIPT - Paste vào Apps Script Editor
// =============================================

// Cấu hình tên sheet
var SHEET_DONHANG = 'DonHang';
var SHEET_LIENHE = 'LienHe';

// =============================================
// META CONVERSION API CONFIGURATION
// =============================================
var META_PIXEL_ID = '1652122502829731';
var META_ACCESS_TOKEN = 'EAARpTsjUBtgBQkfgQ2eFn9ENeTCrM2LBumPyqIZAJZAabSvA8ZBkaAbZAxt4OjxDwg5I3hu20Ad07nGZBdO8t6MoP9iAvsLYZAH2tGP6ZByYvzBUoslunQJn4ucFhoViPlbBKoZCgvXHfZASFUZAayLgbh1ysWHKteyfGVOWUoj4TfJJbYqYku2FZCNf6eGfiOAvgZDZD';
var META_API_VERSION = 'v18.0';

// Hàm xử lý POST request
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (data.type === 'order') {
      saveOrder(ss, data);
      // Gửi Purchase event đến Meta Conversion API
      sendToConversionAPI('Purchase', data, e);
    } else if (data.type === 'contact') {
      saveContact(ss, data);
      // Gửi Lead event đến Meta Conversion API
      sendToConversionAPI('Lead', data, e);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Invalid type'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Lưu đơn hàng
function saveOrder(ss, data) {
  var sheet = ss.getSheetByName(SHEET_DONHANG);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_DONHANG);
    sheet.appendRow(['Thời gian', 'Họ tên', 'SĐT', 'Địa chỉ', 'Sản phẩm', 'Màu sắc', 'Kích thước', 'Số chân', 'Số lượng', 'Đơn giá', 'Tổng tiền']);
  }
  
  // Format thông tin từ items
  var products = [];
  var colors = [];
  var sizes = [];
  var legs = [];
  var quantities = [];
  var unitPrices = [];
  
  data.items.forEach(function(item) {
    products.push(item.name || '');
    colors.push(item.color || '');
    sizes.push(item.size || '');
    legs.push(item.legs || '');
    quantities.push(item.quantity || 1);
    unitPrices.push(formatCurrency(item.unitPrice));
  });
  
  sheet.appendRow([
    new Date().toLocaleString('vi-VN'),
    data.name,
    data.phone,
    data.address,
    products.join('\n'),
    colors.join('\n'),
    sizes.join('\n'),
    legs.join('\n'),
    quantities.join('\n'),
    unitPrices.join('\n'),
    formatCurrency(data.total)
  ]);
}

// Format tiền VND
function formatCurrency(amount) {
  if (!amount) return '';
  return Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

// Lưu liên hệ
function saveContact(ss, data) {
  var sheet = ss.getSheetByName(SHEET_LIENHE);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_LIENHE);
    sheet.appendRow(['Thời gian', 'Họ tên', 'SĐT', 'Địa chỉ']);
  }
  
  sheet.appendRow([
    new Date().toLocaleString('vi-VN'),
    data.name,
    data.phone,
    data.address
  ]);
}

// Test function
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'API is working!'
  })).setMimeType(ContentService.MimeType.JSON);
}

// =============================================
// META CONVERSION API FUNCTIONS
// =============================================

// Hash SHA-256 cho dữ liệu người dùng
function hashSHA256(input) {
  if (!input) return '';
  var normalized = input.toString().toLowerCase().trim();
  var hash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, normalized);
  return hash.map(function(byte) {
    var hex = (byte < 0 ? byte + 256 : byte).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
}

// Chuẩn hóa số điện thoại Việt Nam
function normalizePhone(phone) {
  if (!phone) return '';
  var cleaned = phone.replace(/[\s\-\.\(\)]/g, '');
  // Thêm mã quốc gia 84 nếu bắt đầu bằng 0
  if (cleaned.startsWith('0')) {
    cleaned = '84' + cleaned.substring(1);
  }
  // Nếu không có mã quốc gia, thêm 84
  if (!cleaned.startsWith('84') && !cleaned.startsWith('+84')) {
    cleaned = '84' + cleaned;
  }
  return cleaned.replace('+', '');
}

// Gửi sự kiện đến Meta Conversion API
function sendToConversionAPI(eventName, data, requestEvent) {
  try {
    var eventTime = Math.floor(Date.now() / 1000);
    var eventId = 'evt_' + eventTime + '_' + Math.random().toString(36).substr(2, 9);
    
    // Lấy thông tin từ request nếu có
    var clientIp = '';
    var userAgent = '';
    var sourceUrl = data.sourceUrl || 'https://casarosofa.id.vn';
    
    // Chuẩn bị user_data với hash
    var userData = {
      client_user_agent: data.userAgent || userAgent
    };
    
    // Hash số điện thoại
    if (data.phone) {
      userData.ph = hashSHA256(normalizePhone(data.phone));
    }
    
    // Hash tên (first name)
    if (data.name) {
      userData.fn = hashSHA256(data.name);
    }
    
    // Hash thành phố từ địa chỉ
    if (data.address) {
      userData.ct = hashSHA256(data.address);
    }
    
    // Country luôn là Vietnam
    userData.country = hashSHA256('vn');
    
    // Thêm fbc và fbp nếu có
    if (data.fbc) {
      userData.fbc = data.fbc;
    }
    if (data.fbp) {
      userData.fbp = data.fbp;
    }
    
    // Chuẩn bị custom_data
    var customData = {
      currency: 'VND'
    };
    
    if (eventName === 'Purchase') {
      customData.value = data.total || 0;
      customData.content_name = 'Sofa Gấp Gọn CASARO';
      customData.content_type = 'product';
      if (data.items && data.items.length > 0) {
        customData.content_ids = data.items.map(function(item) { return item.name; });
        customData.num_items = data.items.reduce(function(sum, item) { return sum + (item.quantity || 1); }, 0);
      }
    } else if (eventName === 'Lead') {
      customData.value = 0;
      customData.content_name = 'Contact Form';
      customData.lead_source = 'website';
    }
    
    // Tạo payload
    var payload = {
      data: [{
        event_name: eventName,
        event_time: eventTime,
        event_id: eventId,
        event_source_url: sourceUrl,
        action_source: 'website',
        user_data: userData,
        custom_data: customData
      }]
    };
    
    // Gửi request đến Meta API
    var apiUrl = 'https://graph.facebook.com/' + META_API_VERSION + '/' + META_PIXEL_ID + '/events?access_token=' + META_ACCESS_TOKEN;
    
    var options = {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(apiUrl, options);
    var result = JSON.parse(response.getContentText());
    
    // Log kết quả
    console.log('Meta Conversion API - ' + eventName + ':', JSON.stringify(result));
    
    return result;
    
  } catch (error) {
    console.error('Meta Conversion API Error:', error.toString());
    return { error: error.toString() };
  }
}

// Test Conversion API
function testConversionAPI() {
  var testData = {
    type: 'contact',
    name: 'Test User',
    phone: '0901234567',
    address: 'Hà Nội',
    sourceUrl: 'https://casarosofa.id.vn'
  };
  
  var result = sendToConversionAPI('Lead', testData, null);
  console.log('Test Result:', JSON.stringify(result));
  return result;
}