// =============================================
// GOOGLE APPS SCRIPT - FULL VERSION (FINAL)
// =============================================

// Cấu hình tên sheet
var SHEET_DONHANG = 'DonHang';
var SHEET_LIENHE = 'LienHe';

// Hàm xử lý POST request (Chạy khi Web gửi dữ liệu sang)
function doPost(e) {
  // 1. Tạo khóa (Lock) để xếp hàng dữ liệu, tránh 2 người mua cùng lúc bị lỗi
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Đợi tối đa 10s
  } catch (e) {
    return createJSONOutput(false, 'Server busy, please try again.');
  }

  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (data.type === 'order') {
      saveOrder(ss, data);
    } else if (data.type === 'contact') {
      saveContact(ss, data);
    } else {
      return createJSONOutput(false, 'Invalid type');
    }

    return createJSONOutput(true, 'Data saved successfully');

  } catch (error) {
    return createJSONOutput(false, error.toString());
  } finally {
    // Giải phóng khóa để người sau còn mua hàng
    lock.releaseLock();
  }
}

// -----------------------------------------------------------
// HÀM LƯU ĐƠN HÀNG (Đã sửa logic Gối & Tính tiền)
// -----------------------------------------------------------
function saveOrder(ss, data) {
  var sheet = getOrCreateSheet(ss, SHEET_DONHANG, [
    'Thời gian', 'Họ tên', 'SĐT', 'Địa chỉ', 
    'Sản phẩm', 'Màu sắc', 'Kích thước', 'Số chân', 
    'Số lượng', 'Đơn giá', 'Tổng tiền'
  ]);

  var items = data.items || [];
  
  // Khởi tạo các mảng chứa dữ liệu cột
  var products = [];
  var colors = [];
  var sizes = [];
  var legs = [];
  var quantities = [];
  var unitPrices = [];
  
  // Biến cộng dồn tổng tiền (Tự tính để đảm bảo chính xác)
  var calculatedTotal = 0;

  items.forEach(function(item) {
    var name = item.name || '';
    
    // 1. Lấy số lượng và đơn giá chuẩn để tính toán
    var qty = Number(item.quantity) || 1;
    var price = Number(item.unitPrice) || 0;
    
    // Cộng vào tổng doanh thu
    calculatedTotal += (qty * price);

    // 2. Đẩy dữ liệu vào danh sách hiển thị
    products.push(name);
    colors.push(item.color || '-');
    quantities.push(qty);
    unitPrices.push(formatCurrency(price));

    // 3. LOGIC THÔNG MINH: Phân biệt Gối và Sofa
    var nameLowerCase = name.toLowerCase();
    
    // Nếu tên có chữ "gối" hoặc "pillow"
    if (nameLowerCase.includes('gối') || nameLowerCase.includes('pillow')) {
      // Ẩn kích thước và số chân (để trống cho đẹp)
      sizes.push(''); 
      legs.push('');  
    } else {
      // Nếu là Sofa (hoặc cái gì khác), lấy thông số bình thường
      sizes.push(item.size || '-');
      legs.push(item.legs || '-');
    }
  });

  // Ghi một dòng dữ liệu dài vào Sheet
  sheet.appendRow([
    getCurrentTime(),        // Giờ VN
    data.name,
    "'" + data.phone,        // Thêm ' để giữ số 0 đầu
    data.address,
    products.join('\n'),     // Xuống dòng trong 1 ô
    colors.join('\n'),
    sizes.join('\n'),
    legs.join('\n'),
    quantities.join('\n'),
    unitPrices.join('\n'),
    formatCurrency(calculatedTotal) // Dùng tổng tiền tự tính
  ]);
}

// -----------------------------------------------------------
// HÀM LƯU LIÊN HỆ
// -----------------------------------------------------------
function saveContact(ss, data) {
  var sheet = getOrCreateSheet(ss, SHEET_LIENHE, ['Thời gian', 'Họ tên', 'SĐT', 'Địa chỉ']);
  
  sheet.appendRow([
    getCurrentTime(),
    data.name,
    "'" + data.phone,
    data.address
  ]);
}

// -----------------------------------------------------------
// CÁC HÀM BỔ TRỢ (HELPER FUNCTIONS)
// -----------------------------------------------------------

// Kiểm tra và tạo Sheet nếu chưa có + Tạo Header đậm
function getOrCreateSheet(ss, sheetName, headerRow) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow(headerRow);
    sheet.getRange(1, 1, 1, headerRow.length).setFontWeight("bold");
    sheet.setFrozenRows(1); // Cố định dòng tiêu đề
  }
  return sheet;
}

// Lấy giờ Việt Nam (GMT+7)
function getCurrentTime() {
  return Utilities.formatDate(new Date(), "GMT+7", "dd/MM/yyyy HH:mm:ss");
}

// Trả về kết quả JSON cho Web
function createJSONOutput(success, message) {
  return ContentService.createTextOutput(JSON.stringify({
    success: success,
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

// Format số thành tiền tệ (VD: 500.000đ)
function formatCurrency(amount) {
  if (!amount && amount !== 0) return '';
  // Ép kiểu về số nguyên rồi format
  return Number(amount).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + 'đ';
}

// Hàm test để biết API còn sống hay không
function doGet() {
  return createJSONOutput(true, 'API is working correctly!');
}