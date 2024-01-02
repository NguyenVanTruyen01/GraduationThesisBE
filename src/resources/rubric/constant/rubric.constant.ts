export const RUBRIC_CONSTANTS = {
    RUBRIC_CATEGORY: {
        INSTRUCTOR: 1, // Topic dành cho GVHD
        REVIEWER: 2,  // Topic dành cho GVPB
        ASSEMBLY: 3, // Topic dành cho Hội đồng phản biện
    },
    ERROR: {
        EXISTED: "REGISTRATION_PERIOD_EXISTED",
        CREATED_FAIL: "CREATED_FAIL",
        NOT_FOUND: "NOT_FOUND",
        UPDATE_FAIL: "UPDATE_FAIL",
        DELETE_FAIL: "DELETE_FAIL",
        ACTION_FORBIDDEN: "ACTION_FORBIDDEN",
        REGISTERED_FAIL: "REGISTERED_FAIL",
        SERVER_ERROR: "SERVER_ERROR", // Lỗi hệ thống
        BAD_REQUEST: "BAD_REQUEST",
        MISSING_DATA: "MISSING_DATA" // input không hợp lệ
    }
};