/**
 * Interface / Strategy Cơ sở
 */
class EnrollmentStrategy {
  execute(currentEnrolledIds, selectedUserIds) {
    throw new Error("Phương thức execute() phải được cài đặt!");
  }
}

/**
 * Strategy Delta: Phân tách danh sách ID để xác định chính xác User cần THÊM và User cần XÓA
 */
class DeltaEnrollmentStrategy extends EnrollmentStrategy {
  execute(currentEnrolledIds = [], selectedUserIds = []) {
    const currentSet = new Set(currentEnrolledIds);
    const selectedSet = new Set(selectedUserIds);

    // Học viên được chọn mới nhưng chưa có trong CSDL -> Cần THÊM
    const userIdsToAdd = selectedUserIds.filter((id) => !currentSet.has(id));

    // Học viên đã có trong CSDL nhưng không còn trong danh sách chọn -> Cần XÓA
    const userIdsToRemove = currentEnrolledIds.filter((id) => !selectedSet.has(id));

    return { userIdsToAdd, userIdsToRemove };
  }
}

module.exports = {
  DeltaEnrollmentStrategy,
};