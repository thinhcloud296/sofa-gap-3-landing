// =============================================
// GOOGLE APPS SCRIPT - Paste vào Apps Script Editor
// =============================================

// Cấu hình tên sheet
var SHEET_DONHANG = 'DonHang';
var SHEET_LIENHE = 'LienHe';

// Hàm xử lý POST request
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var result;
    
    if (data.type === 'order') {
      result = saveOrder(ss, data);
    } else if (data.type === 'contact') {
      result = saveContact(ss, data);
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
    sheet.appendRow(['Thời gian', 'Họ tên', 'SĐT', 'Địa chỉ', 'Sản phẩm', 'Màu sắc', 'Kích thước', 'Số chân', 'Tổng tiền']);
  }
  
  // Format thông tin từ items
  var products = [];
  var colors = [];
  var sizes = [];
  var legs = [];
  
  data.items.forEach(function(item) {
    products.push(item.name);
    colors.push(item.color || '');
    sizes.push(item.size || '');
    legs.push(item.legs ? item.legs + ' chân' : '');
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
    data.total.toLocaleString('vi-VN') + 'đ'
  ]);
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
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'API is working!'
  })).setMimeType(ContentService.MimeType.JSON);
}
