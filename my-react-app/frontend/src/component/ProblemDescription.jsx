export default function ProblemDescription() {
  return (
    <div
      className="h-100 overflow-y-auto p-4 bg-white text-start border-end"
      style={{ maxHeight: "calc(100vh - 57px)" }}
    >
      {/* Tiêu đề & Độ khó */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <h2 className="fw-bold m-0 text-dark" style={{ fontSize: "28px" }}>
          1. Two Sum
        </h2>
        <span
          className="badge bg-primary bg-opacity-10 text-primary rounded-pill px-3 py-1.5 fw-bold"
          style={{ fontSize: "12px", letterSpacing: "0.5px" }}
        >
          EASY
        </span>
      </div>

      {/* Đề bài */}
      <div
        className="text-secondary mb-4"
        style={{ fontSize: "15px", lineHeight: "1.6" }}
      >
        <p>
          Given an array of integers{" "}
          <code className="bg-light px-1.5 py-0.5 rounded text-dark fw-semibold">
            nums
          </code>{" "}
          and an integer{" "}
          <code className="bg-light px-1.5 py-0.5 rounded text-dark fw-semibold">
            target
          </code>
          , return indices of the two numbers such that they add up to{" "}
          <code className="bg-light px-1.5 py-0.5 rounded text-dark fw-semibold">
            target
          </code>
          .
        </p>
        <p>
          You may assume that each input would have{" "}
          <strong>exactly one solution</strong>, and you may not use the same
          element twice.
        </p>
        <p className="fst-italic text-muted">
          You can return the answer in any order.
        </p>
      </div>

      {/* Phần Ví dụ */}
      <div className="mb-4">
        <h5 className="fw-bold text-dark mb-3" style={{ fontSize: "16px" }}>
          Examples
        </h5>

        {/* Ví dụ 1 */}
        <div className="card bg-light border-0 rounded-3 p-3.5 mb-3">
          <div className="fw-bold text-primary small mb-1">Example 1:</div>
          <div
            className="font-monospace text-dark small"
            style={{ lineHeight: "1.7" }}
          >
            <strong>Input:</strong> nums = [2,7,11,15], target = 9 <br />
            <strong>Output:</strong> [0,1] <br />
            <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we
            return [0, 1].
          </div>
        </div>

        {/* Ví dụ 2 */}
        <div className="card bg-light border-0 rounded-3 p-3.5">
          <div className="fw-bold text-primary small mb-1">Example 2:</div>
          <div className="font-monospace text-dark small">
            <strong>Input:</strong> nums = [3,2,4], target = 6 <br />
            <strong>Output:</strong> [1,2]
          </div>
        </div>
      </div>

      {/* Ràng buộc - Constraints */}
      <div className="mb-4">
        <h5 className="fw-bold text-dark mb-2" style={{ fontSize: "16px" }}>
          Constraints
        </h5>
        <ul
          className="text-secondary small font-monospace ps-3"
          style={{ lineHeight: "1.8" }}
        >
          <li>2 &le; nums.length &le; 10⁴</li>
          <li>-10⁹ &le; nums[i] &le; 10⁹</li>
          <li>-10⁹ &le; target &le; 10⁹</li>
          <li>Only one valid answer exists.</li>
        </ul>
      </div>

      {/* Gợi ý thuật toán (Hint Box)
      <div className="card border-0 rounded-4 p-3.5 text-white d-flex flex-row gap-3 align-items-start" style={{ backgroundColor: "#3525cd" }}>
        <i className="fa-regular fa-lightbulb fs-4 mt-0.5"></i>
        <div>
          <div className="fw-bold mb-1" style={{ fontSize: "15px" }}>Algorithm Hint</div>
          <p className="mb-0 opacity-75 small" style={{ lineHeight: "1.5" }}>
            Consider using a Hash Map to store the complement of each number. This allows for a single-pass solution with O(n) time complexity.
          </p>
        </div>
      </div> */}
    </div>
  );
}
