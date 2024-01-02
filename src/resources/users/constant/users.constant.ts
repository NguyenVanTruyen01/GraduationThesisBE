export const USER_CONSTANTS = {
    ROLE: {
        LEADER: "LEADER", // Trưởng ngành
        TEACHER: "TEACHER",     // Giảng viên
        STUDENT: "STUDENT",  // Sinh viên
    },

    ACCOUNT_STATUS: {
        ACTIVE: true, // Hoạt dộng
        BLOCK: false // Khóa
    },

    ERROR: {
        EXISTED: "EXISTED",
        NOT_FOUND: "NOT_FOUND",
        INCORRECT_PASSWORD: "INCORRECT_PASSWORD",
        UPDATE_FAIL: "UPDATE_FAIL",
        ACTION_FORBIDDEN: "ACTION_FORBIDDEN",
        DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
        DUPLICATE_USERID: "DUPLICATE_USERID",
        DUPLICATE_CCCD: "DUPLICATE_CCCD",
        EXCEL_FAIL: "EXCEL_FAIL"
    }
};