/**
 * Standardized API Response
 */

const { HTTP_STATUS } = require("../constants");

class APIResponse {
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data       = data;
    this.message    = message;
    this.success    = statusCode < 400;
    this.timestamp  = new Date();
  }

  // ── Static factories ────────────────────────────────────────────────────

  /** 200 OK */
  static success(data, message = "Success", statusCode = HTTP_STATUS.OK) {
    return new APIResponse(statusCode, data, message);
  }

  /** 201 Created */
  static created(data, message = "Created successfully") {
    return new APIResponse(HTTP_STATUS.CREATED, data, message);
  }

  /** 200 OK for update operations */
  static updated(data, message = "Updated successfully") {
    return new APIResponse(HTTP_STATUS.OK, data, message);
  }

  /** 204 No Content (for deletes — no body sent) */
  static noContent() {
    return new APIResponse(HTTP_STATUS.NO_CONTENT, null, "Deleted successfully");
  }

  /** Generic failure (use APIError for thrown errors instead) */
  static failure(statusCode, message = "Request failed") {
    return new APIResponse(statusCode, null, message);
  }

  /**
   * Paginated list response
   * Returns a plain object (not an APIResponse instance) for consistency
   * with how controllers call res.json() directly
   */
  static paginated(data, total, page, limit, message = "Success") {
    return {
      success: true,
      statusCode: HTTP_STATUS.OK,
      message,
      data,
      pagination: {
        total,
        page:       parseInt(page),
        limit:      parseInt(limit),
        pages:      Math.ceil(total / (parseInt(limit) || 1)),
        hasNext:    parseInt(page) < Math.ceil(total / parseInt(limit)),
        hasPrev:    parseInt(page) > 1,
      },
      timestamp: new Date(),
    };
  }

  /**
   * Simple list response (no pagination)
   */
  static list(data, message = "Success") {
    return {
      success:    true,
      statusCode: HTTP_STATUS.OK,
      message,
      data,
      count:      Array.isArray(data) ? data.length : 0,
      timestamp:  new Date(),
    };
  }

  // ── Serialization ────────────────────────────────────────────────────────

  toJSON() {
    return {
      success:    this.success,
      statusCode: this.statusCode,
      message:    this.message,
      data:       this.data,
      timestamp:  this.timestamp,
    };
  }
}

module.exports = APIResponse;