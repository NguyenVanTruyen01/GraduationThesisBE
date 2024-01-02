export const TOPICS_CONSTANTS = {
    TEACHER_STATUS: {
        PENDING: "PENDING", // Đang chờ giảng viên phê duyệt
        READY: "READY",     // Sẵn sàng đăng ký
        REGISTERED: "REGISTERED",  // Đã đăng ký
        CANCELED: "CANCELED",     // Đã hủy
        COMPLETED: "COMPLETED" // Đã hoàn thành
    },

    LEADER_STATUS: {
        READY: "READY",
        PENDING: "PENDING", // Đang chờ trưởng ngành phê duyệt
        CANCELED: "CANCELED",      // Đã hủy
        ACTIVE: "ACTIVE", // Đang thực hiện
        COMPLETED: "COMPLETED" // Đã hoàn thành
    },

    ERROR: {
        EXISTED: "REGISTRATION_PERIOD_EXISTED",
        CREATED_FAIL: "CREATED_FAIL",
        NOT_FOUND: "NOT_FOUND",
        UPDATE_FAIL: "UPDATE_FAIL",
        DELETE_FAIL: "DELETE_FAIL",
        ACTION_FORBIDDEN: "ACTION_FORBIDDEN",
        REGISTERED_FAIL: "REGISTERED_FAIL",
        NO_REGISTERED_TOPICS: "NO_REGISTERED_TOPICS", // Chưa đăng ký đề tài nào
        STUDENT_ALREADY_REGISTERED: "STUDENT_ALREADY_REGISTERED", // Sih viên đã đang ký đề tài,
        SERVER_ERROR: "SERVER_ERROR", // Lỗi hệ thống
        BAD_REQUEST: "BAD_REQUEST",
        GROUP_STUDENT_DUPLICATE_ID: "GROUP_STUDENT_DUPLICATE_ID",// Groupstudent có id bị trùng,
        MISSING_DATA: "MISSING_DATA" // input không hợp lệ
    }
};