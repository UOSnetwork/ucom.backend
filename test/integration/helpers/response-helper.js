class ResponseHelper {
  static expectStatusOk(res) {
    expect(res.status).toBe(200);
  }

  static expectStatusNotFound(res) {
    expect(res.status).toBe(404);
  }

  static expectStatusBadRequest(res) {
    expect(res.status).toBe(400);
  }

  static expectStatusUnauthorized(res) {
    expect(res.status).toBe(401);
  }

  static compareObjectArrays(expected, actual) {
    expect(actual.length).toBe(expected.length);

    expected.forEach(post => {
      const existed = actual.find(data => data.id === post.id);

      expect(existed).toBeDefined();
      expect(JSON.stringify(existed)).toBe(JSON.stringify(post));
    });
  }

}

module.exports = ResponseHelper;